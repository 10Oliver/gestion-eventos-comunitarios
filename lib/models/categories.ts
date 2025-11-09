import { getAll } from '../db';

export type Category = { id: number; name: string };

export async function getAllCategories(): Promise<Category[]> {
  return getAll<Category>(`SELECT id, name FROM categories ORDER BY name ASC`);
}
