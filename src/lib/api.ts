import type { Expense, Budget } from "@/context/ExpenseContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAppState() {
  return request<{ expenses: Expense[]; budgets: Budget[]; currency: string }>("/api/state");
}

export async function createExpense(expense: Expense) {
  return request<Expense>("/api/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
}

export async function updateExpenseById(expense: Expense) {
  return request<Expense>(`/api/expenses/${expense.id}`, {
    method: "PUT",
    body: JSON.stringify(expense),
  });
}

export async function deleteExpenseById(id: string) {
  return request<void>(`/api/expenses/${id}`, {
    method: "DELETE",
  });
}

export async function upsertBudget(budget: Budget) {
  return request<Budget>("/api/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });
}

export async function deleteBudgetByCategory(category: string) {
  return request<void>(`/api/budgets/${category}`, {
    method: "DELETE",
  });
}

export async function setCurrencyOnServer(currency: string) {
  return request<{ currency: string }>("/api/settings/currency", {
    method: "PUT",
    body: JSON.stringify({ currency }),
  });
}
