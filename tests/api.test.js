import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/create-app.js";

const tempRoot = path.join(os.tmpdir(), "carebridge-tests");

async function buildClient() {
  const filePath = path.join(
    tempRoot,
    `carebridge-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
  );
  await fs.mkdir(tempRoot, { recursive: true });
  const app = createApp({ dataFile: filePath });
  return { client: request(app), filePath };
}

describe("CareBridge API", () => {
  beforeEach(async () => {
    await fs.mkdir(tempRoot, { recursive: true });
  });

  it("returns follow-up questions before assessment when context is incomplete", async () => {
    const { client } = await buildClient();

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
  });

  it("creates a triage session when enough context is supplied", async () => {
    const { client } = await buildClient();

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
  });

  it("stores and returns follow-up notes for an existing triage session", async () => {
    const { client } = await buildClient();

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
  });

  it("lists recent triage sessions for the dashboard", async () => {
    const { client } = await buildClient();

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
  });
});
