/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs/promises';
import path from 'path';
import { Store } from '../types.ts';

export const DEMO_USER_ID = 'demo-user';

type StoreData = Record<string, Record<string, unknown>>;

export class JsonFileStore implements Store {
  private filePath: string;
  private memoryCache: StoreData | null = null;
  private writeLock: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath = filePath || path.resolve(process.cwd(), '.data', 'store.json');
  }

  private async ensureInitialized(): Promise<StoreData> {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      const content = await fs.readFile(this.filePath, 'utf-8');
      this.memoryCache = JSON.parse(content) as StoreData;
      return this.memoryCache;
    } catch {
      // If file doesn't exist or is invalid, initialize empty store
      this.memoryCache = {};
      await this.persist();
      return this.memoryCache;
    }
  }

  private async persist(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    const serialized = JSON.stringify(this.memoryCache ?? {}, null, 2);
    // Atomic-like write using lock
    this.writeLock = this.writeLock.then(async () => {
      await fs.writeFile(this.filePath, serialized, 'utf-8');
    });
    await this.writeLock;
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const data = await this.ensureInitialized();
    const col = data[collection];
    if (!col || !(id in col)) {
      return null;
    }
    // Return a clone to avoid accidental mutation
    return JSON.parse(JSON.stringify(col[id])) as T;
  }

  async put<T>(collection: string, id: string, item: T): Promise<T> {
    const data = await this.ensureInitialized();
    if (!data[collection]) {
      data[collection] = {};
    }
    const cloned = JSON.parse(JSON.stringify(item));
    data[collection][id] = cloned;
    await this.persist();
    return cloned as T;
  }

  async list<T>(collection: string): Promise<T[]> {
    const data = await this.ensureInitialized();
    const col = data[collection];
    if (!col) {
      return [];
    }
    return Object.values(col).map((item) => JSON.parse(JSON.stringify(item)) as T);
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const data = await this.ensureInitialized();
    const col = data[collection];
    if (!col || !(id in col)) {
      return false;
    }
    delete col[id];
    await this.persist();
    return true;
  }
}

// Global singleton store instance
export const store: Store = new JsonFileStore();
