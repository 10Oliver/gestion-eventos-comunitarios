import { getAll, getSingle, run } from '../db';

export type User = {
  id: string; // provider UID or email
  name?: string;
  email?: string;
  photo_url?: string;
  description?: string;
  address?: string;
};

export async function upsertUser(u: User) {
  await run(
    `INSERT OR IGNORE INTO users (id, name, email, photo_url, description, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      u.id,
      u.name ?? null,
      u.email ?? null,
      u.photo_url ?? null,
      u.description ?? null,
      u.address ?? null,
    ]
  );

  await run(
    `UPDATE users SET 
      name=COALESCE(?, name),
      email=COALESCE(?, email),
      photo_url=COALESCE(?, photo_url),
      description=COALESCE(?, description),
      address=COALESCE(?, address)
     WHERE id=?`,
    [
      u.name ?? null,
      u.email ?? null,
      u.photo_url ?? null,
      u.description ?? null,
      u.address ?? null,
      u.id,
    ]
  );

}

export async function getUserById(id: string) {
  return getSingle<User>(`SELECT * FROM users WHERE id=?`, [id]);
}

export async function setUserProfile(id: string, profile: { description?: string; address?: string; }) {
  return updateUserProfile(id, profile);
}

export async function updateUserProfile(id: string, profile: { description?: string; address?: string; }) {
  await run(
    `UPDATE users SET 
      description=COALESCE(?, description),
      address=COALESCE(?, address)
     WHERE id=?`,
    [profile.description ?? null, profile.address ?? null, id]
  );
}

export async function getUsersByIds(ids: string[]) {
  if (!ids.length) return [] as User[];
  const placeholders = ids.map(() => '?').join(',');
  return getAll<User>(`SELECT * FROM users WHERE id IN (${placeholders})`, ids);
}
