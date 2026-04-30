import fs from "node:fs/promises";
import path from "node:path";

async function ensureFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({ sessions: [] }, null, 2));
  }
}

export function createStorage(dataFile) {
  async function readDb() {
    await ensureFile(dataFile);
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw);
  }

  async function writeDb(data) {
    await ensureFile(dataFile);
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
  }

  return {
    async createSession(session) {
      const db = await readDb();
      db.sessions.unshift(session);
      await writeDb(db);
      return session;
    },
    async listSessions(limit = 8) {
      const db = await readDb();
      return db.sessions.slice(0, limit);
    },
    async getSession(id) {
      const db = await readDb();
      return db.sessions.find((session) => session.id === id) || null;
    },
    async addFollowUp(sessionId, record) {
      const db = await readDb();
      const session = db.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return null;
      }

      session.followUps = session.followUps || [];
      session.followUps.unshift(record);
      await writeDb(db);
      return { session, record };
    }
  };
}
