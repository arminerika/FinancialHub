import express from "express";
import conversationManager from "./conversationManager.js";
import commandInterpreter from "./commandInterpreter.js";
import actionExecutor from "./actionExecutor.js";

const router = express.Router();

/**
 * Agent Routes - API endpoints for AI Agent functionality
 * These endpoints handle natural language input and execute actions
 */

/**
 * POST /api/agent/message
 * Main agent endpoint - processes natural language and executes actions
 */
router.post("/message", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: "userId and message are required",
      });
    }

    // Process the message through the agent pipeline
    const response = await conversationManager.processMessage(userId, message);

    res.json(response);
  } catch (error) {
    console.error("Error in agent message endpoint:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent/conversation/:userId
 * Get conversation history for a user
 */
router.get("/conversation/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const history = conversationManager.getConversationHistory(userId);

    res.json({
      success: true,
      messages: history,
      count: history.length,
    });
  } catch (error) {
    console.error("Error getting conversation history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/agent/conversation/:userId
 * Clear conversation history for a user
 */
router.delete("/conversation/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = conversationManager.clearConversation(userId);

    res.json(result);
  } catch (error) {
    console.error("Error clearing conversation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent/parse
 * Parse natural language without executing (for debugging/testing)
 */
router.post("/parse", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message is required",
      });
    }

    const commands = await commandInterpreter.parseCommands(message, context);

    res.json({
      success: true,
      commands,
      count: commands.length,
    });
  } catch (error) {
    console.error("Error parsing message:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent/execute
 * Execute a specific command (for testing)
 */
router.post("/execute", async (req, res) => {
  try {
    const { userId, command } = req.body;

    if (!userId || !command) {
      return res.status(400).json({
        success: false,
        error: "userId and command are required",
      });
    }

    const result = await actionExecutor.executeCommand(command, userId);

    res.json(result);
  } catch (error) {
    console.error("Error executing command:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent/snapshot/:userId
 * Get complete financial snapshot for a user
 */
router.get("/snapshot/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await actionExecutor.getFinancialSnapshot(userId);

    res.json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error("Error getting financial snapshot:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent/suggestions/:userId
 * Get suggested next actions for a user
 */
router.get("/suggestions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const suggestions = await conversationManager.suggestNextActions(userId);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent/welcome/:userId
 * Check if user is new and get welcome message
 */
router.post("/welcome/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const welcome = await conversationManager.guideNewUser(userId);

    res.json({
      success: true,
      ...welcome,
    });
  } catch (error) {
    console.error("Error getting welcome message:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
