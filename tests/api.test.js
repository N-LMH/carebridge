import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
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

      const response = await client.get("/api/admin/sessions");

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

      const response = await client.get("/api/admin/sessions?q=alice");

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

      const response = await client.get(`/api/admin/sessions/${sessionId}`);

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
        .send({
          adminNote: "Reviewed by admin",
          adminStatus: "reviewed",
          tags: ["follow-up-needed"]
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.session.adminNote).toBe("Reviewed by admin");
      expect(patchRes.body.session.adminStatus).toBe("reviewed");
      expect(patchRes.body.session.tags).toEqual(["follow-up-needed"]);

      const getRes = await client.get(`/api/admin/sessions/${sessionId}`);
      expect(getRes.body.session.adminNote).toBe("Reviewed by admin");
      expect(getRes.body.session.adminStatus).toBe("reviewed");
    } finally {
      await cleanupDb(filePath);
    }
  });

  it("admin API returns stats with risk distribution", async () => {
    const { client, filePath } = await buildClient();

    try {
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

      const statsRes = await client.get("/api/admin/stats");

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

      const filtered = await client.get("/api/admin/sessions?riskLevel=Level 1");

      expect(filtered.status).toBe(200);
      expect(filtered.body.sessions.length).toBeGreaterThanOrEqual(1);
      filtered.body.sessions.forEach((s) => {
        expect(s.riskLevel).toBe("Level 1");
      });
    } finally {
      await cleanupDb(filePath);
    }
  });
});
