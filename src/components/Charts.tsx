import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { getCurrencySymbol, CATEGORIES } from "@/lib/categories";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

export default function Charts() {
  const { expenses, currency } = useExpenses();
  const symbol = getCurrencySymbol(currency);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    const currentMonth = format(new Date(), "yyyy-MM");
    expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return CATEGORIES.filter((c) => map.has(c.value)).map((c) => ({
      name: c.label,
      value: map.get(c.value)!,
      color: c.color,
      emoji: c.emoji,
    }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(new Date()), 5),
      end: endOfMonth(new Date()),
    });
    return months.map((m) => {
      const key = format(m, "yyyy-MM");
      const total = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      return { month: format(m, "MMM"), total };
    });
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
        <p>Add some expenses to see charts</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
              {categoryData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${symbol}${v.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-2">
          {categoryData.map((d) => (
            <span key={d.name} className="category-badge text-foreground" style={{ backgroundColor: d.color + "20" }}>
              {d.emoji} {d.name}
            </span>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip formatter={(v: number) => `${symbol}${v.toFixed(2)}`} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
