import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import Database from "better-sqlite3";
import request from "supertest";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/create-app.js";

const tempRoot = path.join(os.tmpdir(), "carebridge-tests");

async function buildClient() {
  const filePath = path.join(
    tempRoot,
    `carebridge-${Date.now()}-${Math.random().toString(16).slice(2)}.db`
  );
  await fs.mkdir(tempRoot, { recursive: true });
  const app = createApp({ dataFile: filePath });
  return { client: request(app), filePath };
}

async function cleanupDb(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {}
  try {
    await fs.unlink(filePath + "-wal");
  } catch {}
  try {
    await fs.unlink(filePath + "-shm");
  } catch {}
}

async function loginAs(client, username, password) {
  const res = await client.post("/api/auth/login").send({ username, password });
  return res.body.token;
}

describe("CareBridge API", () => {
  beforeEach(async () => {
    await fs.mkdir(tempRoot, { recursive: true });
  });

  it("returns follow-up questions before assessment when context is incomplete", async () => {
    const { client, filePath } = await buildClient();

    try {
      const response = await client.post("/api/triage").send({
        patientName: "Liu",
        age: 52,
        gender: "female",
        region: "county",
        symptoms: ["fever", "chest tightness"],
        symptomNotes: "Fever and tight chest",
        symptomDays: 2,
        severity: "moderate"
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("needs_follow_up");
      expect(response.body.questions.length).toBeGreaterThan(0);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("creates a triage session when enough context is supplied", async () => {
    const { client, filePath } = await buildClient();

    try {
      const response = await client.post("/api/triage").send({
        patientName: "Yan",
        age: 30,
        gender: "female",
        region: "township",
        symptoms: ["fever", "cough"],
        symptomNotes: "Fever for three days and cough worse today",
        symptomDays: 3,
        severity: "moderate",
        breathingDifficulty: "mild",
        coughType: "dry",
        nightSymptoms: "yes",
        chillsOrSweats: "none",
        symptomsWorsening: true,
        maxTemperatureC: 38.7,
        chronicConditions: [],
        medications: "paracetamol",
        allergies: "none",
        chestPain: false
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("complete");
      expect(response.body.session.id).toBeTruthy();
      expect(response.body.session.assessment.actionLabel).toBe(
        "24小时内线下就医"
      );
      expect(response.body.session.followUpPlan.recommendedWindowHours).toBe(12);
      expect(response.body.session.followUpPlan.status).toBe("scheduled");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("returns the generated follow-up plan for a session", async () => {
    const { client, filePath } = await buildClient();

    try {
      const triage = await client.post("/api/triage").send({
        patientName: "Plan Test",
        age: 22,
        gender: "male",
        region: "city",
        symptoms: ["sore throat"],
        symptomNotes: "Mild sore throat since this morning",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.2,
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      const sessionId = triage.body.session.id;
      const response = await client.get(`/api/sessions/${sessionId}/follow-up-plan`);

      expect(response.status).toBe(200);
      expect(response.body.followUpPlan.status).toBe("scheduled");
      expect(response.body.followUpPlan.recommendedWindowHours).toBe(36);
      expect(response.body.followUpPlan.recommendedAt).toBeTruthy();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("stores and returns follow-up notes for an existing triage session", async () => {
    const { client, filePath } = await buildClient();

    try {
      const triage = await client.post("/api/triage").send({
        patientName: "Qiao",
        age: 24,
        gender: "male",
        region: "county",
        symptoms: ["sore throat"],
        symptomNotes: "Mild sore throat and no fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.1,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      const sessionId = triage.body.session.id;

      const createFollowUp = await client
        .post(`/api/sessions/${sessionId}/follow-ups`)
        .send({
          temperatureC: 37.3,
          symptomChange: "throat is still uncomfortable but stable",
          medicationTaken: "warm water",
          note: "No new symptoms"
        });

      expect(createFollowUp.status).toBe(201);
      expect(createFollowUp.body.record.id).toBeTruthy();

      const listFollowUps = await client.get(`/api/sessions/${sessionId}`);

      expect(listFollowUps.status).toBe(200);
      expect(listFollowUps.body.session.followUps).toHaveLength(1);
      expect(listFollowUps.body.session.followUps[0].note).toBe("No new symptoms");
      expect(listFollowUps.body.session.followUpPlan.status).toBe("completed");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("reassesses a session after a worsening follow-up and stores reassessment history", async () => {
    const { client, filePath } = await buildClient();

    try {
      const triage = await client.post("/api/triage").send({
        patientName: "Reassess Test",
        age: 30,
        gender: "female",
        region: "township",
        symptoms: ["fever", "cough"],
        symptomNotes: "Low fever and cough since yesterday",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.6,
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        coughType: "dry",
        nightSymptoms: "no",
        chillsOrSweats: "none"
      });

      const sessionId = triage.body.session.id;
      expect(triage.body.session.assessment.riskLevel).toBe("Level 3");

      const followUp = await client
        .post(`/api/sessions/${sessionId}/follow-ups`)
        .send({
          temperatureC: 39.2,
          symptomChange: "Symptoms are getting worse today",
          medicationTaken: "acetaminophen",
          note: "Breathing feels harder than before"
        });

      expect(followUp.status).toBe(201);
      expect(followUp.body.session.latestReassessment).toBeTruthy();
      expect(followUp.body.session.assessment.riskLevel).toBe("Level 1");

      const reassessments = await client.get(`/api/sessions/${sessionId}/reassessments`);
      expect(reassessments.status).toBe(200);
      expect(reassessments.body.reassessments).toHaveLength(1);
      expect(reassessments.body.reassessments[0].previousRiskLevel).toBe("Level 3");
      expect(reassessments.body.reassessments[0].newRiskLevel).toBe("Level 1");

      const timeline = await client.get(`/api/sessions/${sessionId}/timeline`);
      expect(timeline.status).toBe(200);
      expect(timeline.body.timeline.some((event) => event.type === "reassessment_created")).toBe(true);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("lists recent triage sessions for the dashboard", async () => {
    const { client, filePath } = await buildClient();

    try {
      await client.post("/api/triage").send({
        patientName: "Recent One",
        age: 24,
        gender: "male",
        region: "county",
        symptoms: ["sore throat"],
        symptomNotes: "Mild sore throat and no fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.1,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      await client.post("/api/triage").send({
        patientName: "Recent Two",
        age: 61,
        gender: "female",
        region: "village",
        symptoms: ["fever", "cough"],
        symptomNotes: "Fever for three days and worsening cough",
        symptomDays: 3,
        severity: "moderate",
        breathingDifficulty: "mild",
        coughType: "productive",
        nightSymptoms: "yes",
        chillsOrSweats: "chills",
        symptomsWorsening: true,
        maxTemperatureC: 38.6,
        chronicConditions: ["hypertension"],
        medications: "paracetamol",
        allergies: "none",
        chestPain: false
      });

      const response = await client.get("/api/sessions");

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(2);
      expect(response.body.sessions[0].patientName).toBe("Recent Two");
      expect(response.body.sessions[0].actionLabel).toBe("24小时内线下就医");
      expect(response.body.sessions[1].patientName).toBe("Recent One");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API lists sessions with extended fields", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      await client.post("/api/triage").send({
        patientName: "Admin Test",
        age: 45,
        gender: "male",
        region: "city",
        symptoms: ["headache"],
        symptomNotes: "Mild headache",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const response = await client.get("/api/admin/sessions").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].patientName).toBe("Admin Test");
      expect(response.body.sessions[0].age).toBe(45);
      expect(response.body.sessions[0].gender).toBe("male");
      expect(response.body.sessions[0].redFlags).toBeDefined();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API searches sessions by query", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      await client.post("/api/triage").send({
        patientName: "Alice",
        age: 30,
        gender: "female",
        region: "riverside",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 38.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      await client.post("/api/triage").send({
        patientName: "Bob",
        age: 50,
        gender: "male",
        region: "mountain",
        symptoms: ["cough"],
        symptomNotes: "cough",
        symptomDays: 2,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      const response = await client.get("/api/admin/sessions?q=alice").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].patientName).toBe("Alice");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API returns session detail with full data", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      const triage = await client.post("/api/triage").send({
        patientName: "Detail Test",
        age: 35,
        gender: "female",
        region: "city",
        symptoms: ["fever", "cough"],
        symptomNotes: "fever and cough",
        symptomDays: 2,
        severity: "moderate",
        breathingDifficulty: "mild",
        coughType: "dry",
        nightSymptoms: "no",
        chillsOrSweats: "none",
        symptomsWorsening: true,
        maxTemperatureC: 38.5,
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false
      });

      const sessionId = triage.body.session.id;

      const response = await client.get(`/api/admin/sessions/${sessionId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.session.id).toBe(sessionId);
      expect(response.body.session.intake).toBeDefined();
      expect(response.body.session.assessment).toBeDefined();
      expect(response.body.session.summary).toBeDefined();
      expect(response.body.session.followUps).toBeDefined();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("migrates legacy JSON sessions into SQLite on first startup", async () => {
    const filePath = path.join(
      tempRoot,
      `carebridge-${Date.now()}-${Math.random().toString(16).slice(2)}.db`
    );
    const legacyPath = path.join(tempRoot, "carebridge-db.json");

    await fs.mkdir(tempRoot, { recursive: true });
    await fs.writeFile(
      legacyPath,
      JSON.stringify({
        sessions: [
          {
            id: "legacy_session_1",
            createdAt: "2026-05-01T00:00:00.000Z",
            intake: {
              patientName: "Legacy Patient",
              age: 40,
              gender: "female",
              region: "legacy county",
              symptoms: ["fever"],
              symptomNotes: "Legacy note",
              symptomDays: 2,
              severity: "moderate",
              chronicConditions: [],
              medications: "none",
              allergies: "none"
            },
            assessment: {
              symptoms: ["fever"],
              riskLevel: "Level 2",
              actionLabel: "24小时内线下就医",
              redFlags: [],
              suggestedDepartment: "全科门诊",
              reasoning: ["Legacy reasoning"],
              immediateSteps: ["Legacy step"],
              doctorQuestions: ["Legacy doctor question"],
              scoreBreakdown: {
                base: 3,
                modifiers: 1,
                combinations: 0,
                total: 4,
                details: []
              },
              warning: "Legacy warning"
            },
            summary: {
              chiefComplaint: "患者因发热就诊",
              onset: "2 天前开始出现症状",
              mainSymptoms: "发热",
              associatedSymptoms: "Legacy note",
              medicalHistory: "无明确慢病史",
              currentMedication: "none",
              allergies: "none",
              riskNotes: "当前未识别明确红旗症状",
              suggestedDepartment: "全科门诊",
              doctorQuestions: ["Legacy doctor question"],
              summaryText: "Legacy summary"
            },
            followUps: []
          }
        ]
      }, null, 2)
    );

    const app = createApp({ dataFile: filePath });
    const client = request(app);

    try {
      const response = await client.get("/api/sessions");

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].patientName).toBe("Legacy Patient");
    } finally {
      await cleanupDb(filePath);
      try {
        await fs.unlink(legacyPath);
      } catch {}
    }
  });

  it("admin API updates session admin fields via PATCH", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      const triage = await client.post("/api/triage").send({
        patientName: "Patch Test",
        age: 40,
        gender: "male",
        region: "city",
        symptoms: ["headache"],
        symptomNotes: "mild headache",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      expect(triage.status).toBe(201);

      const sessionId = triage.body.session.id;

      const patchRes = await client
        .patch(`/api/admin/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          adminNote: "Reviewed by admin",
          adminStatus: "reviewed",
          tags: ["follow-up-needed"]
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.session.adminNote).toBe("Reviewed by admin");
      expect(patchRes.body.session.adminStatus).toBe("reviewed");
      expect(patchRes.body.session.tags).toEqual(["follow-up-needed"]);
      expect(patchRes.body.session.reviewedAt).toBeTruthy();

      const getRes = await client.get(`/api/admin/sessions/${sessionId}`).set("Authorization", `Bearer ${token}`);
      expect(getRes.body.session.adminNote).toBe("Reviewed by admin");
      expect(getRes.body.session.adminStatus).toBe("reviewed");
      expect(getRes.body.session.reviewedAt).toBeTruthy();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin queue endpoint returns grouped oversight queues", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      const triage = await client.post("/api/triage").send({
        patientName: "Queue Test",
        age: 68,
        gender: "male",
        region: "county",
        symptoms: ["fever", "cough", "chest tightness"],
        symptomNotes: "worsening symptoms",
        symptomDays: 4,
        severity: "severe",
        breathingDifficulty: "moderate",
        symptomsWorsening: true,
        maxTemperatureC: 39.1,
        chillsOrSweats: "both",
        chronicConditions: ["hypertension"],
        medications: "none",
        allergies: "none",
        chestPain: false,
        coughType: "productive",
        nightSymptoms: "yes",
        painRadiation: "none",
        activityRelation: "both",
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const sessionId = triage.body.session.id;

      await client
        .patch(`/api/admin/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ adminStatus: "urgent" });

      const response = await client
        .get("/api/admin/queues")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.highRiskUnresolved).toBeDefined();
      expect(response.body.urgentAdminAttention).toBeDefined();
      expect(response.body.newlyCreated).toBeDefined();
      expect(response.body.overdueStuck).toBeDefined();
      expect(response.body.recentlyUpdated).toBeDefined();
      expect(response.body.overdueDoctorReply).toBeDefined();
      expect(response.body.riskUpgraded).toBeDefined();
      expect(response.body.urgentAdminAttention.some((session) => session.id === sessionId)).toBe(true);
      expect(response.body.highRiskUnresolved.some((session) => session.id === sessionId)).toBe(true);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin SLA endpoint returns operational timing metrics", async () => {
    const { client, filePath } = await buildClient();

    try {
      const adminToken = await loginAs(client, "admin", "admin123");
      const doctorToken = await loginAs(client, "doctor", "doctor123");

      const triage = await client.post("/api/triage").send({
        patientName: "SLA Test",
        age: 67,
        gender: "male",
        region: "county",
        symptoms: ["fever", "cough", "chest tightness"],
        symptomNotes: "worsening symptoms",
        symptomDays: 4,
        severity: "severe",
        breathingDifficulty: "moderate",
        symptomsWorsening: true,
        maxTemperatureC: 39.1,
        chillsOrSweats: "both",
        chronicConditions: ["hypertension"],
        medications: "none",
        allergies: "none",
        chestPain: false,
        coughType: "productive",
        nightSymptoms: "yes",
        painRadiation: "none",
        activityRelation: "both",
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const sessionId = triage.body.session.id;
      await client
        .patch(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ doctorStatus: "under_review" });

      const response = await client
        .get("/api/admin/sla")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(typeof response.body.highRiskReviewedOnTime).toBe("number");
      expect(typeof response.body.highRiskReviewedLate).toBe("number");
      expect(typeof response.body.waitingDoctorReplyOverdue).toBe("number");
      expect(typeof response.body.recentRiskUpgrades).toBe("number");
      expect(response.body.avgHighRiskReviewMinutes === null || typeof response.body.avgHighRiskReviewMinutes === "number").toBe(true);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API returns stats with risk distribution", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      await client.post("/api/triage").send({
        patientName: "Stats One",
        age: 30,
        gender: "female",
        region: "city",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.5,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      await client.post("/api/triage").send({
        patientName: "Stats Two",
        age: 60,
        gender: "male",
        region: "village",
        symptoms: ["fever", "cough", "chest tightness"],
        symptomNotes: "severe symptoms",
        symptomDays: 3,
        severity: "severe",
        breathingDifficulty: "moderate",
        symptomsWorsening: true,
        maxTemperatureC: 39.2,
        chillsOrSweats: "chills",
        chronicConditions: ["diabetes"],
        medications: "none",
        allergies: "none",
        chestPain: true,
        coughType: "productive",
        nightSymptoms: "yes",
        painRadiation: "none",
        activityRelation: "both"
      });

      const statsRes = await client.get("/api/admin/stats").set("Authorization", `Bearer ${token}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.total).toBe(2);
      expect(statsRes.body.riskDistribution).toBeDefined();
      expect(typeof statsRes.body.riskDistribution["Level 1"]).toBe("number");
      expect(typeof statsRes.body.riskDistribution["Level 2"]).toBe("number");
      expect(typeof statsRes.body.highRiskRecent).toBe("number");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API filters sessions by risk level", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");

      await client.post("/api/triage").send({
        patientName: "Filter Mild",
        age: 25,
        gender: "male",
        region: "city",
        symptoms: ["sore throat"],
        symptomNotes: "mild",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      await client.post("/api/triage").send({
        patientName: "Filter Severe",
        age: 70,
        gender: "female",
        region: "village",
        symptoms: ["fever", "cough", "chest tightness"],
        symptomNotes: "severe",
        symptomDays: 5,
        severity: "severe",
        breathingDifficulty: "severe",
        symptomsWorsening: true,
        maxTemperatureC: 39.5,
        chillsOrSweats: "both",
        chronicConditions: ["hypertension"],
        medications: "none",
        allergies: "none",
        chestPain: true,
        coughType: "productive",
        nightSymptoms: "yes",
        painRadiation: "none",
        activityRelation: "both",
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const filtered = await client.get("/api/admin/sessions?riskLevel=Level 1").set("Authorization", `Bearer ${token}`);

      expect(filtered.status).toBe(200);
      expect(filtered.body.sessions.length).toBeGreaterThanOrEqual(1);
      filtered.body.sessions.forEach((s) => {
        expect(s.riskLevel).toBe("Level 1");
      });
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("auth API logs in with valid credentials", async () => {
    const { client, filePath } = await buildClient();

    try {
      const response = await client.post("/api/auth/login").send({
        username: "doctor",
        password: "doctor123"
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.role).toBe("doctor");
      expect(response.body.user.displayName).toBe("Dr. Zhang");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("auth API upgrades legacy password hashes after a successful login", async () => {
    const { client, filePath } = await buildClient();

    try {
      const db = new Database(filePath);
      const legacyHash = crypto.createHash("sha256").update("doctor123").digest("hex");
      db.prepare("UPDATE users SET password_hash = ? WHERE username = ?").run(legacyHash, "doctor");
      db.close();

      const response = await client.post("/api/auth/login").send({
        username: "doctor",
        password: "doctor123"
      });

      expect(response.status).toBe(200);

      const verifyDb = new Database(filePath, { readonly: true });
      const row = verifyDb.prepare("SELECT password_hash FROM users WHERE username = ?").get("doctor");
      verifyDb.close();

      expect(row.password_hash.startsWith("scrypt$")).toBe(true);
      expect(row.password_hash).not.toBe(legacyHash);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("auth API rejects invalid credentials", async () => {
    const { client, filePath } = await buildClient();

    try {
      const response = await client.post("/api/auth/login").send({
        username: "doctor",
        password: "wrongpassword"
      });

      expect(response.status).toBe(401);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("auth API returns current user with valid token", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "admin", "admin123");
      const response = await client.get("/api/auth/me").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe("admin");
      expect(response.body.user.role).toBe("admin");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor API requires authentication", async () => {
    const { client, filePath } = await buildClient();

    try {
      const response = await client.get("/api/doctor/sessions");
      expect(response.status).toBe(401);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor API lists sessions for authenticated doctor", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      await client.post("/api/triage").send({
        patientName: "Doctor Test",
        age: 30,
        gender: "female",
        region: "city",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.5,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const response = await client.get("/api/doctor/sessions").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].patientName).toBe("Doctor Test");
      expect(response.body.sessions[0].lastMessage).toBeNull();
      expect(response.body.sessions[0].messageCount).toBe(0);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor and patient can exchange messages", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      const triage = await client.post("/api/triage").send({
        patientName: "Chat Test",
        age: 40,
        gender: "male",
        region: "city",
        symptoms: ["headache"],
        symptomNotes: "mild headache",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const sessionId = triage.body.session.id;

      // Patient sends a message
      const patientMsg = await client
        .post(`/api/sessions/${sessionId}/messages`)
        .send({ content: "I have a headache" });

      expect(patientMsg.status).toBe(201);
      expect(patientMsg.body.message.senderType).toBe("patient");

      // Doctor sends a reply
      const doctorMsg = await client
        .post(`/api/doctor/sessions/${sessionId}/messages`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "How long have you had this headache?" });

      expect(doctorMsg.status).toBe(201);
      expect(doctorMsg.body.message.senderType).toBe("doctor");

      // Get messages
      const messages = await client
        .get(`/api/doctor/sessions/${sessionId}/messages`)
        .set("Authorization", `Bearer ${token}`);

      expect(messages.status).toBe(200);
      expect(messages.body.messages).toHaveLength(2);
      expect(messages.body.messages[0].content).toBe("I have a headache");
      expect(messages.body.messages[1].content).toBe("How long have you had this headache?");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor dashboard returns stats and queues", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      // Create a session
      await client.post("/api/triage").send({
        patientName: "Dashboard Test",
        age: 30,
        gender: "female",
        region: "city",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.5,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const response = await client
        .get("/api/doctor/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalActive).toBe(1);
      expect(response.body.stats.highRisk).toBe(0);
      expect(response.body.queues).toBeDefined();
      expect(response.body.queues.recent).toHaveLength(1);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor session detail includes timeline events", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      const triage = await client.post("/api/triage").send({
        patientName: "Timeline Test",
        age: 33,
        gender: "female",
        region: "city",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.8,
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        chillsOrSweats: "none"
      });

      const sessionId = triage.body.session.id;
      await client.post(`/api/sessions/${sessionId}/messages`).send({ content: "Patient follow-up message" });

      const detail = await client
        .get(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(detail.status).toBe(200);
      expect(Array.isArray(detail.body.session.timeline)).toBe(true);
      expect(detail.body.session.timeline.some((event) => event.type === "triage_created")).toBe(true);
      expect(detail.body.session.timeline.some((event) => event.type === "patient_message_sent")).toBe(true);
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor can update session status and note", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      const triage = await client.post("/api/triage").send({
        patientName: "Status Test",
        age: 40,
        gender: "male",
        region: "city",
        symptoms: ["headache"],
        symptomNotes: "mild headache",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const sessionId = triage.body.session.id;

      // Update doctor status
      const statusRes = await client
        .patch(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ doctorStatus: "under_review" });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.session.doctorStatus).toBe("under_review");
      expect(statusRes.body.session.reviewedAt).toBeTruthy();

      // Update doctor note
      const noteRes = await client
        .patch(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ doctorNote: "Patient has mild symptoms, monitor for 24h" });

      expect(noteRes.status).toBe(200);
      expect(noteRes.body.session.doctorNote).toBe("Patient has mild symptoms, monitor for 24h");

      // Update priority
      const priorityRes = await client
        .patch(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ priorityLevel: "high" });

      expect(priorityRes.status).toBe(200);
      expect(priorityRes.body.session.priorityLevel).toBe("high");

      // Verify persistence via detail endpoint
      const detail = await client
        .get(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(detail.body.session.doctorStatus).toBe("under_review");
      expect(detail.body.session.doctorNote).toBe("Patient has mild symptoms, monitor for 24h");
      expect(detail.body.session.priorityLevel).toBe("high");
      expect(detail.body.session.reviewedAt).toBeTruthy();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("conversation state updates on message send", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      const triage = await client.post("/api/triage").send({
        patientName: "Conv State Test",
        age: 25,
        gender: "female",
        region: "city",
        symptoms: ["sore throat"],
        symptomNotes: "sore throat",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.0,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const sessionId = triage.body.session.id;

      // Initial state should be 'none'
      const initial = await client
        .get(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(initial.body.session.conversationState).toBe("none");

      // Patient sends message -> waiting_doctor
      await client
        .post(`/api/sessions/${sessionId}/messages`)
        .send({ content: "My throat hurts" });

      const afterPatient = await client
        .get(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(afterPatient.body.session.conversationState).toBe("waiting_doctor");
      expect(afterPatient.body.session.lastPatientMessageAt).toBeTruthy();

      // Doctor sends message -> waiting_patient
      await client
        .post(`/api/doctor/sessions/${sessionId}/messages`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "How long has this been going on?" });

      const afterDoctor = await client
        .get(`/api/doctor/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(afterDoctor.body.session.conversationState).toBe("waiting_patient");
      expect(afterDoctor.body.session.lastDoctorMessageAt).toBeTruthy();
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("doctor session list supports filters", async () => {
    const { client, filePath } = await buildClient();

    try {
      const token = await loginAs(client, "doctor", "doctor123");

      // Create two sessions
      const s1 = await client.post("/api/triage").send({
        patientName: "Filter A",
        age: 30,
        gender: "male",
        region: "city",
        symptoms: ["fever"],
        symptomNotes: "fever",
        symptomDays: 1,
        severity: "mild",
        breathingDifficulty: "none",
        symptomsWorsening: false,
        maxTemperatureC: 37.5,
        chillsOrSweats: "none",
        chronicConditions: [],
        medications: "none",
        allergies: "none",
        chestPain: false,
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      const s2 = await client.post("/api/triage").send({
        patientName: "Filter B",
        age: 50,
        gender: "female",
        region: "village",
        symptoms: ["fever", "cough", "chest tightness"],
        symptomNotes: "severe",
        symptomDays: 3,
        severity: "severe",
        breathingDifficulty: "severe",
        symptomsWorsening: true,
        maxTemperatureC: 39.5,
        chillsOrSweats: "both",
        chronicConditions: ["hypertension"],
        medications: "none",
        allergies: "none",
        chestPain: true,
        coughType: "productive",
        nightSymptoms: "yes",
        painRadiation: "none",
        activityRelation: "both",
        consciousnessChanges: "no",
        visionChanges: "no",
        numbness: "no"
      });

      // Update one to under_review
      await client
        .patch(`/api/doctor/sessions/${s2.body.session.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ doctorStatus: "under_review" });

      // Filter by doctorStatus
      const filtered = await client
        .get("/api/doctor/sessions?doctorStatus=under_review")
        .set("Authorization", `Bearer ${token}`);

      expect(filtered.status).toBe(200);
      expect(filtered.body.sessions).toHaveLength(1);
      expect(filtered.body.sessions[0].patientName).toBe("Filter B");

      // Filter by riskLevel
      const riskFiltered = await client
        .get("/api/doctor/sessions?riskLevel=Level 1")
        .set("Authorization", `Bearer ${token}`);

      expect(riskFiltered.status).toBe(200);
      expect(riskFiltered.body.sessions.length).toBeGreaterThanOrEqual(1);
      riskFiltered.body.sessions.forEach(s => {
        expect(s.riskLevel).toBe("Level 1");
      });
    } finally {
      await cleanupDb(filePath);
    }
  });
});
