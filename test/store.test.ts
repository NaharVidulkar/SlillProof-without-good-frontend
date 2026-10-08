import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JsonFileStore } from '../lib/server/store.ts';
import fs from 'fs/promises';
import path from 'path';

describe('JsonFileStore', () => {
  const testFilePath = path.resolve(process.cwd(), '.data', 'test-store.json');
  let store: JsonFileStore;

  beforeEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch {
      // ignore
    }
    store = new JsonFileStore(testFilePath);
  });

  afterEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch {
      // ignore
    }
  });

  it('stores and retrieves items correctly', async () => {
    const item = { id: 'item-1', name: 'Test Challenge', points: 100 };
    const saved = await store.put('challenges', 'item-1', item);
    expect(saved).toEqual(item);

    const fetched = await store.get('challenges', 'item-1');
    expect(fetched).toEqual(item);
  });

  it('returns null for nonexistent keys', async () => {
    const fetched = await store.get('challenges', 'does-not-exist');
    expect(fetched).toBeNull();
  });

  it('lists all items in a collection', async () => {
    await store.put('users', 'u1', { id: 'u1', name: 'Alice' });
    await store.put('users', 'u2', { id: 'u2', name: 'Bob' });

    const users = await store.list<{ id: string; name: string }>('users');
    expect(users.length).toBe(2);
    expect(users.map((u) => u.name)).toContain('Alice');
    expect(users.map((u) => u.name)).toContain('Bob');
  });

  it('deletes items correctly', async () => {
    await store.put('items', 'k1', { value: 42 });
    const deleted = await store.delete('items', 'k1');
    expect(deleted).toBe(true);

    const fetched = await store.get('items', 'k1');
    expect(fetched).toBeNull();

    const deleteAgain = await store.delete('items', 'k1');
    expect(deleteAgain).toBe(false);
  });
});
