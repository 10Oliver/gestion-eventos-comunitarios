import * as SQLite from 'expo-sqlite/legacy';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = Promise.resolve(SQLite.openDatabase('app.db')) as unknown as Promise<SQLite.SQLiteDatabase>;
  }
  const db = await dbPromise;
  // Foreign keys pragma not supported via runAsync path; ignore for classic API.
  return db;
}

export async function initializeDatabase() {
  const db = await getDb();
  const queries = `
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      photo_url TEXT,
      description TEXT,
      address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      place TEXT,
      start_date TEXT NOT NULL, -- YYYY-MM-DD
      end_date TEXT NOT NULL,   -- YYYY-MM-DD
      start_time TEXT NOT NULL, -- HH:mm
      end_time TEXT NOT NULL,   -- HH:mm
      category_id INTEGER NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date, start_time);
  `;

  await new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      queries.split(';').map(q => q.trim()).filter(Boolean).forEach(q => tx.executeSql(q));
    }, reject, resolve);
  });

  // Seed categories if empty
  const countRes = await getSingle<{ c: number }>(`SELECT COUNT(1) as c FROM categories`);
  if (!countRes || countRes.c === 0) {
    const base = ['Deportes', 'Artes y creatividad', 'Naturaleza', 'Festival'];
    for (const name of base) {
      await run(`INSERT OR IGNORE INTO categories(name) VALUES (?)`, [name]);
    }
  }
}

export async function run(sql: string, params: any[] = []) {
  const db = await getDb();
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(sql, params, () => resolve());
    }, reject);
  });
}

export async function getAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return new Promise<T[]>((resolve, reject) => {
    db.readTransaction(tx => {
      tx.executeSql(sql, params, (_t, res) => {
        const out: T[] = [] as any;
        for (let i = 0; i < res.rows.length; i++) out.push(res.rows.item(i));
        resolve(out);
      });
    }, reject);
  });
}

export async function getSingle<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const rows = await getAll<T & Record<string, any>>(sql, params);
  return rows[0];
}

// Session helpers persisted in meta
export async function setCurrentUserId(userId: string) {
  await run(`INSERT INTO meta(key, value) VALUES ('current_user_id', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [userId]);
}

export async function getCurrentUserId(): Promise<string | undefined> {
  const row = await getSingle<{ value: string }>(`SELECT value FROM meta WHERE key='current_user_id'`);
  return row?.value;
}
