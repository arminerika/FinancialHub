import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Command Interpreter - Parses natural language into structured actions
 * This is the core of making this a TRUE AI Agent
 */

class CommandInterpreter {
  /**
   * Parse user input into executable commands
   * Returns array of structured commands that can be executed
   */
  async parseCommands(userInput, conversationContext = {}) {
    const systemPrompt = `You are a financial command interpreter for an AI agent system. Your job is to parse natural language into structured JSON commands that can be executed.

AVAILABLE ACTIONS:
1. CREATE_INCOME - Add income source
2. CREATE_EXPENSE - Add expense
3. CREATE_DEBT - Add debt
4. CREATE_SAVINGS_GOAL - Add savings goal
5. CREATE_BILL - Add recurring bill
   REQUIRED: name (string - bill name like "Electric Bill" or "Cell Phone")
   REQUIRED: amount (number)
   Example: "cell phone bill $40" should create: 
   {"action": "CREATE_BILL", "data": {"name": "Cell Phone Bill", "amount": 40, "dueDate": 1, "frequency": "monthly"}}
6. GENERATE_BUDGET_ANALYSIS - Analyze current budget
7. GENERATE_DEBT_PLAN - Create debt payoff plan
8. GENERATE_SAVINGS_PLAN - Create savings strategy
9. ASK_QUESTION - Need more information from user
10. CONVERSATION - General conversation/greeting

PARSING RULES:
- Extract ALL actionable items from the input
- If user mentions multiple items, create multiple commands
- Always include confidence score (0-1)
- If unclear, use ASK_QUESTION action
- Recognize variations: "I make", "income is", "salary of", etc.
- For expenses, infer category from context
- For debts, extract balance, interest rate, minimum payment if mentioned

CATEGORIES:
Expenses: Housing, Transportation, Food, Utilities, Insurance, Healthcare, Entertainment, Shopping, Personal, Debt Payments, Other
Income: Salary, Freelance, Business, Investments, Other

OUTPUT FORMAT (strict JSON array):
[
  {
    "action": "CREATE_INCOME",
    "confidence": 0.95,
    "data": {
      "source": "Employment",
      "amount": 5000,
      "frequency": "monthly"
    }
  },
  {
    "action": "CREATE_EXPENSE",
    "confidence": 0.9,
    "data": {
      "description": "Rent",
      "amount": 1500,
      "category": "Housing",
      "recurring": true
    }
  }
]

Current conversation context: ${JSON.stringify(conversationContext)}

User input: "${userInput}"

Parse this input and return ONLY the JSON array of commands. No other text.`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: systemPrompt,
          },
        ],
      });

      const responseText = message.content[0].text.trim();

      // Remove markdown code blocks if present
      let jsonText = responseText;
      if (responseText.includes("```json")) {
        jsonText = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
      } else if (responseText.includes("```")) {
        jsonText = responseText.replace(/```\n?/g, "").trim();
      }

      const commands = JSON.parse(jsonText);

      // Validate commands structure
      if (!Array.isArray(commands)) {
        throw new Error("Commands must be an array");
      }

      // Ensure all commands have required fields
      const validatedCommands = commands.map((cmd) => ({
        action: cmd.action || "CONVERSATION",
        confidence: cmd.confidence || 0.5,
        data: cmd.data || {},
        originalInput: userInput,
      }));

      return validatedCommands;
    } catch (error) {
      console.error("Error parsing commands:", error);

      // Fallback: treat as conversation
      return [
        {
          action: "CONVERSATION",
          confidence: 1.0,
          data: { message: userInput },
          originalInput: userInput,
        },
      ];
    }
  }

  /**
   * Determine if input is a question that needs AI response
   */
  isQuestion(userInput) {
    const questionWords = [
      "what",
      "how",
      "why",
      "when",
      "where",
      "who",
      "can",
      "should",
      "would",
    ];
    const lowercaseInput = userInput.toLowerCase();

    return (
      questionWords.some((word) => lowercaseInput.startsWith(word)) ||
      lowercaseInput.includes("?")
    );
  }

  /**
   * Extract numeric values from text
   */
  extractAmount(text) {
    // Match patterns like: $5000, 5000, 5k, $5k, five thousand
    const patterns = [
      /\$?([\d,]+\.?\d*)/, // $5000 or 5000
      /\$?([\d]+)k/i, // 5k or $5k
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = match[1].replace(/,/g, "");
        if (text.toLowerCase().includes("k")) {
          amount = parseFloat(amount) * 1000;
        }
        return parseFloat(amount);
      }
    }

    return null;
  }

  /**
   * Validate a command before execution
   */
  validateCommand(command) {
    const requiredFields = {
      CREATE_INCOME: ["source", "amount", "frequency"],
      CREATE_EXPENSE: ["description", "amount", "category"],
      CREATE_DEBT: ["name", "balance"],
      CREATE_SAVINGS_GOAL: ["name", "targetAmount"],
      CREATE_BILL: ["name", "amount"],
    };

    const required = requiredFields[command.action];
    if (!required) return true; // No validation needed for this action

    const missingFields = required.filter((field) => !command.data[field]);

    if (missingFields.length > 0) {
      return {
        valid: false,
        missingFields,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    return { valid: true };
  }
}

export default new CommandInterpreter();
