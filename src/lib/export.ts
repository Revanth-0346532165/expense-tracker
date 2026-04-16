import type { Expense } from "@/context/ExpenseContext";
import { getCategoryInfo, getCurrencySymbol } from "./categories";
import { format } from "date-fns";

export function exportToCSV(expenses: Expense[]) {
  const header = "Date,Description,Category,Amount,Currency\n";
  const rows = expenses
    .map(
      (e) =>
        `${format(new Date(e.date), "yyyy-MM-dd")},${e.description.replace(/,/g, ";")},${getCategoryInfo(e.category).label},${e.amount},${e.currency}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
