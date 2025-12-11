import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database.js";
import routes from "./routes.js";
import agentRoutes from "./agentRoutes.js";

// Load environment variables
dotenv.config();

// Initialize database
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", routes);
app.use("/api/agent", agentRoutes); // AI Agent routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("");
  console.log("💰 ====================================");
  console.log("💰  Financial Hub AI Agent Backend");
  console.log("💰 ====================================");
  console.log("");
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ API endpoint: http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("📊 Available endpoints:");
  console.log("   --- AI AGENT ENDPOINTS (NEW!) ---");
  console.log("   POST /api/agent/message - Send message to AI agent");
  console.log(
    "   GET  /api/agent/conversation/:userId - Get conversation history"
  );
  console.log("   GET  /api/agent/snapshot/:userId - Get financial snapshot");
  console.log(
    "   GET  /api/agent/suggestions/:userId - Get action suggestions"
  );
  console.log("   POST /api/agent/welcome/:userId - Get welcome message");
  console.log("");
  console.log("   --- MANUAL DATA ENTRY ENDPOINTS ---");
  console.log("   POST /api/user - Create/get user");
  console.log("   POST /api/income - Add income");
  console.log("   POST /api/expenses - Add expense");
  console.log("   POST /api/debts - Add debt");
  console.log("   POST /api/savings - Add savings goal");
  console.log("   POST /api/bills - Add bill");
  console.log("   GET  /api/financial-snapshot/:userId - Get snapshot");
  console.log("   POST /api/analyze-budget - Analyze budget");
  console.log("   POST /api/debt-payoff-plan - Create debt plan");
  console.log("   POST /api/chat - Chat with AI");
  console.log("   POST /api/compare-debt-strategies - Compare strategies");
  console.log("");
  console.log("🚀 Ready to accept requests!");
  console.log("");
});

export default app;
