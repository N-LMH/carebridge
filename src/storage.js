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
      next_follow_up_at TEXT,
      follow_up_plan_status TEXT NOT NULL DEFAULT 'none',
      follow_up_window_hours INTEGER,
      admin_note TEXT NOT NULL DEFAULT '',
      admin_status TEXT NOT NULL DEFAULT 'new',
      tags TEXT NOT NULL DEFAULT '[]'
    );
  `);

  // Migration: add columns if they don't exist (for existing databases)
  const columns = db.prepare("PRAGMA table_info(sessions)").all().map(c => c.name);

  const doctorColumns = [
    { name: 'next_follow_up_at', def: "ALTER TABLE sessions ADD COLUMN next_follow_up_at TEXT" },
    { name: 'follow_up_plan_status', def: "ALTER TABLE sessions ADD COLUMN follow_up_plan_status TEXT NOT NULL DEFAULT 'none'" },
    { name: 'follow_up_window_hours', def: "ALTER TABLE sessions ADD COLUMN follow_up_window_hours INTEGER" },
    { name: 'doctor_status', def: "ALTER TABLE sessions ADD COLUMN doctor_status TEXT NOT NULL DEFAULT 'new'" },
    { name: 'doctor_note', def: "ALTER TABLE sessions ADD COLUMN doctor_note TEXT NOT NULL DEFAULT ''" },
    { name: 'conversation_state', def: "ALTER TABLE sessions ADD COLUMN conversation_state TEXT NOT NULL DEFAULT 'none'" },
    { name: 'last_patient_message_at', def: "ALTER TABLE sessions ADD COLUMN last_patient_message_at TEXT" },
    { name: 'last_doctor_message_at', def: "ALTER TABLE sessions ADD COLUMN last_doctor_message_at TEXT" },
    { name: 'reviewed_at', def: "ALTER TABLE sessions ADD COLUMN reviewed_at TEXT" },
    { name: 'resolved_at', def: "ALTER TABLE sessions ADD COLUMN resolved_at TEXT" },
    { name: 'priority_level', def: "ALTER TABLE sessions ADD COLUMN priority_level TEXT NOT NULL DEFAULT 'normal'" },
    { name: 'admin_note', def: "ALTER TABLE sessions ADD COLUMN admin_note TEXT NOT NULL DEFAULT ''" },
    { name: 'admin_status', def: "ALTER TABLE sessions ADD COLUMN admin_status TEXT NOT NULL DEFAULT 'new'" },
    { name: 'tags', def: "ALTER TABLE sessions ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'" }
  ];

  for (const col of doctorColumns) {
    if (!columns.includes(col.name)) {
      db.exec(col.def);
    }
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
      message_kind TEXT NOT NULL DEFAULT 'text',
      is_read_by_doctor INTEGER NOT NULL DEFAULT 0,
      is_read_by_patient INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reassessments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      source TEXT NOT NULL,
      previous_risk_level TEXT NOT NULL,
      new_risk_level TEXT NOT NULL,
      delta_summary TEXT NOT NULL,
      snapshot_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  // Migration: add message columns if they don't exist
  const msgColumns = db.prepare("PRAGMA table_info(messages)").all().map(c => c.name);
  if (!msgColumns.includes('message_kind')) {
    db.exec("ALTER TABLE messages ADD COLUMN message_kind TEXT NOT NULL DEFAULT 'text'");
  }
  if (!msgColumns.includes('is_read_by_doctor')) {
    db.exec("ALTER TABLE messages ADD COLUMN is_read_by_doctor INTEGER NOT NULL DEFAULT 0");
  }
  if (!msgColumns.includes('is_read_by_patient')) {
    db.exec("ALTER TABLE messages ADD COLUMN is_read_by_patient INTEGER NOT NULL DEFAULT 0");
  }

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
    INSERT OR IGNORE INTO sessions (id, created_at, patient_data, assessment_data, summary_data, follow_ups, next_follow_up_at, follow_up_plan_status, follow_up_window_hours, admin_note, admin_status, tags, doctor_status, doctor_note, conversation_state, priority_level)
    VALUES (@id, @createdAt, @patientData, @assessmentData, @summaryData, @followUps, @nextFollowUpAt, @followUpPlanStatus, @followUpWindowHours, @adminNote, @adminStatus, @tags, @doctorStatus, @doctorNote, @conversationState, @priorityLevel)
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
  const updateSessionClinical = db.prepare(`
    UPDATE sessions
    SET assessment_data = @assessmentData,
        summary_data = @summaryData,
        next_follow_up_at = @nextFollowUpAt,
        follow_up_plan_status = @followUpPlanStatus,
        follow_up_window_hours = @followUpWindowHours
    WHERE id = @id
  `);
  const updateUserPasswordHash = db.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `);
  const insertReassessment = db.prepare(`
    INSERT INTO reassessments (id, session_id, source, previous_risk_level, new_risk_level, delta_summary, snapshot_data, created_at)
    VALUES (@id, @sessionId, @source, @previousRiskLevel, @newRiskLevel, @deltaSummary, @snapshotData, @createdAt)
  `);
  const selectLatestReassessment = db.prepare(`
    SELECT * FROM reassessments WHERE session_id = ? ORDER BY created_at DESC LIMIT 1
  `);
  const selectReassessments = db.prepare(`
    SELECT * FROM reassessments WHERE session_id = ? ORDER BY created_at DESC
  `);
  const selectFirstDoctorMessage = db.prepare(`
    SELECT * FROM messages WHERE session_id = ? AND sender_type = 'doctor' ORDER BY created_at ASC LIMIT 1
  `);

  function rowToReassessment(row) {
    if (!row) return null;
    return {
      id: row.id,
      sessionId: row.session_id,
      source: row.source,
      previousRiskLevel: row.previous_risk_level,
      newRiskLevel: row.new_risk_level,
      deltaSummary: row.delta_summary,
      snapshotData: JSON.parse(row.snapshot_data),
      createdAt: row.created_at
    };
  }

  function getTimeline(sessionId) {
    const session = selectSession.get(sessionId);
    if (!session) return [];

    const sessionObj = rowToSession(session);
    const events = [];

    events.push({
      id: `timeline_triage_${sessionObj.id}`,
      type: 'triage_created',
      timestamp: sessionObj.createdAt,
      title: 'Triage created',
      description: `${sessionObj.assessment.riskLevel} · ${sessionObj.assessment.actionLabel}`,
      actor: 'system',
      metadata: {
        riskLevel: sessionObj.assessment.riskLevel
      }
    });

    for (const followUp of sessionObj.followUps || []) {
      events.push({
        id: `timeline_followup_${followUp.id}`,
        type: 'follow_up_added',
        timestamp: followUp.createdAt,
        title: 'Follow-up recorded',
        description: followUp.symptomChange || followUp.note || 'Follow-up update recorded',
        actor: 'patient',
        metadata: {
          temperatureC: followUp.temperatureC
        }
      });
    }

    for (const reassessment of selectReassessments.all(sessionId).map(rowToReassessment)) {
      events.push({
        id: `timeline_reassess_${reassessment.id}`,
        type: 'reassessment_created',
        timestamp: reassessment.createdAt,
        title: 'Risk reassessed',
        description: reassessment.deltaSummary,
        actor: 'system',
        metadata: {
          previousRiskLevel: reassessment.previousRiskLevel,
          newRiskLevel: reassessment.newRiskLevel
        }
      });
    }

    for (const message of this.getMessages(sessionId)) {
      events.push({
        id: `timeline_message_${message.id}`,
        type: `${message.senderType}_message_sent`,
        timestamp: message.createdAt,
        title: message.senderType === 'doctor' ? 'Doctor message sent' : message.senderType === 'patient' ? 'Patient message sent' : 'System message sent',
        description: message.content,
        actor: message.senderType === 'doctor' ? 'doctor' : message.senderType === 'patient' ? 'patient' : 'system',
        metadata: {
          senderType: message.senderType
        }
      });
    }

    if (sessionObj.reviewedAt) {
      events.push({
        id: `timeline_reviewed_${sessionObj.id}`,
        type: 'reviewed',
        timestamp: sessionObj.reviewedAt,
        title: 'Case reviewed',
        description: 'The case entered review workflow.',
        actor: 'admin',
        metadata: {
          adminStatus: sessionObj.adminStatus,
          doctorStatus: sessionObj.doctorStatus
        }
      });
    }

    if (sessionObj.resolvedAt) {
      events.push({
        id: `timeline_resolved_${sessionObj.id}`,
        type: 'resolved',
        timestamp: sessionObj.resolvedAt,
        title: 'Case resolved',
        description: 'The case was marked resolved.',
        actor: sessionObj.doctorStatus === 'resolved' ? 'doctor' : 'admin',
        metadata: {
          adminStatus: sessionObj.adminStatus,
          doctorStatus: sessionObj.doctorStatus
        }
      });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  function rowToSession(row) {
    return {
      id: row.id,
      createdAt: row.created_at,
      intake: JSON.parse(row.patient_data),
      assessment: JSON.parse(row.assessment_data),
      summary: JSON.parse(row.summary_data),
      followUps: JSON.parse(row.follow_ups),
      followUpPlan: {
        recommendedAt: row.next_follow_up_at || null,
        status: row.follow_up_plan_status || 'none',
        recommendedWindowHours: row.follow_up_window_hours == null ? null : Number(row.follow_up_window_hours)
      },
      adminNote: row.admin_note || '',
      adminStatus: row.admin_status || 'new',
      tags: JSON.parse(row.tags || '[]'),
      doctorStatus: row.doctor_status || 'new',
      doctorNote: row.doctor_note || '',
      conversationState: row.conversation_state || 'none',
      lastPatientMessageAt: row.last_patient_message_at || null,
      lastDoctorMessageAt: row.last_doctor_message_at || null,
      reviewedAt: row.reviewed_at || null,
      resolvedAt: row.resolved_at || null,
      priorityLevel: row.priority_level || 'normal',
      latestReassessment: rowToReassessment(selectLatestReassessment.get(row.id))
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
      nextFollowUpAt: session.followUpPlan?.recommendedAt || null,
      followUpPlanStatus: session.followUpPlan?.status || 'none',
      followUpWindowHours: session.followUpPlan?.recommendedWindowHours ?? null,
      adminNote: session.adminNote || '',
      adminStatus: session.adminStatus || 'new',
      tags: JSON.stringify(session.tags || []),
      doctorStatus: session.doctorStatus || 'new',
      doctorNote: session.doctorNote || '',
      conversationState: session.conversationState || 'none',
      priorityLevel: session.priorityLevel || 'normal'
    };
  }

  const RISK_ORDER = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4 };
  const PRIORITY_ORDER = { urgent: 1, high: 2, normal: 3, low: 4 };

  function matchesQuery(session, query) {
    const name = (session.intake.patientName || "").toLowerCase();
    const region = (session.intake.region || "").toLowerCase();
    const symptoms = (session.assessment.symptoms || []).join(" ").toLowerCase();
    return name.includes(query) || region.includes(query) || symptoms.includes(query);
  }

  function enrichWithMessages(sessions) {
    return sessions.map(session => {
      const msgs = db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 1").all(session.id);
      const msgCount = db.prepare("SELECT COUNT(*) as count FROM messages WHERE session_id = ?").get(session.id);
      const unreadByDoctor = db.prepare("SELECT COUNT(*) as count FROM messages WHERE session_id = ? AND is_read_by_doctor = 0 AND sender_type != 'doctor'").get(session.id);
      return {
        ...session,
        lastMessage: msgs.length > 0 ? { content: msgs[0].content, createdAt: msgs[0].created_at, senderType: msgs[0].sender_type } : null,
        messageCount: msgCount.count,
        unreadCount: unreadByDoctor.count
      };
    });
  }

  function migrateLegacySessionsIfNeeded() {
    const existing = countSessions.get();
    if (existing.count === 0) {
      const legacySessions = safeReadLegacySessions(legacyJsonPath);
      if (legacySessions.length > 0) {
        const insertMany = db.transaction((sessions) => {
          for (const session of sessions) {
            insertSession.run(sessionToRow(session));
          }
        });
        insertMany(legacySessions);
      }
    }

    // Verify columns exist after migration
    const cols = db.prepare("PRAGMA table_info(sessions)").all().map(c => c.name);
    if (cols.includes('doctor_status')) {
      try { db.prepare("UPDATE sessions SET doctor_status = 'new' WHERE doctor_status IS NULL OR doctor_status = ''").run(); } catch {}
    }
    if (cols.includes('doctor_note')) {
      try { db.prepare("UPDATE sessions SET doctor_note = '' WHERE doctor_note IS NULL").run(); } catch {}
    }
    if (cols.includes('conversation_state')) {
      try { db.prepare("UPDATE sessions SET conversation_state = 'none' WHERE conversation_state IS NULL OR conversation_state = ''").run(); } catch {}
    }
    if (cols.includes('priority_level')) {
      try { db.prepare("UPDATE sessions SET priority_level = 'normal' WHERE priority_level IS NULL OR priority_level = ''").run(); } catch {}
    }
    if (cols.includes('follow_up_plan_status')) {
      try { db.prepare("UPDATE sessions SET follow_up_plan_status = 'none' WHERE follow_up_plan_status IS NULL OR follow_up_plan_status = ''").run(); } catch {}
    }
    if (cols.includes('admin_status')) {
      try { db.prepare("UPDATE sessions SET admin_status = 'new' WHERE admin_status IS NULL OR admin_status = ''").run(); } catch {}
    }
    if (cols.includes('admin_note')) {
      try { db.prepare("UPDATE sessions SET admin_note = '' WHERE admin_note IS NULL").run(); } catch {}
    }
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

      let planStatus = row.follow_up_plan_status || 'none';
      if (planStatus === 'scheduled' || planStatus === 'overdue') {
        planStatus = 'completed';
        db.prepare("UPDATE sessions SET follow_up_plan_status = ? WHERE id = ?").run(planStatus, sessionId);
      }

      const session = rowToSession({
        ...row,
        follow_ups: JSON.stringify(followUps),
        follow_up_plan_status: planStatus
      });
      return { session, record };
    },

    async updateSessionClinical(sessionId, { assessment, summary, followUpPlan }) {
      const row = selectSession.get(sessionId);
      if (!row) return null;

      updateSessionClinical.run({
        id: sessionId,
        assessmentData: JSON.stringify(assessment),
        summaryData: JSON.stringify(summary),
        nextFollowUpAt: followUpPlan?.recommendedAt || null,
        followUpPlanStatus: followUpPlan?.status || 'none',
        followUpWindowHours: followUpPlan?.recommendedWindowHours ?? null
      });

      const updated = selectSession.get(sessionId);
      return updated ? rowToSession(updated) : null;
    },

    async createReassessment(sessionId, reassessment) {
      insertReassessment.run({
        id: reassessment.id,
        sessionId,
        source: reassessment.source,
        previousRiskLevel: reassessment.previousRiskLevel,
        newRiskLevel: reassessment.newRiskLevel,
        deltaSummary: reassessment.deltaSummary,
        snapshotData: JSON.stringify(reassessment.snapshotData),
        createdAt: reassessment.createdAt
      });
      return reassessment;
    },

    getReassessments(sessionId) {
      return selectReassessments.all(sessionId).map(rowToReassessment);
    },

    getTimeline(sessionId) {
      return getTimeline.call(this, sessionId);
    },

    async searchSessions(query) {
      const q = String(query || "").toLowerCase();
      if (!q) return selectAllSessions.all().map(rowToSession);
      return selectAllSessions.all().map(rowToSession).filter(s => matchesQuery(s, q));
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
        if (adminStatus === 'reviewed' && !row.reviewed_at) {
          updates.push('reviewed_at = @reviewedAt');
          params.reviewedAt = new Date().toISOString();
        }
        if (adminStatus === 'resolved') {
          updates.push('resolved_at = @resolvedAt');
          params.resolvedAt = new Date().toISOString();
        }
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

    async updateDoctorFields(sessionId, fields) {
      const row = selectSession.get(sessionId);
      if (!row) return null;

      const updates = [];
      const params = {};

      if (fields.doctorStatus !== undefined) {
        updates.push('doctor_status = @doctorStatus');
        params.doctorStatus = String(fields.doctorStatus);
        if (fields.doctorStatus === 'under_review' && !row.reviewed_at) {
          updates.push('reviewed_at = @reviewedAt');
          params.reviewedAt = new Date().toISOString();
        }
        if (fields.doctorStatus === 'resolved') {
          updates.push('resolved_at = @resolvedAt');
          params.resolvedAt = new Date().toISOString();
        }
      }
      if (fields.doctorNote !== undefined) {
        updates.push('doctor_note = @doctorNote');
        params.doctorNote = String(fields.doctorNote);
      }
      if (fields.priorityLevel !== undefined) {
        updates.push('priority_level = @priorityLevel');
        params.priorityLevel = String(fields.priorityLevel);
      }
      if (fields.conversationState !== undefined) {
        updates.push('conversation_state = @conversationState');
        params.conversationState = String(fields.conversationState);
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
        sessions.sort((a, b) => (RISK_ORDER[a.assessment.riskLevel] || 5) - (RISK_ORDER[b.assessment.riskLevel] || 5));
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
        createdAt: row.created_at,
        messageKind: row.message_kind || 'text',
        isReadByDoctor: !!row.is_read_by_doctor,
        isReadByPatient: !!row.is_read_by_patient
      }));
    },

    addMessage(sessionId, senderType, senderId, content, kind = 'text') {
      const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date().toISOString();
      const isReadByDoctor = senderType === 'doctor' ? 1 : 0;
      const isReadByPatient = senderType === 'patient' ? 1 : 0;
      db.prepare("INSERT INTO messages (id, session_id, sender_type, sender_id, content, created_at, message_kind, is_read_by_doctor, is_read_by_patient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, sessionId, senderType, senderId, content, createdAt, kind, isReadByDoctor, isReadByPatient);

      // Update session timestamps and conversation state
      const now = new Date().toISOString();
      if (senderType === 'doctor') {
        db.prepare("UPDATE sessions SET last_doctor_message_at = ?, conversation_state = 'waiting_patient' WHERE id = ?")
          .run(now, sessionId);
      } else if (senderType === 'patient') {
        db.prepare("UPDATE sessions SET last_patient_message_at = ?, conversation_state = 'waiting_doctor' WHERE id = ?")
          .run(now, sessionId);
      }

      return { id, sessionId, senderType, senderId, content, createdAt, messageKind: kind, isReadByDoctor: !!isReadByDoctor, isReadByPatient: !!isReadByPatient };
    },

    markMessagesRead(sessionId, readerType) {
      const col = readerType === 'doctor' ? 'is_read_by_doctor' : 'is_read_by_patient';
      db.prepare(`UPDATE messages SET ${col} = 1 WHERE session_id = ? AND sender_type != ?`)
        .run(sessionId, readerType);
    },

    getDoctorDashboard() {
      const sessions = selectAllSessions.all().map(rowToSession);
      const isHighRisk = s => s.assessment.riskLevel === 'Level 1' || s.assessment.riskLevel === 'Level 2';
      const isActive = s => s.doctorStatus !== 'resolved';

      const totalActive = sessions.filter(isActive).length;
      const highRisk = sessions.filter(s => isHighRisk(s) && isActive(s)).length;
      const waitingDoctorReply = sessions.filter(s => s.conversationState === 'waiting_doctor').length;
      const waitingPatientReply = sessions.filter(s => s.conversationState === 'waiting_patient').length;
      const resolved = sessions.length - totalActive;

      const enriched = enrichWithMessages(sessions);
      const urgent = enriched.filter(s => (isHighRisk(s) || s.priorityLevel === 'high' || s.priorityLevel === 'urgent') && isActive(s));
      const needsReply = enriched.filter(s => s.conversationState === 'waiting_doctor');
      const recent = enriched.slice(0, 10);

      return {
        stats: { totalActive, highRisk, waitingDoctorReply, waitingPatientReply, resolved },
        queues: { urgent, needsReply, recent }
      };
    },

    getDoctorSessions({ q, riskLevel, doctorStatus, conversationState, priorityLevel, sort } = {}) {
      let sessions = selectAllSessions.all().map(rowToSession);

      const query = q && String(q).trim() ? String(q).trim().toLowerCase() : '';
      if (query) sessions = sessions.filter(s => matchesQuery(s, query));
      if (riskLevel) sessions = sessions.filter(s => s.assessment.riskLevel === riskLevel);
      if (doctorStatus) sessions = sessions.filter(s => s.doctorStatus === doctorStatus);
      if (conversationState) sessions = sessions.filter(s => s.conversationState === conversationState);
      if (priorityLevel) sessions = sessions.filter(s => s.priorityLevel === priorityLevel);

      if (sort === 'risk') {
        sessions.sort((a, b) => (RISK_ORDER[a.assessment.riskLevel] || 5) - (RISK_ORDER[b.assessment.riskLevel] || 5));
      } else if (sort === 'priority') {
        sessions.sort((a, b) => (PRIORITY_ORDER[a.priorityLevel] || 5) - (PRIORITY_ORDER[b.priorityLevel] || 5));
      }

      return enrichWithMessages(sessions);
    },

    async getDoctorSessionDetail(sessionId) {
      const session = await this.getSession(sessionId);
      if (!session) return null;
      const messages = this.getMessages(sessionId);
      // Mark patient messages as read by doctor
      this.markMessagesRead(sessionId, 'doctor');
      return { ...session, messages, timeline: this.getTimeline(sessionId) };
    },

    async getAdminQueues() {
      const sessions = selectAllSessions.all().map(rowToSession);
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const isHighRisk = s => s.assessment.riskLevel === 'Level 1' || s.assessment.riskLevel === 'Level 2';
      const isUnresolved = s => s.adminStatus !== 'resolved' && s.adminStatus !== 'archived';
      const isNew = s => s.adminStatus === 'new';
      const isUrgent = s => s.adminStatus === 'urgent';
      const isOverdue = s => {
        if (!isUnresolved(s)) return false;
        const created = new Date(s.createdAt);
        const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation > 72; // More than 3 days old and unresolved
      };

      const highRiskUnresolved = sessions
        .filter(s => isHighRisk(s) && isUnresolved(s))
        .sort((a, b) => (RISK_ORDER[a.assessment.riskLevel] || 5) - (RISK_ORDER[b.assessment.riskLevel] || 5))
        .slice(0, 10);

      const urgentAdminAttention = sessions
        .filter(s => isUrgent(s) && isUnresolved(s))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      const newlyCreated = sessions
        .filter(s => isNew(s) && s.createdAt >= oneDayAgo)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      const overdueStuck = sessions
        .filter(s => isOverdue(s))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 10);

      const recentlyUpdated = sessions
        .filter(s => {
          if (!isUnresolved(s)) return false;
          const lastFollowUp = s.followUps && s.followUps.length > 0 ? s.followUps[0].createdAt : null;
          const lastUpdate = lastFollowUp || s.createdAt;
          return lastUpdate >= sevenDaysAgo;
        })
        .sort((a, b) => {
          const aLast = a.followUps && a.followUps.length > 0 ? a.followUps[0].createdAt : a.createdAt;
          const bLast = b.followUps && b.followUps.length > 0 ? b.followUps[0].createdAt : b.createdAt;
          return new Date(bLast).getTime() - new Date(aLast).getTime();
        })
        .slice(0, 10);

      const overdueDoctorReply = enrichWithMessages(sessions)
        .filter(s => {
          if (s.conversationState !== 'waiting_doctor') return false;
          if (!s.lastPatientMessageAt) return false;
          const hoursSincePatientMessage = (now.getTime() - new Date(s.lastPatientMessageAt).getTime()) / (1000 * 60 * 60);
          return hoursSincePatientMessage > 2;
        })
        .sort((a, b) => new Date(a.lastPatientMessageAt).getTime() - new Date(b.lastPatientMessageAt).getTime())
        .slice(0, 10);

      const riskUpgraded = sessions
        .filter(s => {
          const latest = s.latestReassessment;
          if (!latest) return false;
          return latest.previousRiskLevel !== latest.newRiskLevel && latest.createdAt >= oneDayAgo;
        })
        .sort((a, b) => new Date(b.latestReassessment.createdAt).getTime() - new Date(a.latestReassessment.createdAt).getTime())
        .slice(0, 10);

      return {
        highRiskUnresolved,
        urgentAdminAttention,
        newlyCreated,
        overdueStuck,
        recentlyUpdated,
        overdueDoctorReply,
        riskUpgraded
      };
    },

    async getAdminSla() {
      const sessions = selectAllSessions.all().map(rowToSession);
      const highRiskSessions = sessions.filter(s => s.assessment.riskLevel === 'Level 1' || s.assessment.riskLevel === 'Level 2');
      const reviewDurations = [];
      let highRiskReviewedOnTime = 0;
      let highRiskReviewedLate = 0;
      let waitingDoctorReplyOverdue = 0;
      let recentRiskUpgrades = 0;

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      for (const session of highRiskSessions) {
        if (session.reviewedAt) {
          const reviewMinutes = (new Date(session.reviewedAt).getTime() - new Date(session.createdAt).getTime()) / (1000 * 60);
          reviewDurations.push(reviewMinutes);
          const target = session.assessment.riskLevel === 'Level 1' ? 5 : 30;
          if (reviewMinutes <= target) highRiskReviewedOnTime++;
          else highRiskReviewedLate++;
        }
      }

      for (const session of sessions) {
        if (session.conversationState === 'waiting_doctor' && session.lastPatientMessageAt) {
          const overdueHours = (now.getTime() - new Date(session.lastPatientMessageAt).getTime()) / (1000 * 60 * 60);
          if (overdueHours > 2) waitingDoctorReplyOverdue++;
        }

        if (session.latestReassessment && session.latestReassessment.previousRiskLevel !== session.latestReassessment.newRiskLevel && session.latestReassessment.createdAt >= oneDayAgo) {
          recentRiskUpgrades++;
        }
      }

      return {
        highRiskReviewedOnTime,
        highRiskReviewedLate,
        waitingDoctorReplyOverdue,
        recentRiskUpgrades,
        avgHighRiskReviewMinutes: reviewDurations.length
          ? Math.round(reviewDurations.reduce((sum, item) => sum + item, 0) / reviewDurations.length)
          : null
      };
    }
  };
}
