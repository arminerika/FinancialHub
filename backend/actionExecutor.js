import db from "./database.js";

/**
 * Action Executor - Executes structured commands against the database
 * This is what makes the agent actually DO things
 */

class ActionExecutor {
  /**
   * Execute a single command
   */
  async executeCommand(command, userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { action, data, confidence } = command;

    // Log execution for debugging
    console.log(
      `Executing ${action} with confidence ${confidence} for user ${userId}`
    );

    try {
      switch (action) {
        case "CREATE_INCOME":
          return await this.createIncome(userId, data);

        case "CREATE_EXPENSE":
          return await this.createExpense(userId, data);

        case "CREATE_DEBT":
          return await this.createDebt(userId, data);

        case "CREATE_SAVINGS_GOAL":
          return await this.createSavingsGoal(userId, data);

        case "CREATE_BILL":
          return await this.createBill(userId, data);

        case "GENERATE_BUDGET_ANALYSIS":
          return await this.generateBudgetAnalysis(userId);

        case "GENERATE_DEBT_PLAN":
          return await this.generateDebtPlan(userId, data);

        case "GENERATE_SAVINGS_PLAN":
          return await this.generateSavingsPlan(userId, data);

        case "ASK_QUESTION":
          return {
            success: true,
            action: "ASK_QUESTION",
            message:
              data.question ||
              "I need more information. Can you provide more details?",
            needsResponse: true,
          };

        case "CONVERSATION":
          return {
            success: true,
            action: "CONVERSATION",
            message: "I understand. How can I help you with your finances?",
            needsAIResponse: true,
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${action}`,
          };
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      return {
        success: false,
        action,
        error: error.message,
      };
    }
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands, userId) {
    const results = [];

    for (const command of commands) {
      const result = await this.executeCommand(command, userId);
      results.push({
        command: command.action,
        confidence: command.confidence,
        ...result,
      });
    }

    return results;
  }

  /**
   * Create income entry
   */
  async createIncome(userId, data) {
    const { source = "Income", amount = 0, frequency = "monthly" } = data;

    // ADD THIS VALIDATION
    if (!amount || amount <= 0) {
      return {
        success: false,
        action: "CREATE_INCOME",
        message: "❌ Income amount is required and must be greater than 0",
      };
    }

    const stmt = db.prepare(`
      INSERT INTO income (user_id, source, amount, frequency)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(userId, source, amount, frequency);

    return {
      success: true,
      action: "CREATE_INCOME",
      id: result.lastInsertRowid,
      message: `✅ Added income: $${amount}/${frequency} from ${source}`,
      data: { id: result.lastInsertRowid, source, amount, frequency },
    };
  }

  /**
   * Create expense entry
   */
  async createExpense(userId, data) {
    const { description, amount, category, recurring = false, date } = data;
    const expenseDate = date || new Date().toISOString().split("T")[0];

    // ADD THIS VALIDATION
    if (!amount || amount <= 0) {
      return {
        success: false,
        action: "CREATE_EXPENSE",
        message: "❌ Expense amount is required and must be greater than 0",
      };
    }

    const stmt = db.prepare(`
      INSERT INTO expenses (user_id, description, amount, category, date, recurring)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      description,
      amount,
      category,
      expenseDate,
      recurring ? 1 : 0
    );

    return {
      success: true,
      action: "CREATE_EXPENSE",
      id: result.lastInsertRowid,
      message: `✅ Added expense: $${amount} for ${description} (${category})`,
      data: {
        id: result.lastInsertRowid,
        description,
        amount,
        category,
        date: expenseDate,
      },
    };
  }

  /**
   * Create debt entry
   */
  async createDebt(userId, data) {
    const {
      name,
      balance,
      interestRate = 0,
      minimumPayment = balance * 0.02,
      dueDate = 1,
    } = data;

    // ADD THIS VALIDATION
    if (!balance || balance <= 0) {
      return {
        success: false,
        action: "CREATE_DEBT",
        message: "❌ Debt balance is required and must be greater than 0",
      };
    }

    const stmt = db.prepare(`
      INSERT INTO debts (user_id, name, balance, interest_rate, minimum_payment, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      name,
      balance,
      interestRate,
      minimumPayment,
      dueDate
    );

    return {
      success: true,
      action: "CREATE_DEBT",
      id: result.lastInsertRowid,
      message: `✅ Added debt: ${name} - $${balance}${
        interestRate ? ` at ${interestRate}% APR` : ""
      }`,
      data: {
        id: result.lastInsertRowid,
        name,
        balance,
        interestRate,
        minimumPayment,
      },
    };
  }

  /**
   * Create savings goal
   */
  async createSavingsGoal(userId, data) {
    const {
      name,
      targetAmount,
      currentAmount = 0,
      targetDate,
      monthlyContribution = 0,
    } = data;

    const stmt = db.prepare(`
      INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, monthly_contribution)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      name,
      targetAmount,
      currentAmount,
      targetDate,
      monthlyContribution
    );

    return {
      success: true,
      action: "CREATE_SAVINGS_GOAL",
      id: result.lastInsertRowid,
      message: `✅ Added savings goal: ${name} - Target $${targetAmount}`,
      data: {
        id: result.lastInsertRowid,
        name,
        targetAmount,
        currentAmount,
        targetDate,
      },
    };
  }

  /**
   * Create bill entry
   */
  async createBill(userId, data) {
    const {
      name = "Unnamed Bill", // ADD DEFAULT
      amount = 0, // ADD DEFAULT
      dueDate = 1,
      frequency = "monthly",
      autoPay = false,
      category = "Other",
    } = data;

    const stmt = db.prepare(`
      INSERT INTO bills (user_id, name, amount, due_date, frequency, auto_pay, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      name,
      amount,
      dueDate,
      frequency,
      autoPay ? 1 : 0,
      category
    );

    return {
      success: true,
      action: "CREATE_BILL",
      id: result.lastInsertRowid,
      message: `✅ Added bill: ${name} - $${amount}/${frequency} (Due: ${dueDate}th)`,
      data: { id: result.lastInsertRowid, name, amount, dueDate, frequency },
    };
  }

  /**
   * Generate budget analysis
   */
  async generateBudgetAnalysis(userId) {
    // Get user's financial data
    const income = db
      .prepare("SELECT * FROM income WHERE user_id = ?")
      .all(userId);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE user_id = ?")
      .all(userId);

    const totalIncome = income.reduce((sum, i) => {
      const multiplier =
        i.frequency === "monthly"
          ? 1
          : i.frequency === "biweekly"
          ? 2.17
          : i.frequency === "weekly"
          ? 4.33
          : 1 / 12;
      return sum + i.amount * multiplier;
    }, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      success: true,
      action: "GENERATE_BUDGET_ANALYSIS",
      message: `📊 Budget Analysis: Monthly income $${totalIncome.toFixed(
        2
      )}, expenses $${totalExpenses.toFixed(2)}, ${
        totalIncome > totalExpenses ? "surplus" : "deficit"
      } $${Math.abs(totalIncome - totalExpenses).toFixed(2)}`,
      data: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
      needsAIResponse: true,
    };
  }

  /**
   * Generate debt payoff plan
   */
  async generateDebtPlan(userId, data = {}) {
    const debts = db
      .prepare("SELECT * FROM debts WHERE user_id = ?")
      .all(userId);

    if (debts.length === 0) {
      return {
        success: false,
        action: "GENERATE_DEBT_PLAN",
        message: "❌ No debts found. Add your debts first.",
        needsMoreData: true,
      };
    }

    return {
      success: true,
      action: "GENERATE_DEBT_PLAN",
      message: `📋 Generating debt payoff plan for ${debts.length} debt(s)...`,
      data: { debtCount: debts.length, debts },
      needsAIResponse: true,
    };
  }

  /**
   * Generate savings plan
   */
  async generateSavingsPlan(userId, data = {}) {
    const goals = db
      .prepare("SELECT * FROM savings_goals WHERE user_id = ?")
      .all(userId);

    if (goals.length === 0) {
      return {
        success: false,
        action: "GENERATE_SAVINGS_PLAN",
        message: "❌ No savings goals found. Add your goals first.",
        needsMoreData: true,
      };
    }

    return {
      success: true,
      action: "GENERATE_SAVINGS_PLAN",
      message: `💰 Generating savings plan for ${goals.length} goal(s)...`,
      data: { goalCount: goals.length, goals },
      needsAIResponse: true,
    };
  }

  /**
   * Get user's complete financial snapshot
   */
  async getFinancialSnapshot(userId) {
    return {
      income: db.prepare("SELECT * FROM income WHERE user_id = ?").all(userId),
      expenses: db
        .prepare("SELECT * FROM expenses WHERE user_id = ?")
        .all(userId),
      debts: db.prepare("SELECT * FROM debts WHERE user_id = ?").all(userId),
      savings: db
        .prepare("SELECT * FROM savings_goals WHERE user_id = ?")
        .all(userId),
      bills: db.prepare("SELECT * FROM bills WHERE user_id = ?").all(userId),
    };
  }
}

export default new ActionExecutor();
