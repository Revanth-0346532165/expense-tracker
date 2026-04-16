import { useExpenses } from "@/context/ExpenseContext";
import { getCurrencySymbol } from "@/lib/categories";
import { format, subMonths } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign, CalendarDays } from "lucide-react";

export default function StatsCards() {
  const { expenses, currency, getTotalSpent } = useExpenses();
  const symbol = getCurrencySymbol(currency);
  const currentMonth = format(new Date(), "yyyy-MM");
  const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");
  const thisMonthTotal = getTotalSpent(undefined, currentMonth);
  const lastMonthTotal = getTotalSpent(undefined, lastMonth);
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const change = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  const stats = [
    {
      label: "This Month",
      value: `${symbol}${thisMonthTotal.toFixed(2)}`,
      icon: CalendarDays,
      accent: "text-primary",
    },
    {
      label: "Last Month",
      value: `${symbol}${lastMonthTotal.toFixed(2)}`,
      icon: DollarSign,
      accent: "text-muted-foreground",
    },
    {
      label: "Month Change",
      value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
      icon: change >= 0 ? TrendingUp : TrendingDown,
      accent: change > 0 ? "text-destructive" : "text-success",
    },
    {
      label: "Total Expenses",
      value: `${symbol}${totalAll.toFixed(2)}`,
      icon: DollarSign,
      accent: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <s.icon className={`h-4 w-4 ${s.accent}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className={`text-lg sm:text-xl font-bold ${s.accent}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
