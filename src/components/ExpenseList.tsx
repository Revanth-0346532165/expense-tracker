import { useExpenses, type Expense } from "@/context/ExpenseContext";
import { getCategoryInfo, getCurrencySymbol } from "@/lib/categories";
import { format } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpenseForm from "./ExpenseForm";

export default function ExpenseList({
  expenses,
}: {
  expenses: Expense[];
}) {
  const { deleteExpense, currency } = useExpenses();
  const symbol = getCurrencySymbol(currency);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No expenses yet</p>
        <p className="text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const cat = getCategoryInfo(expense.category);
        return (
          <div
            key={expense.id}
            className="glass-card flex items-center gap-3 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: cat.color + "20" }}
            >
              {cat.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm sm:text-base">{expense.description}</p>
              <p className="text-xs text-muted-foreground">
                {cat.label} · {format(new Date(expense.date), "MMM d, yyyy")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm sm:text-base">
                {symbol}{expense.amount.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <ExpenseForm
                expense={expense}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => deleteExpense(expense.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
