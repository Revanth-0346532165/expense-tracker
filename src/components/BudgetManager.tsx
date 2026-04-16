import { useState } from "react";
import { useExpenses, type Category } from "@/context/ExpenseContext";
import { CATEGORIES, getCurrencySymbol } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BudgetManager() {
  const { budgets, setBudget, deleteBudget, getBudgetStatus, currency } = useExpenses();
  const symbol = getCurrencySymbol(currency);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("food");
  const [limit, setLimit] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) return;
    setBudget({ category, limit: parseFloat(limit) });
    setOpen(false);
    setLimit("");
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Budget Alerts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Set Monthly Budget</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Limit ({symbol})</Label>
                <Input type="number" step="0.01" min="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="500.00" required />
              </div>
              <Button type="submit" className="w-full">Set Budget</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No budgets set. Add one to track spending limits.</p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const status = getBudgetStatus(b.category);
            if (!status) return null;
            const cat = CATEGORIES.find((c) => c.value === b.category)!;
            const isOver = status.percentage >= 100;
            const isWarning = status.percentage >= 80;
            return (
              <div key={b.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    {cat.emoji} {cat.label}
                    {isOver && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    {isWarning && !isOver && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {symbol}{status.spent.toFixed(0)} / {symbol}{status.limit.toFixed(0)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteBudget(b.category)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Progress
                  value={Math.min(status.percentage, 100)}
                  className={`h-2 ${isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-warning" : ""}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
