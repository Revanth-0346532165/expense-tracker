import { openDB } from "idb";
import type { Expense, Budget } from "@/context/ExpenseContext";

const DB_NAME = "finance-buddy-db";
const STORE_NAME = "app-state";
const STATE_KEY = "finance-buddy-state";

export interface PersistedState {
  id: typeof STATE_KEY;
  expenses: Expense[];
  budgets: Budget[];
  currency: string;
}

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function getExpenseState(): Promise<PersistedState | null> {
  const db = await getDb();
  return await db.get(STORE_NAME, STATE_KEY);
}

export async function saveExpenseState(state: Omit<PersistedState, "id">): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, { id: STATE_KEY, ...state });
}

export async function clearExpenseState(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
