import Anthropic from '@anthropic-ai/sdk';
import { generatePrompt, SYSTEM_CONTEXT, extractJSON } from './promptPatterns.js';

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = 'claude-sonnet-4-20250514';
  }

  /**
   * Main method to get AI response
   * @param {string} action - Type of action (ANALYZE_BUDGET, CREATE_DEBT_PLAN, etc.)
   * @param {object} data - Data needed for the prompt
   * @param {boolean} structured - Whether to return structured JSON data
   */
  async getResponse(action, data, structured = false) {
    try {
      const prompt = generatePrompt(action, data);
      
      console.log('🤖 Sending request to Claude...');
      console.log('Action:', action);
      
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: SYSTEM_CONTEXT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0].text;
      
      console.log('✅ Received response from Claude');

      if (structured) {
        const jsonData = extractJSON(response);
        return {
          text: response,
          data: jsonData
        };
      }

      return {
        text: response,
        data: null
      };
    } catch (error) {
      console.error('❌ Error calling Claude API:', error);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  /**
   * Analyze user's budget and spending
   */
  async analyzeBudget(userData) {
    return await this.getResponse('ANALYZE_BUDGET', userData);
  }

  /**
   * Create debt payoff plan
   */
  async createDebtPayoffPlan(userData, strategy = 'optimal') {
    return await this.getResponse('CREATE_DEBT_PLAN', { ...userData, strategy }, true);
  }

  /**
   * Create savings goal plan
   */
  async createSavingsGoalPlan(userData, goalType, goalDetails) {
    return await this.getResponse('CREATE_SAVINGS_PLAN', { 
      ...userData, 
      goalType,
      goalDetails 
    });
  }

  /**
   * Handle conversational interactions
   */
  async chat(userMessage, conversationHistory = [], userData = null) {
    return await this.getResponse('CONVERSATION', {
      message: userMessage,
      history: conversationHistory,
      userData
    });
  }

  /**
   * Flipped interaction - AI asks questions to gather info
   */
  async startFlippedInteraction(goal, informationNeeded) {
    return await this.getResponse('FLIPPED_INTERACTION', {
      goal,
      informationNeeded
    });
  }

  /**
   * Generate complete financial snapshot
   */
  async generateFinancialSnapshot(userData) {
    const prompt = `${SYSTEM_CONTEXT}

Generate a comprehensive financial snapshot for this user:

INCOME:
Total Monthly: $${userData.income.total}
${userData.income.sources.map(s => `- ${s.source}: $${s.amount}`).join('\n')}

EXPENSES:
Total Monthly: $${userData.expenses.total}
${userData.expenses.byCategory.map(e => `- ${e.category}: $${e.amount}`).join('\n')}

DEBTS:
Total Balance: $${userData.debts.total}
${userData.debts.list.map(d => `- ${d.name}: $${d.balance} at ${d.interestRate}%`).join('\n')}

SAVINGS GOALS:
${userData.savingsGoals.map(g => `- ${g.name}: $${g.current}/$${g.target}`).join('\n')}

BILLS (Next 30 days):
${userData.bills.map(b => `- ${b.name}: $${b.amount} due on day ${b.dueDate}`).join('\n')}

Provide:
1. Overall Financial Health Score (1-10)
2. Key Insights (3-5 bullet points)
3. Top 3 Priorities
4. Monthly Cash Flow Analysis
5. 3-Month Action Plan

Format the response clearly with sections and actionable items.`;

    return await this.getResponse('CONVERSATION', { message: prompt });
  }

  /**
   * Smart bill reminder analysis
   */
  async analyzeBillPayments(bills, monthlyIncome, monthlyExpenses) {
    const prompt = `Analyze these upcoming bills and provide recommendations:

Monthly Income: $${monthlyIncome}
Monthly Expenses: $${monthlyExpenses}
Available: $${monthlyIncome - monthlyExpenses}

Upcoming Bills:
${bills.map(b => `- ${b.name}: $${b.amount} due on day ${b.dueDate} (${b.frequency})`).join('\n')}

Provide:
1. Optimal payment schedule to avoid overdraft
2. Bills that should be prioritized
3. Suggestions for reducing bill amounts
4. Recommended buffer amount to maintain`;

    return await this.getResponse('CONVERSATION', { message: prompt });
  }

  /**
   * Compare debt payoff strategies
   */
  async compareDebtStrategies(userData) {
    const prompt = `Compare debt payoff strategies for this scenario:

Monthly Surplus: $${userData.income - userData.expenses.total}

Debts:
${userData.debts.list.map(d => `
- ${d.name}
  Balance: $${d.balance}
  Interest Rate: ${d.interestRate}%
  Minimum Payment: $${d.minimumPayment}
`).join('\n')}

Provide a detailed comparison of:
1. AVALANCHE METHOD (highest interest first)
2. SNOWBALL METHOD (lowest balance first)
3. HYBRID APPROACH

For each method, show:
- Total time to debt freedom
- Total interest paid
- Psychological pros and cons
- Recommended approach based on this specific situation

Format with clear tables and a final recommendation.`;

    return await this.getResponse('CONVERSATION', { message: prompt }, true);
  }
}

export default new AIService();
