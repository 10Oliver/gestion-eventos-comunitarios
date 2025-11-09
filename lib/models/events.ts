import { getAll, getSingle, run } from '../db';
import type { User } from './users';

export type Event = {
  id?: number;
  name: string;
  place?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  category_id: number;
  description?: string;
  created_by: string; // user id
};

export type EventWithMeta = Event & {
  category_name: string;
  created_by_name?: string;
  attendees_count: number;
};

export async function getTop3UpcomingEvents() {
  return getAll<EventWithMeta>(
    `SELECT e.*, c.name as category_name,
            (SELECT COUNT(1) FROM event_attendees ea WHERE ea.event_id = e.id) as attendees_count,
            (SELECT u.name FROM users u WHERE u.id=e.created_by) as created_by_name
     FROM events e
     JOIN categories c ON c.id = e.category_id
     WHERE datetime(e.end_date || 'T' || e.end_time) >= datetime('now')
     ORDER BY datetime(e.start_date || 'T' || e.start_time) ASC
     LIMIT 3`
  );
}

export async function getAllUpcomingEventsDesc() {
  return getAll<EventWithMeta>(
    `SELECT e.*, c.name as category_name,
            (SELECT COUNT(1) FROM event_attendees ea WHERE ea.event_id = e.id) as attendees_count,
            (SELECT u.name FROM users u WHERE u.id=e.created_by) as created_by_name
     FROM events e
     JOIN categories c ON c.id = e.category_id
     WHERE datetime(e.end_date || 'T' || e.end_time) >= datetime('now')
     ORDER BY datetime(e.start_date || 'T' || e.start_time) DESC`
  );
}

export async function getEventDetail(eventId: number) {
  const event = await getSingle<EventWithMeta>(
    `SELECT e.*, c.name as category_name,
            (SELECT COUNT(1) FROM event_attendees ea WHERE ea.event_id = e.id) as attendees_count
     FROM events e
     JOIN categories c ON c.id = e.category_id
     WHERE e.id=?`,
    [eventId]
  );
  if (!event) return undefined;
  const attendees = await getAll<User>(
    `SELECT u.* FROM users u
     JOIN event_attendees ea ON ea.user_id = u.id
     WHERE ea.event_id = ?
     ORDER BY u.name IS NULL, u.name ASC`,
    [eventId]
  );
  const creator = await getSingle<User>(`SELECT * FROM users WHERE id=?`, [event.created_by]);
  return { event, attendees, attendeesCount: attendees.length, createdBy: creator };
}

export async function attendEvent(eventId: number, userId: string) {
  await run(`INSERT OR IGNORE INTO event_attendees(event_id, user_id) VALUES(?, ?)`, [eventId, userId]);
}

export async function unattendEvent(eventId: number, userId: string) {
  await run(`DELETE FROM event_attendees WHERE event_id=? AND user_id=?`, [eventId, userId]);
}

export async function createEvent(e: Omit<Event, 'id'>) {
  await run(
    `INSERT INTO events(name, place, start_date, end_date, start_time, end_time, category_id, description, created_by)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [e.name, e.place ?? null, e.start_date, e.end_date, e.start_time, e.end_time, e.category_id, e.description ?? null, e.created_by]
  );
  const row = await getSingle<{ id: number }>(`SELECT last_insert_rowid() as id`);
  return row?.id;
}

export async function updateEvent(eventId: number, data: Partial<Omit<Event, 'id' | 'created_by'>>) {
  const fields: string[] = [];
  const params: any[] = [];
  const push = (f: string, v: any) => { fields.push(`${f}=?`); params.push(v); };
  if (data.name !== undefined) push('name', data.name);
  if (data.place !== undefined) push('place', data.place);
  if (data.start_date !== undefined) push('start_date', data.start_date);
  if (data.end_date !== undefined) push('end_date', data.end_date);
  if (data.start_time !== undefined) push('start_time', data.start_time);
  if (data.end_time !== undefined) push('end_time', data.end_time);
  if (data.category_id !== undefined) push('category_id', data.category_id);
  if (data.description !== undefined) push('description', data.description);
  if (!fields.length) return;
  params.push(eventId);
  await run(`UPDATE events SET ${fields.join(', ')} WHERE id=?`, params);
}

export async function deleteEvent(eventId: number) {
  await run(`DELETE FROM events WHERE id=?`, [eventId]);
}

export async function getEventsCreatedByUser(userId: string) {
  return getAll<EventWithMeta>(
    `SELECT e.*, c.name as category_name,
            (SELECT COUNT(1) FROM event_attendees ea WHERE ea.event_id = e.id) as attendees_count
     FROM events e
     JOIN categories c ON c.id = e.category_id
     WHERE e.created_by = ?
     ORDER BY datetime(e.start_date || 'T' || e.start_time) DESC`,
    [userId]
  );
}

export async function getEventsUserWillAttend(userId: string) {
  return getAll<EventWithMeta>(
    `SELECT e.*, c.name as category_name,
            (SELECT COUNT(1) FROM event_attendees ea WHERE ea.event_id = e.id) as attendees_count
     FROM event_attendees ea
     JOIN events e ON e.id = ea.event_id
     JOIN categories c ON c.id = e.category_id
     WHERE ea.user_id = ?
     ORDER BY datetime(e.start_date || 'T' || e.start_time) DESC`,
    [userId]
  );
}
