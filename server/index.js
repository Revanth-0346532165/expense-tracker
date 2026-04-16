import express from "express";
import cors from "cors";
import {
  getState,
  createExpense,
  updateExpense,
  deleteExpense,
  upsertBudget,
  deleteBudget,
  setCurrency,
} from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/state", (req, res) => {
  try {
    res.json(getState());
  } catch (error) {
    res.status(500).json({ error: "Unable to load state" });
  }
});

app.post("/api/expenses", (req, res) => {
  try {
    const expense = createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Unable to create expense" });
  }
});

app.put("/api/expenses/:id", (req, res) => {
  try {
    const expense = { ...req.body, id: req.params.id };
    res.json(updateExpense(expense));
  } catch (error) {
    res.status(500).json({ error: "Unable to update expense" });
  }
});

app.delete("/api/expenses/:id", (req, res) => {
  try {
    deleteExpense(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Unable to delete expense" });
  }
});

app.post("/api/budgets", (req, res) => {
  try {
    res.status(201).json(upsertBudget(req.body));
  } catch (error) {
    res.status(500).json({ error: "Unable to set budget" });
  }
});

app.delete("/api/budgets/:category", (req, res) => {
  try {
    deleteBudget(req.params.category);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Unable to delete budget" });
  }
});

app.put("/api/settings/currency", (req, res) => {
  try {
    const currency = setCurrency(req.body.currency);
    res.json({ currency });
  } catch (error) {
    res.status(500).json({ error: "Unable to update currency" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Finance Buddy backend listening at http://localhost:${port}`);
});
