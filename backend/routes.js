import express from "express";
import db from "./database.js";
import aiService from "./aiService.js";

const router = express.Router();

// ==================== USER ROUTES ====================

// Create or get user
router.post("/user", (req, res) => {
  try {
    const { name, email } = req.body;

    const existing = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      return res.json({ success: true, user: existing });
    }

    const result = db
      .prepare("INSERT INTO users (name, email) VALUES (?, ?)")
      .run(name, email);
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(result.lastInsertRowid);

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user data
router.get("/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== INCOME ROUTES ====================

router.post("/income", (req, res) => {
  try {
    const { userId, amount, source, frequency } = req.body;

    const result = db
      .prepare(
        "INSERT INTO income (user_id, amount, source, frequency) VALUES (?, ?, ?, ?)"
      )
      .run(userId, amount, source, frequency);

    const income = db
      .prepare("SELECT * FROM income WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ success: true, income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/income/:id", (req, res) => {
  try {
    const { amount, source, frequency } = req.body;
    db.prepare(
      "UPDATE income SET amount = ?, source = ?, frequency = ? WHERE id = ?"
    ).run(amount, source, frequency, req.params.id);

    const updated = db
      .prepare("SELECT * FROM income WHERE id = ?")
      .get(req.params.id);
    res.json({ success: true, message: "Income updated", income: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/income/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const incomes = db
      .prepare(
        "SELECT * FROM income WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId);

    const totalMonthly = incomes.reduce((sum, inc) => {
      const multiplier =
        inc.frequency === "monthly"
          ? 1
          : inc.frequency === "biweekly"
          ? 2.17
          : inc.frequency === "weekly"
          ? 4.33
          : 12;
      return (
        sum +
        (parseFloat(inc.amount) * multiplier) /
          (inc.frequency === "annual" ? 12 : 1)
      );
    }, 0);

    res.json({ success: true, incomes, totalMonthly: totalMonthly.toFixed(2) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/income/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM income WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Income deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EXPENSE ROUTES ====================

router.post("/expenses", (req, res) => {
  try {
    const { userId, amount, category, description, date, recurring } = req.body;

    const result = db
      .prepare(
        "INSERT INTO expenses (user_id, amount, category, description, date, recurring) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(userId, amount, category, description, date, recurring ? 1 : 0);

    const expense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/expenses/:id", (req, res) => {
  try {
    const { amount, category, description, date, recurring } = req.body;
    db.prepare(
      "UPDATE expenses SET amount = ?, category = ?, description = ?, date = ?, recurring = ? WHERE id = ?"
    ).run(
      amount,
      category,
      description,
      date,
      recurring ? 1 : 0,
      req.params.id
    );

    const updated = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(req.params.id);
    res.json({ success: true, message: "Expense updated", expense: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/expenses/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC")
      .all(userId);

    // Calculate by category
    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += parseFloat(exp.amount);
      return acc;
    }, {});

    const total = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    res.json({
      success: true,
      expenses,
      byCategory: Object.entries(byCategory).map(([name, amount]) => ({
        name,
        amount: amount.toFixed(2),
        percentage: ((amount / total) * 100).toFixed(1),
      })),
      total: total.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/expenses/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DEBT ROUTES ====================

router.post("/debts", (req, res) => {
  try {
    const { userId, name, balance, interestRate, minimumPayment, type } =
      req.body;

    const result = db
      .prepare(
        "INSERT INTO debts (user_id, name, balance, interest_rate, minimum_payment, type) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(userId, name, balance, interestRate, minimumPayment, type);

    const debt = db
      .prepare("SELECT * FROM debts WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ success: true, debt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/debts/:id", (req, res) => {
  try {
    const { name, balance, interestRate, minimumPayment, type } = req.body;
    db.prepare(
      "UPDATE debts SET name = ?, balance = ?, interest_rate = ?, minimum_payment = ?, type = ? WHERE id = ?"
    ).run(name, balance, interestRate, minimumPayment, type, req.params.id);

    const updated = db
      .prepare("SELECT * FROM debts WHERE id = ?")
      .get(req.params.id);
    res.json({ success: true, message: "Debt updated", debt: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/debts/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const debts = db
      .prepare(
        "SELECT * FROM debts WHERE user_id = ? ORDER BY interest_rate DESC"
      )
      .all(userId);

    const total = debts.reduce(
      (sum, debt) => sum + parseFloat(debt.balance),
      0
    );
    const monthlyPayment = debts.reduce(
      (sum, debt) => sum + parseFloat(debt.minimum_payment),
      0
    );

    res.json({
      success: true,
      debts,
      total: total.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/debts/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM debts WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Debt deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SAVINGS GOALS ROUTES ====================

router.post("/savings", (req, res) => {
  try {
    const { userId, name, targetAmount, currentAmount, targetDate } = req.body;

    const result = db
      .prepare(
        "INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?)"
      )
      .run(userId, name, targetAmount, currentAmount || 0, targetDate);

    const goal = db
      .prepare("SELECT * FROM savings_goals WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/savings/:id", (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    db.prepare(
      "UPDATE savings_goals SET name = ?, target_amount = ?, current_amount = ?, target_date = ? WHERE id = ?"
    ).run(name, targetAmount, currentAmount, targetDate, req.params.id);

    const updated = db
      .prepare("SELECT * FROM savings_goals WHERE id = ?")
      .get(req.params.id);
    res.json({ success: true, message: "Savings goal updated", goal: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/savings/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const goals = db
      .prepare(
        "SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId);

    const total = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.current_amount),
      0
    );
    const targetTotal = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.target_amount),
      0
    );

    res.json({
      success: true,
      goals,
      total: total.toFixed(2),
      targetTotal: targetTotal.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/savings/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM savings_goals WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Savings goal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BILLS ROUTES ====================

router.post("/bills", (req, res) => {
  try {
    const { userId, name, amount, dueDate, frequency, category, autoPay } =
      req.body;

    const result = db
      .prepare(
        "INSERT INTO bills (user_id, name, amount, due_date, frequency, category, auto_pay) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(userId, name, amount, dueDate, frequency, category, autoPay ? 1 : 0);

    const bill = db
      .prepare("SELECT * FROM bills WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/bills/:id", (req, res) => {
  try {
    const { name, amount, dueDate, frequency, category, autoPay } = req.body;
    db.prepare(
      "UPDATE bills SET name = ?, amount = ?, due_date = ?, frequency = ?, category = ?, auto_pay = ? WHERE id = ?"
    ).run(
      name,
      amount,
      dueDate,
      frequency,
      category,
      autoPay ? 1 : 0,
      req.params.id
    );

    const updated = db
      .prepare("SELECT * FROM bills WHERE id = ?")
      .get(req.params.id);
    res.json({ success: true, message: "Bill updated", bill: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/bills/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const bills = db
      .prepare("SELECT * FROM bills WHERE user_id = ? ORDER BY due_date")
      .all(userId);

    const total = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

    res.json({
      success: true,
      bills,
      total: total.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/bills/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM bills WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== AI ANALYSIS ROUTES ====================

// Get complete financial snapshot
router.get("/financial-snapshot/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Gather all user data
    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);
    const savingsGoals = db
      .prepare("SELECT * FROM savings_goals WHERE user_id = ?")
      .all(userId);
    const bills = db
      .prepare("SELECT * FROM bills WHERE user_id = ?")
      .all(userId);

    const totalIncome = income.reduce(
      (sum, inc) => sum + parseFloat(inc.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const userData = {
      income: {
        total: totalIncome,
        sources: income,
      },
      expenses: {
        total: totalExpenses,
        byCategory: expenses.reduce((acc, exp) => {
          const cat = exp.category;
          if (!acc.find((c) => c.category === cat)) {
            acc.push({ category: cat, amount: 0 });
          }
          const idx = acc.findIndex((c) => c.category === cat);
          acc[idx].amount += parseFloat(exp.amount);
          return acc;
        }, []),
      },
      debts: {
        total: debts.reduce((sum, d) => sum + parseFloat(d.balance), 0),
        list: debts,
      },
      savingsGoals: savingsGoals,
      bills: bills,
    };

    const analysis = await aiService.generateFinancialSnapshot(userData);

    res.json({ success: true, snapshot: userData, analysis: analysis.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze budget
router.post("/analyze-budget", async (req, res) => {
  try {
    const { userId } = req.body;

    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);
    const bills = db
      .prepare("SELECT * FROM bills WHERE user_id = ?")
      .all(userId);

    const totalIncome = income.reduce(
      (sum, inc) => sum + parseFloat(inc.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.balance), 0);
    const debtPayment = debts.reduce(
      (sum, d) => sum + parseFloat(d.minimum_payment),
      0
    );

    const userData = {
      income: totalIncome,
      expenses: {
        total: totalExpenses,
        byCategory: expenses.reduce((acc, exp) => {
          if (!acc.find((c) => c.name === exp.category)) {
            acc.push({ name: exp.category, amount: 0 });
          }
          const idx = acc.findIndex((c) => c.name === exp.category);
          acc[idx].amount += parseFloat(exp.amount);
          return acc;
        }, []),
      },
      debts: {
        total: totalDebt,
        monthlyPayment: debtPayment,
      },
      bills: {
        count: bills.length,
        total: bills.reduce((sum, b) => sum + parseFloat(b.amount), 0),
      },
    };

    const analysis = await aiService.analyzeBudget(userData);

    // Save the plan
    db.prepare(
      "INSERT INTO budget_plans (user_id, plan_type, plan_data) VALUES (?, ?, ?)"
    ).run(userId, "budget_analysis", JSON.stringify(analysis));

    res.json({ success: true, analysis: analysis.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create debt payoff plan
router.post("/debt-payoff-plan", async (req, res) => {
  try {
    const { userId, strategy } = req.body;

    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);
    const savings = db
      .prepare("SELECT * FROM savings_goals WHERE user_id = ?")
      .all(userId);

    const totalIncome = income.reduce(
      (sum, inc) => sum + parseFloat(inc.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const emergencyFund = savings.find((s) =>
      s.name.toLowerCase().includes("emergency")
    );

    const userData = {
      income: totalIncome,
      expenses: {
        total: totalExpenses,
      },
      debts: {
        list: debts.map((d) => ({
          name: d.name,
          balance: parseFloat(d.balance),
          interestRate: parseFloat(d.interest_rate),
          minimumPayment: parseFloat(d.minimum_payment),
        })),
      },
      savingsGoals: {
        emergency: emergencyFund
          ? {
              target: parseFloat(emergencyFund.target_amount),
              current: parseFloat(emergencyFund.current_amount),
            }
          : null,
      },
    };

    const plan = await aiService.createDebtPayoffPlan(userData, strategy);

    // Save the plan
    db.prepare(
      "INSERT INTO budget_plans (user_id, plan_type, plan_data) VALUES (?, ?, ?)"
    ).run(userId, "debt_payoff", JSON.stringify(plan));

    res.json({ success: true, plan: plan.text, data: plan.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat with AI
router.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Get conversation history
    const history = db
      .prepare(
        "SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
      )
      .all(userId);

    // Get user financial data
    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);
    const savings = db
      .prepare("SELECT * FROM savings_goals WHERE user_id = ?")
      .all(userId);

    const userData =
      income.length > 0
        ? {
            income: {
              total: income.reduce(
                (sum, inc) => sum + parseFloat(inc.amount),
                0
              ),
            },
            expenses: {
              total: expenses.reduce(
                (sum, exp) => sum + parseFloat(exp.amount),
                0
              ),
            },
            debts: {
              total: debts.reduce((sum, d) => sum + parseFloat(d.balance), 0),
            },
            savings: {
              total: savings.reduce(
                (sum, s) => sum + parseFloat(s.current_amount),
                0
              ),
            },
          }
        : null;

    const response = await aiService.chat(message, history, userData);

    // Save conversation
    db.prepare(
      "INSERT INTO conversations (user_id, message, response) VALUES (?, ?, ?)"
    ).run(userId, message, response.text);

    res.json({ success: true, response: response.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compare debt strategies
router.post("/compare-debt-strategies", async (req, res) => {
  try {
    const { userId } = req.body;

    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);

    const totalIncome = income.reduce(
      (sum, inc) => sum + parseFloat(inc.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const userData = {
      income: totalIncome,
      expenses: {
        total: totalExpenses,
      },
      debts: {
        list: debts.map((d) => ({
          name: d.name,
          balance: parseFloat(d.balance),
          interestRate: parseFloat(d.interest_rate),
          minimumPayment: parseFloat(d.minimum_payment),
        })),
      },
    };

    const comparison = await aiService.compareDebtStrategies(userData);

    res.json({
      success: true,
      comparison: comparison.text,
      data: comparison.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
