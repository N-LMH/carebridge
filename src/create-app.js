import crypto from "node:crypto";
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

function validateTriagePayload(body) {
  const errors = [];

  // symptoms: required, must be non-empty after splitting and trimming
  const symptoms = Array.isArray(body.symptoms)
    ? body.symptoms
    : String(body.symptoms || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  if (symptoms.length === 0) {
    errors.push({ field: "symptoms", message: "Symptoms are required" });
  }

  // symptomDays: if provided, must be >= 0 and <= 365
  if (body.symptomDays != null && body.symptomDays !== "") {
    const days = Number(body.symptomDays);
    if (Number.isNaN(days) || days < 0 || days > 365) {
      errors.push({ field: "symptomDays", message: "Symptom days must be between 0 and 365" });
    }
  }

  // age: if provided, must be >= 0 and <= 150
  if (body.age != null && body.age !== "") {
    const age = Number(body.age);
    if (Number.isNaN(age) || age < 0 || age > 150) {
      errors.push({ field: "age", message: "Age must be between 0 and 150" });
    }
  }

  // severity: if provided, must be one of "mild", "moderate", "severe"
  if (body.severity != null && body.severity !== "") {
    const severity = String(body.severity).trim();
    if (!["mild", "moderate", "severe"].includes(severity)) {
      errors.push({ field: "severity", message: "Severity must be one of: mild, moderate, severe" });
    }
  }

  // maxTemperatureC: if provided, must be >= 30 and <= 45
  if (body.maxTemperatureC != null && body.maxTemperatureC !== "") {
    const temp = Number(body.maxTemperatureC);
    if (Number.isNaN(temp) || temp < 30 || temp > 45) {
      errors.push({ field: "maxTemperatureC", message: "Max temperature must be between 30 and 45" });
    }
  }

  // patientName: max 100 characters
  if (String(body.patientName || "").length > 100) {
    errors.push({ field: "patientName", message: "Patient name must be at most 100 characters" });
  }

  // symptomNotes: max 2000 characters
  if (String(body.symptomNotes || "").length > 2000) {
    errors.push({ field: "symptomNotes", message: "Symptom notes must be at most 2000 characters" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

function validateFollowUpPayload(body) {
  const errors = [];

  const hasField =
    (body.temperatureC != null && body.temperatureC !== "") ||
    (body.symptomChange != null && String(body.symptomChange).trim() !== "") ||
    (body.medicationTaken != null && String(body.medicationTaken).trim() !== "") ||
    (body.note != null && String(body.note).trim() !== "");

  if (!hasField) {
    errors.push({ field: "_root", message: "At least one field must be provided" });
  }

  // temperatureC: if provided, must be >= 30 and <= 45
  if (body.temperatureC != null && body.temperatureC !== "") {
    const temp = Number(body.temperatureC);
    if (Number.isNaN(temp) || temp < 30 || temp > 45) {
      errors.push({ field: "temperatureC", message: "Temperature must be between 30 and 45" });
    }
  }

  // note: max 1000 characters
  if (String(body.note || "").length > 1000) {
    errors.push({ field: "note", message: "Note must be at most 1000 characters" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === "yes" || value === "true") return true;
  if (value === "no" || value === "false") return false;
  return null;
}

function normalizeOptionalString(value) {
  if (value == null || value === "") return null;
  return String(value).trim();
}

function normalizeOptionalNumber(value) {
  if (value == null || value === "") return null;
  return Number(value);
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
    chestPain: normalizeBoolean(body.chestPain),
    coughType: normalizeOptionalString(body.coughType),
    nightSymptoms: normalizeOptionalString(body.nightSymptoms),
    chillsOrSweats: normalizeOptionalString(body.chillsOrSweats),
    stoolFrequency: normalizeOptionalNumber(body.stoolFrequency),
    foodIntake: normalizeOptionalString(body.foodIntake),
    dehydrationSigns: normalizeOptionalString(body.dehydrationSigns),
    painRadiation: normalizeOptionalString(body.painRadiation),
    activityRelation: normalizeOptionalString(body.activityRelation),
    consciousnessChanges: normalizeOptionalString(body.consciousnessChanges),
    visionChanges: normalizeOptionalString(body.visionChanges),
    numbness: normalizeOptionalString(body.numbness)
  };
}

export function createApp({
  dataFile = path.resolve(__dirname, "../data/carebridge.db")
} = {}) {
  const app = express();
  const legacyDataFile = path.resolve(path.dirname(dataFile), "carebridge-db.json");
  const storage = createStorage(dataFile, { legacyJsonPath: legacyDataFile });

  app.use(express.json());

  // In-memory session token store
  const sessions = new Map();

  function createToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { userId, createdAt: Date.now() });
    return token;
  }

  function getUserFromToken(req) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const session = sessions.get(token);
    if (!session) return null;
    return storage.getUserById(session.userId);
  }

  function requireAuth(role) {
    return (req, res, next) => {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (role && user.role !== role) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.user = user;
      next();
    };
  }

  const distDir = path.resolve(__dirname, "../dist");

  app.use(express.static(distDir));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  // Auth endpoints
  app.post("/api/auth/login", (request, response) => {
    const { username, password } = request.body;
    if (!username || !password) {
      return response.status(400).json({ error: "Username and password are required" });
    }
    const user = storage.authenticateUser(username, password);
    if (!user) {
      return response.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken(user.id);
    return response.json({ token, user });
  });

  app.get("/api/auth/me", (request, response) => {
    const user = getUserFromToken(request);
    if (!user) {
      return response.status(401).json({ error: "Not authenticated" });
    }
    return response.json({ user });
  });

  // Doctor API endpoints
  app.get("/api/doctor/sessions", requireAuth("doctor"), (request, response) => {
    const q = request.query.q;
    const riskLevel = request.query.riskLevel;
    const sort = request.query.sort;

    const sessions = storage.getDoctorSessions({ q, riskLevel, sort });

    return response.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        patientName: session.intake.patientName || "Unnamed patient",
        age: session.intake.age,
        gender: session.intake.gender,
        region: session.intake.region || "Unknown region",
        symptoms: session.assessment.symptoms,
        actionLabel: session.assessment.actionLabel,
        riskLevel: session.assessment.riskLevel,
        suggestedDepartment: session.assessment.suggestedDepartment,
        followUpCount: session.followUps?.length || 0,
        redFlags: session.assessment.redFlags || [],
        adminStatus: session.adminStatus || 'new',
        lastMessage: session.lastMessage,
        messageCount: session.messageCount
      }))
    });
  });

  app.get("/api/doctor/sessions/:sessionId", requireAuth("doctor"), (request, response) => {
    const session = storage.getDoctorSessionDetail(request.params.sessionId);
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    return response.json({ session });
  });

  app.get("/api/doctor/sessions/:sessionId/messages", requireAuth("doctor"), (request, response) => {
    const messages = storage.getMessages(request.params.sessionId);
    return response.json({ messages });
  });

  app.post("/api/doctor/sessions/:sessionId/messages", requireAuth("doctor"), (request, response) => {
    const { content } = request.body;
    if (!content || !String(content).trim()) {
      return response.status(400).json({ error: "Message content is required" });
    }
    const session = storage.getSession(request.params.sessionId);
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    const message = storage.addMessage(request.params.sessionId, "doctor", request.user.id, String(content).trim());
    return response.status(201).json({ message });
  });

  // Patient-facing message endpoint (no auth required — identified by session)
  app.post("/api/sessions/:sessionId/messages", (request, response) => {
    const { content } = request.body;
    if (!content || !String(content).trim()) {
      return response.status(400).json({ error: "Message content is required" });
    }
    const session = storage.getSession(request.params.sessionId);
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    const message = storage.addMessage(request.params.sessionId, "patient", null, String(content).trim());
    return response.status(201).json({ message });
  });

  app.get("/api/sessions/:sessionId/messages", (request, response) => {
    const session = storage.getSession(request.params.sessionId);
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    const messages = storage.getMessages(request.params.sessionId);
    return response.json({ messages });
  });

  app.get("/api/sessions", async (request, response) => {
    const limit =
      request.query.limit == null ? 8 : Number.parseInt(request.query.limit, 10);
    const sessions = await storage.listSessions(Number.isNaN(limit) ? 8 : limit);

    return response.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        patientName: session.intake.patientName || "Unnamed patient",
        region: session.intake.region || "Unknown region",
        symptoms: session.assessment.symptoms,
        actionLabel: session.assessment.actionLabel,
        riskLevel: session.assessment.riskLevel,
        suggestedDepartment: session.assessment.suggestedDepartment,
        followUpCount: session.followUps?.length || 0
      }))
    });
  });

  app.post("/api/triage", async (request, response) => {
    const validation = validateTriagePayload(request.body);
    if (!validation.valid) {
      return response.status(400).json({
        status: "validation_error",
        errors: validation.errors
      });
    }

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
    const validation = validateFollowUpPayload(request.body);
    if (!validation.valid) {
      return response.status(400).json({
        status: "validation_error",
        errors: validation.errors
      });
    }

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

  // Admin API endpoints
  app.get("/api/admin/sessions", requireAuth("admin"), async (request, response) => {
    const q = request.query.q;
    const riskLevel = request.query.riskLevel;
    const adminStatus = request.query.adminStatus;
    const withinHours = request.query.withinHours ? Number.parseInt(request.query.withinHours, 10) : undefined;
    const minFollowUps = request.query.minFollowUps ? Number.parseInt(request.query.minFollowUps, 10) : undefined;
    const sort = request.query.sort;

    let sessions;

    if (q && String(q).trim()) {
      sessions = await storage.searchSessions(String(q).trim());
      // Apply additional filters to search results
      if (riskLevel) sessions = sessions.filter(s => s.assessment.riskLevel === riskLevel);
      if (adminStatus) sessions = sessions.filter(s => s.adminStatus === adminStatus);
    } else if (riskLevel || adminStatus || withinHours || minFollowUps || sort) {
      sessions = await storage.filterSessions({ riskLevel, adminStatus, withinHours, minFollowUps, sort });
    } else {
      const limit = request.query.limit == null ? 50 : Number.parseInt(request.query.limit, 10);
      sessions = await storage.listSessions(Number.isNaN(limit) ? 50 : limit);
    }

    return response.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        patientName: session.intake.patientName || "Unnamed patient",
        age: session.intake.age,
        gender: session.intake.gender,
        region: session.intake.region || "Unknown region",
        symptoms: session.assessment.symptoms,
        actionLabel: session.assessment.actionLabel,
        riskLevel: session.assessment.riskLevel,
        suggestedDepartment: session.assessment.suggestedDepartment,
        followUpCount: session.followUps?.length || 0,
        redFlags: session.assessment.redFlags || [],
        adminNote: session.adminNote || '',
        adminStatus: session.adminStatus || 'new',
        tags: session.tags || []
      }))
    });
  });

  app.get("/api/admin/sessions/:sessionId", requireAuth("admin"), async (request, response) => {
    const session = await storage.getSession(request.params.sessionId);
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    return response.json({ session });
  });

  app.patch("/api/admin/sessions/:sessionId", requireAuth("admin"), async (request, response) => {
    const { adminNote, adminStatus, tags } = request.body;
    const session = await storage.updateAdminFields(request.params.sessionId, { adminNote, adminStatus, tags });
    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }
    return response.json({ session });
  });

  app.get("/api/admin/stats", requireAuth("admin"), async (_request, response) => {
    const stats = await storage.getStats();
    return response.json(stats);
  });

  app.all("/api/*path", (_request, response) => {
    response.status(404).json({ status: "error", message: "Not found" });
  });

  app.get(/.*/, (_request, response) => {
    const indexPath = path.resolve(distDir, "index.html");
    response.sendFile(indexPath, (err) => {
      if (err) {
        response
          .status(503)
          .send("CareBridge client is not built. Run npm run build:client first.");
      }
    });
  });

  app.use((err, _request, response, _next) => {
    console.error(err);
    response.status(500).json({ status: "error", message: "Internal server error" });
  });

  return app;
}
