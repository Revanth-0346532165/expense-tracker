import type { Category } from "@/context/ExpenseContext";

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: "food", label: "Food & Dining", emoji: "🍔", color: "hsl(var(--chart-food))" },
  { value: "travel", label: "Travel", emoji: "✈️", color: "hsl(var(--chart-travel))" },
  { value: "bills", label: "Bills & Utilities", emoji: "💡", color: "hsl(var(--chart-bills))" },
  { value: "shopping", label: "Shopping", emoji: "🛍️", color: "hsl(var(--chart-shopping))" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬", color: "hsl(var(--chart-entertainment))" },
  { value: "health", label: "Health", emoji: "💊", color: "hsl(var(--chart-health))" },
  { value: "other", label: "Other", emoji: "📌", color: "hsl(var(--chart-other))" },
];

export function getCategoryInfo(category: Category) {
  return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[6];
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
];

export function getCurrencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}
