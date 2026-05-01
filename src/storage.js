import Database from "better-sqlite3";
import crypto from "node:crypto";
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

function hashLegacyPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string" || !storedHash) {
    return false;
  }

  if (storedHash.startsWith("scrypt$")) {
    const [, salt, derivedKey] = storedHash.split("$");
    if (!salt || !derivedKey) return false;

    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(derivedKey, "hex");
    return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
  }

  return hashLegacyPassword(password) === storedHash;
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
      follow_ups TEXT NOT NULL DEFAULT '[]',
      admin_note TEXT NOT NULL DEFAULT '',
      admin_status TEXT NOT NULL DEFAULT 'new',
      tags TEXT NOT NULL DEFAULT '[]'
    );
  `);

  // Migration: add columns if they don't exist (for existing databases)
  const columns = db.prepare("PRAGMA table_info(sessions)").all().map(c => c.name);
  if (!columns.includes('admin_note')) {
    db.exec("ALTER TABLE sessions ADD COLUMN admin_note TEXT NOT NULL DEFAULT ''");
  }
  if (!columns.includes('admin_status')) {
    db.exec("ALTER TABLE sessions ADD COLUMN admin_status TEXT NOT NULL DEFAULT 'new'");
  }
  if (!columns.includes('tags')) {
    db.exec("ALTER TABLE sessions ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
  }

  // Users table for doctor/admin authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('doctor', 'admin')),
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Messages table for doctor-patient conversation
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('doctor', 'patient', 'system')),
      sender_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  // Seed default users if none exist
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, username, password_hash, role, display_name, created_at)
      VALUES (@id, @username, @passwordHash, @role, @displayName, @createdAt)
    `);
    insertUser.run({
      id: "user_doctor_1",
      username: "doctor",
      passwordHash: createPasswordHash("doctor123"),
      role: "doctor",
      displayName: "Dr. Zhang",
      createdAt: new Date().toISOString()
    });
    insertUser.run({
      id: "user_admin_1",
      username: "admin",
      passwordHash: createPasswordHash("admin123"),
      role: "admin",
      displayName: "Admin",
      createdAt: new Date().toISOString()
    });
  }

  const insertSession = db.prepare(`
    INSERT OR IGNORE INTO sessions (id, created_at, patient_data, assessment_data, summary_data, follow_ups, admin_note, admin_status, tags)
    VALUES (@id, @createdAt, @patientData, @assessmentData, @summaryData, @followUps, @adminNote, @adminStatus, @tags)
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
  const updateUserPasswordHash = db.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `);

  function rowToSession(row) {
    return {
      id: row.id,
      createdAt: row.created_at,
      intake: JSON.parse(row.patient_data),
      assessment: JSON.parse(row.assessment_data),
      summary: JSON.parse(row.summary_data),
      followUps: JSON.parse(row.follow_ups),
      adminNote: row.admin_note || '',
      adminStatus: row.admin_status || 'new',
      tags: JSON.parse(row.tags || '[]')
    };
  }

  function sessionToRow(session) {
    return {
      id: session.id,
      createdAt: session.createdAt,
      patientData: JSON.stringify(session.intake),
      assessmentData: JSON.stringify(session.assessment),
      summaryData: JSON.stringify(session.summary),
      followUps: JSON.stringify(session.followUps || []),
      adminNote: session.adminNote || '',
      adminStatus: session.adminStatus || 'new',
      tags: JSON.stringify(session.tags || [])
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

    async updateAdminFields(sessionId, { adminNote, adminStatus, tags }) {
      const row = selectSession.get(sessionId);
      if (!row) return null;

      const updates = [];
      const params = {};

      if (adminNote !== undefined) {
        updates.push('admin_note = @adminNote');
        params.adminNote = String(adminNote);
      }
      if (adminStatus !== undefined) {
        updates.push('admin_status = @adminStatus');
        params.adminStatus = String(adminStatus);
      }
      if (tags !== undefined) {
        updates.push('tags = @tags');
        params.tags = JSON.stringify(tags);
      }

      if (updates.length === 0) return rowToSession(row);

      params.id = sessionId;
      db.prepare(`UPDATE sessions SET ${updates.join(', ')} WHERE id = @id`).run(params);

      const updated = selectSession.get(sessionId);
      return rowToSession(updated);
    },

    async getStats() {
      const allRows = selectAllSessions.all();
      const total = allRows.length;

      const riskDistribution = { 'Level 1': 0, 'Level 2': 0, 'Level 3': 0, 'Level 4': 0 };
      const statusDistribution = {};
      let highRiskRecent = 0;

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      for (const row of allRows) {
        const assessment = JSON.parse(row.assessment_data);
        const level = assessment.riskLevel;
        if (level in riskDistribution) {
          riskDistribution[level]++;
        }

        const status = row.admin_status || 'new';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;

        if ((level === 'Level 1' || level === 'Level 2') && row.created_at >= oneDayAgo) {
          highRiskRecent++;
        }
      }

      return { total, riskDistribution, statusDistribution, highRiskRecent };
    },

    async filterSessions({ riskLevel, adminStatus, withinHours, minFollowUps, sort } = {}) {
      let allRows = selectAllSessions.all();

      let sessions = allRows.map(rowToSession);

      if (riskLevel) {
        sessions = sessions.filter(s => s.assessment.riskLevel === riskLevel);
      }

      if (adminStatus) {
        sessions = sessions.filter(s => s.adminStatus === adminStatus);
      }

      if (withinHours && withinHours > 0) {
        const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();
        sessions = sessions.filter(s => s.createdAt >= cutoff);
      }

      if (minFollowUps !== undefined && minFollowUps > 0) {
        sessions = sessions.filter(s => s.followUps.length >= minFollowUps);
      }

      if (sort === 'risk') {
        const order = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4 };
        sessions.sort((a, b) => (order[a.assessment.riskLevel] || 5) - (order[b.assessment.riskLevel] || 5));
      } else if (sort === 'followups') {
        sessions.sort((a, b) => b.followUps.length - a.followUps.length);
      }
      // default is already sorted by created_at DESC

      return sessions;
    },

    close() {
      db.close();
    },

    // Auth methods
    authenticateUser(username, password) {
      const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!row) return null;
      if (!verifyPassword(password, row.password_hash)) return null;

      if (!String(row.password_hash).startsWith("scrypt$")) {
        updateUserPasswordHash.run(createPasswordHash(password), row.id);
      }

      return { id: row.id, username: row.username, role: row.role, displayName: row.display_name };
    },

    getUserById(id) {
      const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      if (!row) return null;
      return { id: row.id, username: row.username, role: row.role, displayName: row.display_name };
    },

    // Message methods
    getMessages(sessionId) {
      const rows = db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(sessionId);
      return rows.map(row => ({
        id: row.id,
        sessionId: row.session_id,
        senderType: row.sender_type,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at
      }));
    },

    addMessage(sessionId, senderType, senderId, content) {
      const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date().toISOString();
      db.prepare("INSERT INTO messages (id, session_id, sender_type, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, sessionId, senderType, senderId, content, createdAt);
      return { id, sessionId, senderType, senderId, content, createdAt };
    },

    getDoctorSessions({ q, riskLevel, sort } = {}) {
      let sessions = selectAllSessions.all().map(rowToSession);

      if (q && String(q).trim()) {
        const query = String(q).trim().toLowerCase();
        sessions = sessions.filter(s => {
          const name = (s.intake.patientName || "").toLowerCase();
          const region = (s.intake.region || "").toLowerCase();
          const symptoms = (s.assessment.symptoms || []).join(" ").toLowerCase();
          return name.includes(query) || region.includes(query) || symptoms.includes(query);
        });
      }

      if (riskLevel) {
        sessions = sessions.filter(s => s.assessment.riskLevel === riskLevel);
      }

      if (sort === 'risk') {
        const order = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4 };
        sessions.sort((a, b) => (order[a.assessment.riskLevel] || 5) - (order[b.assessment.riskLevel] || 5));
      }

      // Add last message info and unread count
      return sessions.map(session => {
        const msgs = db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 1").all(session.id);
        const msgCount = db.prepare("SELECT COUNT(*) as count FROM messages WHERE session_id = ?").get(session.id);
        return {
          ...session,
          lastMessage: msgs.length > 0 ? { content: msgs[0].content, createdAt: msgs[0].created_at, senderType: msgs[0].sender_type } : null,
          messageCount: msgCount.count
        };
      });
    },

    getDoctorSessionDetail(sessionId) {
      const session = this.getSession(sessionId);
      if (!session) return null;
      const messages = this.getMessages(sessionId);
      return { ...session, messages };
    }
  };
}
