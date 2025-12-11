import { useState, useEffect } from "react";
import {
  addDebt,
  getDebts,
  deleteDebt,
  updateDebt,
  createDebtPayoffPlan,
  compareDebtStrategies,
} from "../services/api";
import { Plus, CreditCard, Zap, Edit2, Trash2 } from "lucide-react";

const Debts = ({ userId }) => {
  const [debts, setDebts] = useState([]);
  const [total, setTotal] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [payoffPlan, setPayoffPlan] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    interestRate: "",
    minimumPayment: "",
    type: "Credit Card",
  });

  const debtTypes = [
    "Credit Card",
    "Student Loan",
    "Personal Loan",
    "Auto Loan",
    "Medical",
    "Other",
  ];

  useEffect(() => {
    loadDebts();
  }, [userId]);

  const loadDebts = async () => {
    try {
      const data = await getDebts(userId);
      setDebts(data.debts || []);
      setTotal(data.total || 0);
      setMonthlyPayment(data.monthlyPayment || 0);
    } catch (error) {
      console.error("Error loading debts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const debtData = {
        userId,
        name: formData.name,
        balance: parseFloat(formData.balance),
        interestRate: parseFloat(formData.interestRate),
        minimumPayment: parseFloat(formData.minimumPayment),
        type: formData.type,
      };

      if (editingId) {
        await updateDebt(editingId, debtData);
      } else {
        await addDebt(debtData);
      }

      setFormData({
        name: "",
        balance: "",
        interestRate: "",
        minimumPayment: "",
        type: "Credit Card",
      });
      setEditingId(null);
      setShowForm(false);
      await loadDebts();
    } catch (error) {
      console.error("Error saving debt:", error);
      alert("Failed to save debt");
    }
  };

  const handleEdit = (debt) => {
    setFormData({
      name: debt.name,
      balance: debt.balance.toString(),
      interestRate: debt.interest_rate.toString(),
      minimumPayment: debt.minimum_payment.toString(),
      type: debt.type,
    });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: "",
      balance: "",
      interestRate: "",
      minimumPayment: "",
      type: "Credit Card",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this debt?")) return;

    try {
      await deleteDebt(id);
      await loadDebts();
    } catch (error) {
      alert("Failed to delete debt");
    }
  };

  const generatePayoffPlan = async (strategy) => {
    setLoading(true);
    try {
      const plan = await createDebtPayoffPlan(userId, strategy);
      setPayoffPlan(plan.plan);
    } catch (error) {
      alert("Failed to generate payoff plan");
    } finally {
      setLoading(false);
    }
  };

  const compareStrategies = async () => {
    setLoading(true);
    try {
      const result = await compareDebtStrategies(userId);
      setComparison(result.comparison);
    } catch (error) {
      alert("Failed to compare strategies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Debts
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Debt</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(total).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monthly Payments
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(monthlyPayment).toFixed(2)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? "Edit Debt" : "Add New Debt"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Credit Card, Student Loan, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData({ ...formData, interestRate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="18.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Payment
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.minimumPayment}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumPayment: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  {debtTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {editingId ? (
                  <Edit2 className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {editingId ? "Update Debt" : "Add Debt"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {debts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Debts
            </h3>
            <div className="flex gap-2">
              <button
                onClick={compareStrategies}
                disabled={loading}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Compare Strategies
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {debt.name}
                      </p>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {debt.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Balance: ${parseFloat(debt.balance).toFixed(2)} | APR:{" "}
                      {parseFloat(debt.interest_rate).toFixed(2)}% | Min
                      Payment: ${parseFloat(debt.minimum_payment).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(debt)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(debt.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No debts recorded yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Add your debts to create a payoff plan
          </p>
        </div>
      )}

      {comparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Strategy Comparison
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comparison}
            </p>
          </div>
        </div>
      )}

      {payoffPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Debt Payoff Plan
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {payoffPlan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
