import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeReadLegacySessions(legacyJsonPath) {
  if (!legacyJsonPath || !fs.existsSync(legacyJsonPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(legacyJsonPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.sessions) ? parsed.sessions : [];
  } catch {
    return [];
  }
}

export function createStorage(dbPath, { legacyJsonPath } = {}) {
  const dir = path.dirname(dbPath);
  ensureDirSync(dir);

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      patient_data TEXT NOT NULL,
      assessment_data TEXT NOT NULL,
      summary_data TEXT NOT NULL,
      follow_ups TEXT NOT NULL DEFAULT '[]'
    );
  `);

  const insertSession = db.prepare(`
    INSERT OR IGNORE INTO sessions (id, created_at, patient_data, assessment_data, summary_data, follow_ups)
    VALUES (@id, @createdAt, @patientData, @assessmentData, @summaryData, @followUps)
  `);

  const selectSession = db.prepare(`SELECT * FROM sessions WHERE id = ?`);
  const selectSessions = db.prepare(`
    SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?
  `);
  const selectAllSessions = db.prepare(`
    SELECT * FROM sessions ORDER BY created_at DESC
  `);
  const countSessions = db.prepare(`SELECT COUNT(*) as count FROM sessions`);
  const updateFollowUps = db.prepare(`
    UPDATE sessions SET follow_ups = ? WHERE id = ?
  `);

  function rowToSession(row) {
    return {
      id: row.id,
      createdAt: row.created_at,
      intake: JSON.parse(row.patient_data),
      assessment: JSON.parse(row.assessment_data),
      summary: JSON.parse(row.summary_data),
      followUps: JSON.parse(row.follow_ups)
    };
  }

  function sessionToRow(session) {
    return {
      id: session.id,
      createdAt: session.createdAt,
      patientData: JSON.stringify(session.intake),
      assessmentData: JSON.stringify(session.assessment),
      summaryData: JSON.stringify(session.summary),
      followUps: JSON.stringify(session.followUps || [])
    };
  }

  function migrateLegacySessionsIfNeeded() {
    const existing = countSessions.get();
    if (existing.count > 0) {
      return;
    }

    const legacySessions = safeReadLegacySessions(legacyJsonPath);
    if (legacySessions.length === 0) {
      return;
    }

    const insertMany = db.transaction((sessions) => {
      for (const session of sessions) {
        insertSession.run(sessionToRow(session));
      }
    });

    insertMany(legacySessions);
  }

  migrateLegacySessionsIfNeeded();

  return {
    async createSession(session) {
      insertSession.run(sessionToRow(session));
      return session;
    },

    async listSessions(limit = 8) {
      const rows = selectSessions.all(limit);
      return rows.map(rowToSession);
    },

    async getSession(id) {
      const row = selectSession.get(id);
      return row ? rowToSession(row) : null;
    },

    async addFollowUp(sessionId, record) {
      const row = selectSession.get(sessionId);
      if (!row) return null;

      const followUps = JSON.parse(row.follow_ups);
      followUps.unshift(record);
      updateFollowUps.run(JSON.stringify(followUps), sessionId);

      const session = rowToSession({ ...row, follow_ups: JSON.stringify(followUps) });
      return { session, record };
    },

    async searchSessions(query) {
      const allRows = selectAllSessions.all();
      const q = String(query || "").toLowerCase();
      return allRows
        .map(rowToSession)
        .filter((session) => {
          const name = (session.intake.patientName || "").toLowerCase();
          const region = (session.intake.region || "").toLowerCase();
          const symptoms = (session.assessment.symptoms || []).join(" ").toLowerCase();
          return name.includes(q) || region.includes(q) || symptoms.includes(q);
        });
    },

    async getSessionCount() {
      const row = countSessions.get();
      return row.count;
    },

    close() {
      db.close();
    }
  };
}
