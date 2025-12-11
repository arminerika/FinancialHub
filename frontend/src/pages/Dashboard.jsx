import { useState, useEffect } from "react";
import {
  getIncome,
  getExpenses,
  getDebts,
  getSavingsGoals,
  getBills,
  getFinancialSnapshot,
} from "../services/api";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  AlertCircle,
} from "lucide-react";

const Dashboard = ({ userId }) => {
  const [data, setData] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [income, expenses, debts, savings, bills] = await Promise.all([
        getIncome(userId),
        getExpenses(userId),
        getDebts(userId),
        getSavingsGoals(userId),
        getBills(userId),
      ]);

      setData({
        income: income.totalMonthly || 0,
        expenses: expenses.total || 0,
        expensesByCategory: expenses.byCategory || [],
        debts: debts.total || 0,
        debtsMonthly: debts.monthlyPayment || 0,
        debtsList: debts.debts || [],
        savings: savings.total || 0,
        savingsGoals: savings.goals || [],
        bills: bills.bills || [],
        billsTotal: bills.total || 0,
      });

      // Don't auto-load AI snapshot - let user request it
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIAnalysis = async () => {
    if (loadingSnapshot) return;

    setLoadingSnapshot(true);
    try {
      const snapshotData = await getFinancialSnapshot(userId);
      setSnapshot(snapshotData);
    } catch (error) {
      console.error("Error loading AI analysis:", error);
      alert("Failed to load AI analysis. Please try again.");
    } finally {
      setLoadingSnapshot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          Loading your financial overview...
        </div>
      </div>
    );
  }

  if (!data || data.income === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Financial Hub!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Let's start by adding your income and expenses to get personalized
          insights.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/income" className="btn-primary">
            Add Income
          </a>
          <a href="/expenses" className="btn-secondary">
            Add Expenses
          </a>
        </div>
      </div>
    );
  }

  const monthlyNet = parseFloat(data.income) - parseFloat(data.expenses);
  const debtToIncome = (
    (parseFloat(data.debtsMonthly) / parseFloat(data.income)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Financial Overview
        </h1>
        <div className="text-sm text-gray-500">User ID: {userId}</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly Income
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(data.income).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(data.expenses).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Debt
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(data.debts).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">DTI: {debtToIncome}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Savings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(data.savings).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Cash Flow
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 dark:text-gray-400">
            Net Cash Flow:
          </span>
          <span
            className={`text-2xl font-bold ${
              monthlyNet >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${monthlyNet.toFixed(2)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              monthlyNet >= 0 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(
                Math.abs((monthlyNet / data.income) * 100),
                100
              )}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {monthlyNet >= 0
            ? `You have $${monthlyNet.toFixed(
                2
              )} left after expenses each month.`
            : `You are spending $${Math.abs(monthlyNet).toFixed(
                2
              )} more than you earn each month.`}
        </p>
      </div>

      {/* Expenses by Category */}
      {data.expensesByCategory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {data.expensesByCategory.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{category.name}</span>
                  <span className="font-medium">
                    ${parseFloat(category.amount).toFixed(2)} (
                    {category.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bills */}
      {data.bills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900  dark:text-white mb-4">
            Upcoming Bills
          </h3>
          <div className="space-y-2">
            {data.bills.slice(0, 5).map((bill) => (
              <div
                key={bill.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {bill.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due: Day {bill.due_date} of month
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${parseFloat(bill.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Button & Insights */}
      {!snapshot && data.income > 0 && (
        <div className="card border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Get AI-Powered Financial Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Let AI analyze your finances and provide personalized
              recommendations
            </p>
            <button
              onClick={loadAIAnalysis}
              disabled={loadingSnapshot}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loadingSnapshot ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🤖</span>
                  Generate AI Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {snapshot && snapshot.analysis && (
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-primary-200 dark:border-gray-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🤖</span> AI Financial Insights
            </h3>
            <button
              onClick={loadAIAnalysis}
              disabled={loadingSnapshot}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {loadingSnapshot ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
            {snapshot.analysis.split("\n").map((line, i) => {
              if (line.startsWith("##")) {
                return (
                  <h2
                    key={i}
                    className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white"
                  >
                    {line.replace("##", "").trim()}
                  </h2>
                );
              } else if (line.startsWith("###")) {
                return (
                  <h3
                    key={i}
                    className="text-lg font-semibold mt-3 mb-2 text-gray-900 dark:text-white"
                  >
                    {line.replace("###", "").trim()}
                  </h3>
                );
              } else if (line.startsWith("-") || line.startsWith("*")) {
                return (
                  <li key={i} className="ml-4">
                    {line.substring(1).trim()}
                  </li>
                );
              } else if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="font-bold mt-2">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              } else if (line.trim()) {
                return (
                  <p key={i} className="mt-2">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
