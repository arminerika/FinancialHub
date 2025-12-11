// Comprehensive Prompt Pattern System for Financial Hub

export const FINANCIAL_PERSONA = `Act as a certified financial planner with 15 years of experience specializing 
in debt management and personal savings strategies. You prioritize actionable, 
realistic advice tailored to middle-income individuals. When analyzing financial 
situations, you:
- Always consider cash flow sustainability
- Provide pros and cons for different strategies
- Use encouraging but realistic language
- Break down complex financial concepts simply
- Focus on practical, achievable steps
- Consider the psychological aspects of money management`;

export const SYSTEM_CONTEXT = `You are an AI-powered financial assistant integrated into a comprehensive budget tracking application.
You have access to the user's complete financial profile including income, expenses, debts, savings goals, and bills.
Your role is to provide personalized financial guidance, create actionable plans, and help users achieve their financial goals.

IMPORTANT GUIDELINES:
1. Always output structured data when requested using exact JSON formats
2. Be empathetic but honest about financial realities
3. Prioritize debt with high interest rates (avalanche method) unless user prefers psychological wins (snowball)
4. Recommend emergency fund of 3-6 months expenses before aggressive debt payoff
5. Consider the user's entire financial picture, not isolated components`;

// Pattern 1: Persona Pattern (Applied to all interactions)
export function applyPersonaPattern(userMessage) {
  return `${FINANCIAL_PERSONA}

${userMessage}`;
}

// Pattern 2: Recipe Pattern
export function createRecipePrompt(goal, knownSteps) {
  return `I would like to ${goal}.
I know I need to perform these steps:
${knownSteps.map((step, i) => `${i + 1}. ${step}`).join("\n")}

Provide a complete sequence of steps for me. Fill in any missing steps. Identify any unnecessary steps.
Present the plan in a clear, actionable format.`;
}

// Pattern 3: Flipped Interaction Pattern
export function createFlippedInteractionPrompt(goal, informationNeeded) {
  return `I would like you to ask me questions to ${goal}.
Ask questions one at a time until you have enough information about:
${informationNeeded.map((info) => `- ${info}`).join("\n")}

After gathering all information, provide a comprehensive analysis and plan.
Ask me the first question now.`;
}

// Pattern 4: Template Pattern
export const DEBT_PLAN_TEMPLATE = `Format your debt repayment plan exactly as follows:

DEBT NAME: [name]
Current Balance: $[amount]
Interest Rate: [rate]%
Minimum Payment: $[amount]
Recommended Payment: $[amount]
Payoff Date: [date]
Total Interest Paid: $[amount]

---
STRATEGY: [Avalanche/Snowball/Hybrid]
RATIONALE: [why this works for your situation]
MONTHLY BREAKDOWN: [detailed payment schedule]`;

export const BUDGET_PLAN_TEMPLATE = `Format your monthly budget plan as follows:

MONTHLY INCOME: $[amount]

EXPENSES BY CATEGORY:
- Housing: $[amount] ([percent]%)
- Transportation: $[amount] ([percent]%)
- Food: $[amount] ([percent]%)
- Utilities: $[amount] ([percent]%)
- Insurance: $[amount] ([percent]%)
- Debt Payments: $[amount] ([percent]%)
- Savings: $[amount] ([percent]%)
- Discretionary: $[amount] ([percent]%)

TOTAL EXPENSES: $[amount]
SURPLUS/DEFICIT: $[amount]

RECOMMENDATIONS:
[List specific, actionable recommendations]`;

export const SAVINGS_PLAN_TEMPLATE = `Format your savings goal plan as follows:

GOAL: [name]
Target Amount: $[amount]
Current Amount: $[amount]
Amount Remaining: $[amount]
Target Date: [date]
Months Until Target: [number]

REQUIRED MONTHLY CONTRIBUTION: $[amount]

STRATEGY:
[Detailed strategy for reaching this goal]

MILESTONES:
[List key milestones and dates]`;

// Specialized Prompts for Different Features

export function createBudgetAnalysisPrompt(userData) {
  const { income, expenses, debts, bills } = userData;

  return `${SYSTEM_CONTEXT}

CURRENT FINANCIAL SNAPSHOT:
Monthly Income: $${income}
Total Monthly Expenses: $${expenses.total}
Total Debt: $${debts.total}
Monthly Debt Payments: $${debts.monthlyPayment}
Upcoming Bills: ${bills.count} bills totaling $${bills.total}

Expense Breakdown:
${expenses.byCategory.map((cat) => `- ${cat.name}: $${cat.amount}`).join("\n")}

Based on this information, provide:
1. An analysis of current spending patterns
2. Areas where spending can be optimized
3. Recommended budget allocations following the 50/30/20 rule (adjusted for debt)
4. Specific action items to improve financial health

${BUDGET_PLAN_TEMPLATE}`;
}

export function createDebtPayoffPrompt(userData, strategy = "optimal") {
  const { income, expenses, debts, savingsGoals } = userData;

  const availableForDebt = income - expenses.total;

  return `${SYSTEM_CONTEXT}

DEBT REPAYMENT SCENARIO:
Monthly Income: $${income}
Monthly Expenses: $${expenses.total}
Available for Debt: $${availableForDebt}

DEBTS:
${debts.list
  .map(
    (debt) => `
- ${debt.name}: $${debt.balance} at ${debt.interestRate}% APR
  Minimum Payment: $${debt.minimumPayment}
`
  )
  .join("\n")}

User Preference: ${
    strategy === "avalanche"
      ? "Minimize interest (Avalanche)"
      : strategy === "snowball"
      ? "Quick wins (Snowball)"
      : "Recommend optimal strategy"
  }

${
  savingsGoals.emergency
    ? `Emergency Fund Goal: $${savingsGoals.emergency.target} (Current: $${savingsGoals.emergency.current})`
    : "No emergency fund set"
}

Create a comprehensive debt payoff plan that:
1. Considers the available monthly surplus
2. Balances debt payoff with emergency fund building (if needed)
3. Applies the chosen strategy (or recommends the best one)
4. Provides month-by-month projections
5. Shows total interest saved

${DEBT_PLAN_TEMPLATE}

Also provide the data in JSON format for system processing:
{
  "strategy": "avalanche|snowball|hybrid",
  "totalMonthsToPayoff": number,
  "totalInterestPaid": number,
  "monthlyPlan": [
    {
      "month": number,
      "debts": [
        {"name": "string", "payment": number, "remainingBalance": number}
      ],
      "totalPayment": number
    }
  ]
}`;
}

export function createSavingsGoalPrompt(userData, goalType) {
  const { income, expenses, debts } = userData;
  const availableFunds = income - expenses.total - debts.monthlyPayment;

  return `${SYSTEM_CONTEXT}

SAVINGS GOAL PLANNING:
Monthly Surplus: $${availableFunds}
Goal Type: ${goalType}

Create a realistic savings plan that:
1. Accounts for current financial obligations
2. Provides a sustainable monthly contribution
3. Includes milestone targets
4. Offers strategies to accelerate savings if possible

${SAVINGS_PLAN_TEMPLATE}`;
}

export function createConversationalPrompt(
  userMessage,
  conversationHistory,
  userData
) {
  return `${SYSTEM_CONTEXT}

${FINANCIAL_PERSONA}

USER'S FINANCIAL CONTEXT:
${
  userData
    ? `
Monthly Income: $${userData.income}
Monthly Expenses: $${userData.expenses?.total || 0}
Total Debt: $${userData.debts?.total || 0}
Savings: $${userData.savings?.total || 0}
`
    : "No financial data available yet"
}

${
  conversationHistory.length > 0
    ? `
CONVERSATION HISTORY:
${(Array.isArray(conversationHistory) ? conversationHistory : [])
  .slice(-5)
  .map((conv) => `User: ${conv.message}\nAssistant: ${conv.response}`)
  .join("\n\n")}
`
    : ""
}

USER MESSAGE: ${userMessage}

Respond naturally and helpfully. If the user is asking for a specific analysis or plan, provide it with detailed, actionable advice.
If you need more information, ask clarifying questions.`;
}

// Utility function to extract JSON from Claude response
export function extractJSON(response) {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
      return null;
    }
  }
  return null;
}

// Generate structured prompts based on action type
export function generatePrompt(action, data) {
  switch (action) {
    case "ANALYZE_BUDGET":
      return createBudgetAnalysisPrompt(data);
    case "CREATE_DEBT_PLAN":
      return createDebtPayoffPrompt(data, data.strategy);
    case "CREATE_SAVINGS_PLAN":
      return createSavingsGoalPrompt(data, data.goalType);
    case "CONVERSATION":
      return createConversationalPrompt(
        data.message,
        data.history || [],
        data.userData
      );
    case "FLIPPED_INTERACTION":
      return createFlippedInteractionPrompt(data.goal, data.informationNeeded);
    case "RECIPE":
      return createRecipePrompt(data.goal, data.knownSteps);
    default:
      return data.message;
  }
}
