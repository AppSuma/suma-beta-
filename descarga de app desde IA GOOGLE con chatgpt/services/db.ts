
import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Case } from '../types';

const DB_NAME = 'SumaDB';
const DB_VERSION = 1;
const STORE_NAME = 'cases';

interface SumaDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: Case;
    indexes: { 'startTime': string };
  };
}

let dbPromise: Promise<IDBPDatabase<SumaDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<SumaDB>> => {
    if (!dbPromise) {
        dbPromise = openDB<SumaDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('startTime', 'startTime');
            },
        });
    }
    return dbPromise;
}

export const addCase = async (caseData: Case): Promise<number> => {
  const db = await getDb();
  return await db.add(STORE_NAME, caseData);
};

export const updateCase = async (caseData: Case): Promise<number> => {
  const db = await getDb();
  return await db.put(STORE_NAME, caseData);
};

export const getCase = async (id: number): Promise<Case | undefined> => {
  const db = await getDb();
  return await db.get(STORE_NAME, id);
};

export const getAllCases = async (): Promise<Case[]> => {
  const db = await getDb();
  return await db.getAll(STORE_NAME);
};
