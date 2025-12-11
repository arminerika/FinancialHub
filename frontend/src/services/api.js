import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://financialhub-production.up.railway.app/api" // Production
    : "http://localhost:3001/api", // Development
  headers: {
    "Content-Type": "application/json",
  },
});

// User
export const createUser = async (userData) => {
  const response = await api.post("/user", userData);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

// Income
export const addIncome = async (incomeData) => {
  const response = await api.post("/income", incomeData);
  return response.data;
};

export const getIncome = async (userId) => {
  const response = await api.get(`/income/${userId}`);
  return response.data;
};

export const updateIncome = async (id, data) => {
  const response = await api.put(`/income/${id}`, data);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};

// Expenses
export const addExpense = async (expenseData) => {
  const response = await api.post("/expenses", expenseData);
  return response.data;
};

export const getExpenses = async (userId) => {
  const response = await api.get(`/expenses/${userId}`);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Debts
export const addDebt = async (debtData) => {
  const response = await api.post("/debts", debtData);
  return response.data;
};

export const getDebts = async (userId) => {
  const response = await api.get(`/debts/${userId}`);
  return response.data;
};

export const updateDebt = async (id, data) => {
  const response = await api.put(`/debts/${id}`, data);
  return response.data;
};

export const deleteDebt = async (id) => {
  const response = await api.delete(`/debts/${id}`);
  return response.data;
};

// Savings Goals
export const addSavingsGoal = async (goalData) => {
  const response = await api.post("/savings", goalData);
  return response.data;
};

export const getSavingsGoals = async (userId) => {
  const response = await api.get(`/savings/${userId}`);
  return response.data;
};

export const updateSavingsGoal = async (id, data) => {
  const response = await api.put(`/savings/${id}`, data);
  return response.data;
};

export const deleteSavingsGoal = async (id) => {
  const response = await api.delete(`/savings/${id}`);
  return response.data;
};

// Bills
export const addBill = async (billData) => {
  const response = await api.post("/bills", billData);
  return response.data;
};

export const getBills = async (userId) => {
  const response = await api.get(`/bills/${userId}`);
  return response.data;
};

export const updateBill = async (id, data) => {
  const response = await api.put(`/bills/${id}`, data);
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await api.delete(`/bills/${id}`);
  return response.data;
};

// Financial Snapshot
export const getFinancialSnapshot = async (userId) => {
  const response = await api.get(`/financial-snapshot/${userId}`);
  return response.data;
};

// AI Analysis Endpoints
export const analyzeBudget = async (userId) => {
  const response = await api.post("/analyze-budget", { userId });
  return response.data;
};

export const createDebtPayoffPlan = async (userId, strategy) => {
  const response = await api.post("/debt-payoff-plan", { userId, strategy });
  return response.data;
};

export const compareDebtStrategies = async (userId) => {
  const response = await api.post("/compare-debt-strategies", { userId });
  return response.data;
};

export const chatWithAI = async (userId, message) => {
  const response = await api.post("/chat", { userId, message });
  return response.data;
};

// AI Agent Endpoints
export const sendAgentMessage = async (userId, message) => {
  const response = await api.post("/agent/message", { userId, message });
  return response.data;
};

export const getConversation = async (userId) => {
  const response = await api.get(`/agent/conversation/${userId}`);
  return response.data;
};

export const getAgentSnapshot = async (userId) => {
  const response = await api.get(`/agent/snapshot/${userId}`);
  return response.data;
};

export const getSuggestions = async (userId) => {
  const response = await api.get(`/agent/suggestions/${userId}`);
  return response.data;
};

export const getWelcomeMessage = async (userId) => {
  const response = await api.post(`/agent/welcome/${userId}`);
  return response.data;
};

export default api;
