import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    // Use the async API when available (Expo SDK 50+)
    // @ts-ignore - openDatabaseAsync exists on supported Expo SDKs
    dbPromise = (SQLite as any).openDatabaseAsync
      ? (SQLite as any).openDatabaseAsync('app.db')
      : Promise.resolve(SQLite.openDatabase('app.db')) as unknown as Promise<SQLite.SQLiteDatabase>;
  }
  const db = await dbPromise;
  try {
    // Ensure foreign keys
    // @ts-ignore
    await (db as any).execAsync?.('PRAGMA foreign_keys = ON;');
  } catch {}
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

  // Prefer async exec when present
  // @ts-ignore
  if ((db as any).execAsync) {
    // @ts-ignore
    await (db as any).execAsync(queries);
  } else {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        queries.split(';').map(q => q.trim()).filter(Boolean).forEach(q => tx.executeSql(q));
      }, reject, resolve);
    });
  }

  // Seed categories if empty
  const countRes = await getSingle<{ c: number }>(`SELECT COUNT(1) as c FROM categories`);
  if (!countRes || countRes.c === 0) {
    const base = ['Deportes', 'Artes y creatividad', 'Naturaleza', 'Festival'];
    for (const name of base) {
      await run(`INSERT OR IGNORE INTO categories(name) VALUES (?)`, [name]);
    }
  }

  // Seed test users and events if empty
  const uCount = await getSingle<{ c: number }>(`SELECT COUNT(1) as c FROM users`);
  if (!uCount || uCount.c === 0) {
    await run(`INSERT INTO users (id, name, email, photo_url) VALUES (?, ?, ?, ?)`, ['seed-user-1', 'Usuario Uno', 'uno@example.com', null]);
    await run(`INSERT INTO users (id, name, email, photo_url) VALUES (?, ?, ?, ?)`, ['seed-user-2', 'Usuario Dos', 'dos@example.com', null]);
  }

  const eCount = await getSingle<{ c: number }>(`SELECT COUNT(1) as c FROM events`);
  if (!eCount || eCount.c === 0) {
    const deportes = await getSingle<{ id: number }>(`SELECT id FROM categories WHERE name=?`, ['Deportes']);
    const artes = await getSingle<{ id: number }>(`SELECT id FROM categories WHERE name=?`, ['Artes y creatividad']);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = new Date();
    const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const tmr = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    const tomorrow = `${tmr.getFullYear()}-${pad(tmr.getMonth() + 1)}-${pad(tmr.getDate())}`;

    await run(`INSERT INTO events(name, place, start_date, end_date, start_time, end_time, category_id, description, created_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Partido local', 'Cancha central', today, today, '10:00', '12:00', deportes?.id ?? 1, 'Evento de prueba deportes', 'seed-user-1']);
    await run(`INSERT INTO events(name, place, start_date, end_date, start_time, end_time, category_id, description, created_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Pintura al aire libre', 'Parque', tomorrow, tomorrow, '09:00', '11:00', artes?.id ?? 1, 'Evento de prueba artes', 'seed-user-2']);

    const ev1 = await getSingle<{ id: number }>(`SELECT id FROM events WHERE name=? ORDER BY id DESC LIMIT 1`, ['Pintura al aire libre']);
    const ev2 = await getSingle<{ id: number }>(`SELECT id FROM events WHERE name=? ORDER BY id DESC LIMIT 1`, ['Partido local']);
    if (ev2?.id) await run(`INSERT OR IGNORE INTO event_attendees(event_id, user_id) VALUES(?, ?)`, [ev2.id, 'seed-user-2']);
    if (ev1?.id) await run(`INSERT OR IGNORE INTO event_attendees(event_id, user_id) VALUES(?, ?)`, [ev1.id, 'seed-user-1']);
  }
}

export async function run(sql: string, params: any[] = []) {
  const db = await getDb();
  // @ts-ignore
  if ((db as any).runAsync) return (db as any).runAsync(sql, params);
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(sql, params, () => resolve());
    }, reject);
  });
}

export async function getAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  // @ts-ignore
  if ((db as any).getAllAsync) return (db as any).getAllAsync(sql, params);
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
