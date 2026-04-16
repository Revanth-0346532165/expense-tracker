import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adapter = new JSONFileSync(dbPath);
const db = new LowSync(adapter, {
  expenses: [],
  budgets: [],
  settings: { currency: "USD" },
});

db.read();
if (!db.data) {
  db.data = { expenses: [], budgets: [], settings: { currency: "USD" } };
  db.write();
}

function saveDb() {
  db.write();
}

export function getState() {
  db.read();
  return {
    expenses: [...(db.data.expenses ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    budgets: db.data.budgets ?? [],
    currency: db.data.settings?.currency ?? "USD",
  };
}

export function createExpense(expense) {
  db.read();
  db.data.expenses.push(expense);
  saveDb();
  return expense;
}

export function updateExpense(expense) {
  db.read();
  db.data.expenses = db.data.expenses.map((item) =>
    item.id === expense.id ? expense : item
  );
  saveDb();
  return expense;
}

export function deleteExpense(id) {
  db.read();
  db.data.expenses = db.data.expenses.filter((item) => item.id !== id);
  saveDb();
}

export function upsertBudget(budget) {
  db.read();
  db.data.budgets = db.data.budgets.filter((item) => item.category !== budget.category);
  db.data.budgets.push(budget);
  saveDb();
  return budget;
}

export function deleteBudget(category) {
  db.read();
  db.data.budgets = db.data.budgets.filter((item) => item.category !== category);
  saveDb();
}

export function setCurrency(currency) {
  db.read();
  db.data.settings = { ...(db.data.settings ?? {}), currency };
  saveDb();
  return currency;
}
