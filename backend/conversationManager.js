import commandInterpreter from './commandInterpreter.js';
import actionExecutor from './actionExecutor.js';
import aiService from './aiService.js';
import db from './database.js';

/**
 * Conversation Manager - Manages conversational flow and context
 * Handles multi-turn conversations and guides users through data collection
 */

class ConversationManager {
  constructor() {
    // Store active conversations in memory
    // In production, this would be in Redis or database
    this.conversations = new Map();
  }

  /**
   * Process a user message through the full agent pipeline
   */
  async processMessage(userId, userMessage) {
    try {
      // Get or create conversation context
      const context = this.getConversationContext(userId);
      
      // Update conversation history
      context.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Step 1: Parse the message into commands
      const commands = await commandInterpreter.parseCommands(userMessage, context);
      
      // Step 2: Execute the commands
      const executionResults = await actionExecutor.executeCommands(commands, userId);
      
      // Step 3: Determine if we need an AI response
      const needsAIResponse = executionResults.some(r => r.needsAIResponse) || 
                             commands.some(c => c.action === 'CONVERSATION');
      
      // Step 4: Generate AI response if needed
      let aiResponse = null;
      if (needsAIResponse) {
        // Get updated financial snapshot after actions
        const financialData = await actionExecutor.getFinancialSnapshot(userId);
        
        // Generate contextual AI response
        aiResponse = await this.generateContextualResponse(
          userId,
          userMessage,
          executionResults,
          financialData,
          context
        );
      }

      // Step 5: Build response with action confirmations and AI message
      const response = this.buildResponse(executionResults, aiResponse);
      
      // Update conversation context
      context.messages.push({
        role: 'assistant',
        content: response.message,
        actions: executionResults,
        timestamp: new Date().toISOString()
      });
      
      context.lastActivity = new Date().toISOString();
      this.conversations.set(userId, context);

      return response;

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: error.message,
        message: "I'm sorry, I encountered an error processing your request. Could you try rephrasing that?"
      };
    }
  }

  /**
   * Generate contextual AI response based on actions and financial data
   */
  async generateContextualResponse(userId, userMessage, executionResults, financialData, context) {
    // Build context for AI
    const systemContext = {
      recentActions: executionResults.map(r => ({
        action: r.action,
        success: r.success,
        message: r.message
      })),
      financialSummary: this.buildFinancialSummary(financialData),
      conversationHistory: context.messages.slice(-5) // Last 5 messages
    };

    // Use AI service to generate response
    const aiResponse = await aiService.chat(userId, userMessage, systemContext);
    
    return aiResponse;
  }

  /**
   * Build financial summary for AI context
   */
  buildFinancialSummary(data) {
    const totalIncome = data.income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebt = data.debts.reduce((sum, d) => sum + d.balance, 0);
    const totalSavings = data.savings.reduce((sum, s) => sum + s.current_amount, 0);

    return {
      incomeCount: data.income.length,
      totalIncome,
      expenseCount: data.expenses.length,
      totalExpenses,
      debtCount: data.debts.length,
      totalDebt,
      savingsGoalCount: data.savings.length,
      totalSavings,
      netCashFlow: totalIncome - totalExpenses
    };
  }

  /**
   * Build response object with action results and AI message
   */
  buildResponse(executionResults, aiResponse) {
    const successful = executionResults.filter(r => r.success);
    const failed = executionResults.filter(r => !r.success);

    // Collect all action messages
    const actionMessages = successful.map(r => r.message).filter(m => m);

    // Build complete message
    let message = '';
    
    if (actionMessages.length > 0) {
      message = actionMessages.join('\n') + '\n\n';
    }

    if (aiResponse) {
      message += aiResponse;
    } else if (actionMessages.length === 0 && failed.length === 0) {
      message = "I understand. How else can I help you?";
    }

    return {
      success: true,
      message: message.trim(),
      actions: executionResults,
      actionCount: successful.length,
      errors: failed.length > 0 ? failed.map(f => f.error) : null
    };
  }

  /**
   * Get or create conversation context for a user
   */
  getConversationContext(userId) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        userId,
        messages: [],
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        stage: 'initial' // initial, collecting, analyzing, planning
      });
    }

    return this.conversations.get(userId);
  }

  /**
   * Clear conversation context for a user
   */
  clearConversation(userId) {
    this.conversations.delete(userId);
    return { success: true, message: 'Conversation cleared' };
  }

  /**
   * Get conversation history for a user
   */
  getConversationHistory(userId) {
    const context = this.conversations.get(userId);
    return context ? context.messages : [];
  }

  /**
   * Save conversation to database (for persistence)
   */
  async saveConversation(userId) {
    const context = this.conversations.get(userId);
    if (!context) return;

    try {
      const stmt = db.prepare(`
        INSERT INTO conversations (user_id, messages, created_at)
        VALUES (?, ?, ?)
      `);

      stmt.run(
        userId,
        JSON.stringify(context.messages),
        context.startedAt
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guide user through initial setup if they're new
   */
  async guideNewUser(userId) {
    const financialData = await actionExecutor.getFinancialSnapshot(userId);
    const hasData = financialData.income.length > 0 || 
                   financialData.expenses.length > 0 ||
                   financialData.debts.length > 0;

    if (!hasData) {
      return {
        isNewUser: true,
        message: `👋 Welcome! I'm your AI financial assistant. I can help you manage your budget, track expenses, plan for debt payoff, and reach your savings goals.

To get started, just tell me about your financial situation in your own words. For example:
• "I make $5000 per month from my job"
• "My rent is $1500 and I spend about $400 on groceries"
• "I have a credit card with $8000 balance at 18% interest"

What would you like to start with?`
      };
    }

    return { isNewUser: false };
  }

  /**
   * Suggest next actions based on current financial state
   */
  async suggestNextActions(userId) {
    const financialData = await actionExecutor.getFinancialSnapshot(userId);
    const suggestions = [];

    if (financialData.income.length === 0) {
      suggestions.push("Add your income sources");
    }
    
    if (financialData.expenses.length === 0) {
      suggestions.push("Track your expenses");
    }
    
    if (financialData.debts.length > 0) {
      suggestions.push("Generate a debt payoff plan");
    }
    
    if (financialData.savings.length === 0) {
      suggestions.push("Set savings goals");
    }

    if (financialData.income.length > 0 && financialData.expenses.length > 0) {
      suggestions.push("Analyze your budget");
    }

    return suggestions;
  }
}

export default new ConversationManager();
