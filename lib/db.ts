import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('app.db');
  }
  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
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
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
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
  `);

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
  await db.runAsync(sql, ...params);
}

export async function getAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(sql, ...params);
}

export async function getSingle<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const db = await getDb();
  return (await db.getFirstAsync<T>(sql, ...params)) ?? undefined;
}

// Session helpers persisted in meta
export async function setCurrentUserId(userId: string) {
  await run(`INSERT INTO meta(key, value) VALUES ('current_user_id', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [userId]);
}

export async function getCurrentUserId(): Promise<string | undefined> {
  const row = await getSingle<{ value: string }>(`SELECT value FROM meta WHERE key='current_user_id'`);
  return row?.value;
}

