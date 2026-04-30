import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessTriage,
  buildFollowUpQuestions,
  buildVisitSummary
} from "./triage-engine.js";
import { createStorage } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === "yes" || value === "true") return true;
  if (value === "no" || value === "false") return false;
  return null;
}

function normalizePayload(body) {
  return {
    patientName: String(body.patientName || "").trim(),
    age: body.age === "" || body.age == null ? null : Number(body.age),
    gender: String(body.gender || "").trim(),
    region: String(body.region || "").trim(),
    symptoms: Array.isArray(body.symptoms)
      ? body.symptoms
      : String(body.symptoms || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    symptomNotes: String(body.symptomNotes || "").trim(),
    symptomDays:
      body.symptomDays === "" || body.symptomDays == null
        ? 0
        : Number(body.symptomDays),
    severity: String(body.severity || "mild").trim(),
    breathingDifficulty: body.breathingDifficulty || null,
    symptomsWorsening: normalizeBoolean(body.symptomsWorsening),
    maxTemperatureC:
      body.maxTemperatureC === "" || body.maxTemperatureC == null
        ? null
        : Number(body.maxTemperatureC),
    chronicConditions: Array.isArray(body.chronicConditions)
      ? body.chronicConditions
      : String(body.chronicConditions || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    medications: String(body.medications || "").trim(),
    allergies: String(body.allergies || "").trim(),
    chestPain: normalizeBoolean(body.chestPain)
  };
}

export function createApp({
  dataFile = path.resolve(__dirname, "../data/carebridge-db.json")
} = {}) {
  const app = express();
  const storage = createStorage(dataFile);

  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, "../public")));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.post("/api/triage", async (request, response) => {
    const payload = normalizePayload(request.body);
    const questions = buildFollowUpQuestions(payload);

    if (questions.length > 0) {
      return response.status(200).json({
        status: "needs_follow_up",
        questions
      });
    }

    const assessment = assessTriage(payload);
    const summary = buildVisitSummary(assessment);
    const session = {
      id: buildId("session"),
      createdAt: new Date().toISOString(),
      intake: payload,
      assessment,
      summary,
      followUps: []
    };

    await storage.createSession(session);

    return response.status(201).json({
      status: "complete",
      session
    });
  });

  app.get("/api/sessions/:sessionId", async (request, response) => {
    const session = await storage.getSession(request.params.sessionId);

    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }

    return response.json({ session });
  });

  app.post("/api/sessions/:sessionId/follow-ups", async (request, response) => {
    const record = {
      id: buildId("followup"),
      createdAt: new Date().toISOString(),
      temperatureC:
        request.body.temperatureC === "" || request.body.temperatureC == null
          ? null
          : Number(request.body.temperatureC),
      symptomChange: String(request.body.symptomChange || "").trim(),
      medicationTaken: String(request.body.medicationTaken || "").trim(),
      note: String(request.body.note || "").trim()
    };

    const result = await storage.addFollowUp(request.params.sessionId, record);

    if (!result) {
      return response.status(404).json({ error: "Session not found" });
    }

    return response.status(201).json(result);
  });

  app.get(/.*/, (_request, response) => {
    response.sendFile(path.resolve(__dirname, "../public/index.html"));
  });

  return app;
}
