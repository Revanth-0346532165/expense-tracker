import { useState, useMemo } from "react";
import { useExpenses, type Category } from "@/context/ExpenseContext";
import { CATEGORIES, getCurrencySymbol, CURRENCIES } from "@/lib/categories";
import { exportToCSV } from "@/lib/export";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, ArrowUpDown, Wallet } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import StatsCards from "@/components/StatsCards";
import Charts from "@/components/Charts";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import BudgetManager from "@/components/BudgetManager";

type SortBy = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function Index() {
  const { expenses, currency, setCurrency } = useExpenses();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");

  const filtered = useMemo(() => {
    let result = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.description.toLowerCase().includes(q));
    }
    if (filterCategory !== "all") {
      result = result.filter((e) => e.category === filterCategory);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
      }
    });
    return result;
  }, [expenses, search, filterCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold sm:text-xl">ExpenseTracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ModeToggle />
            <ExpenseForm />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        <StatsCards />
        <Charts />
        <BudgetManager />

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36 sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-36 sm:w-40">
                <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
            {expenses.length > 0 && (
              <Button variant="outline" size="icon" onClick={() => exportToCSV(expenses)} title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
          <ExpenseList expenses={filtered} />
        </div>
      </main>
    </div>
  );
}
