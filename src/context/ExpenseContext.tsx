import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import { format } from "date-fns";
import { getExpenseState, saveExpenseState } from "@/lib/db";
import {
  fetchAppState,
  createExpense as createExpenseInServer,
  updateExpenseById as updateExpenseInServer,
  deleteExpenseById as deleteExpenseInServer,
  upsertBudget as upsertBudgetInServer,
  deleteBudgetByCategory as deleteBudgetInServer,
  setCurrencyOnServer,
} from "@/lib/api";

export type Category = "food" | "travel" | "bills" | "shopping" | "entertainment" | "health" | "other";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string; // ISO string
  currency: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

interface State {
  expenses: Expense[];
  budgets: Budget[];
  currency: string;
}

type Action =
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "SET_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: Category }
  | { type: "SET_CURRENCY"; payload: string }
  | { type: "LOAD_STATE"; payload: State };

const STORAGE_KEY = "expense-tracker-data";

const defaultState: State = {
  expenses: [],
  budgets: [],
  currency: "USD",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_EXPENSE":
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case "SET_BUDGET":
      return {
        ...state,
        budgets: state.budgets.some((b) => b.category === action.payload.category)
          ? state.budgets.map((b) =>
              b.category === action.payload.category ? action.payload : b
            )
          : [...state.budgets, action.payload],
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.category !== action.payload),
      };
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

interface ExpenseContextType extends State {
  addExpense: (expense: Omit<Expense, "id" | "currency">) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (category: Category) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  getTotalSpent: (category?: Category, month?: string) => number;
  getBudgetStatus: (category: Category) => { spent: number; limit: number; percentage: number } | null;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const saved = await fetchAppState();
        if (!cancelled && saved) {
          dispatch({ type: "LOAD_STATE", payload: saved });
          return;
        }
      } catch {
        setBackendAvailable(false);
      }

      try {
        const saved = await getExpenseState();
        if (!cancelled && saved) {
          dispatch({ type: "LOAD_STATE", payload: saved });
          return;
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!cancelled && stored) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(stored) });
        }
      } catch {
        // keep default state if database load fails
      }
    }

    loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveExpenseState({
      expenses: state.expenses,
      budgets: state.budgets,
      currency: state.currency,
    }).catch(() => {
      // ignore save errors so the UI remains responsive
    });
  }, [state]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id" | "currency">) => {
      const payload = { ...expense, id: crypto.randomUUID(), currency: state.currency };
      dispatch({ type: "ADD_EXPENSE", payload });

      if (!backendAvailable) return;

      try {
        await createExpenseInServer(payload);
      } catch {
        setBackendAvailable(false);
      }
    },
    [state.currency, backendAvailable]
  );

  const updateExpense = useCallback(
    async (expense: Expense) => {
      dispatch({ type: "UPDATE_EXPENSE", payload: expense });

      if (!backendAvailable) return;

      try {
        await updateExpenseInServer(expense);
      } catch {
        setBackendAvailable(false);
      }
    },
    [backendAvailable]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      dispatch({ type: "DELETE_EXPENSE", payload: id });

      if (!backendAvailable) return;

      try {
        await deleteExpenseById(id);
      } catch {
        setBackendAvailable(false);
      }
    },
    [backendAvailable]
  );

  const setBudget = useCallback(
    async (budget: Budget) => {
      dispatch({ type: "SET_BUDGET", payload: budget });

      if (!backendAvailable) return;

      try {
        await upsertBudgetInServer(budget);
      } catch {
        setBackendAvailable(false);
      }
    },
    [backendAvailable]
  );

  const deleteBudget = useCallback(
    async (category: Category) => {
      dispatch({ type: "DELETE_BUDGET", payload: category });

      if (!backendAvailable) return;

      try {
        await deleteBudgetInServer(category);
      } catch {
        setBackendAvailable(false);
      }
    },
    [backendAvailable]
  );

  const setCurrency = useCallback(
    async (currency: string) => {
      dispatch({ type: "SET_CURRENCY", payload: currency });

      if (!backendAvailable) return;

      try {
        await setCurrencyOnServer(currency);
      } catch {
        setBackendAvailable(false);
      }
    },
    [backendAvailable]
  );

  const getTotalSpent = useCallback(
    (category?: Category, month?: string) => {
      return state.expenses
        .filter((e) => {
          if (category && e.category !== category) return false;
          if (month && !e.date.startsWith(month)) return false;
          return true;
        })
        .reduce((sum, e) => sum + e.amount, 0);
    },
    [state.expenses]
  );

  const getBudgetStatus = useCallback(
    (category: Category) => {
      const budget = state.budgets.find((b) => b.category === category);
      if (!budget) return null;
      const currentMonth = format(new Date(), "yyyy-MM");
      const spent = getTotalSpent(category, currentMonth);
      return { spent, limit: budget.limit, percentage: (spent / budget.limit) * 100 };
    },
    [state.budgets, getTotalSpent]
  );

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        addExpense,
        updateExpense,
        deleteExpense,
        setBudget,
        deleteBudget,
        setCurrency,
        getTotalSpent,
        getBudgetStatus,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpenseProvider");
  return ctx;
}
