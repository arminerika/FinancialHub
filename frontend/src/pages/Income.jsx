import { useState, useEffect } from "react";
import { Plus, TrendingUp, Trash2, Edit2 } from "lucide-react";
import {
  addIncome,
  getIncome,
  deleteIncome,
  updateIncome,
} from "../services/api";

export default function Income({ userId }) {
  const [incomes, setIncomes] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    frequency: "monthly",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadIncome();
  }, [userId]);

  const loadIncome = async () => {
    try {
      const data = await getIncome(userId);
      setIncomes(data.incomes);
      setTotalMonthly(data.totalMonthly);
    } catch (error) {
      console.error("Error loading income:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // UPDATE existing income
        await updateIncome(editingId, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        // CREATE new income
        await addIncome({
          userId,
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }

      setFormData({ source: "", amount: "", frequency: "monthly" });
      setEditingId(null);
      await loadIncome();
    } catch (error) {
      alert("Failed to save income");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income) => {
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      frequency: income.frequency,
    });
    setEditingId(income.id);
  };

  const handleCancelEdit = () => {
    setFormData({ source: "", amount: "", frequency: "monthly" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income source?")) return;

    try {
      await deleteIncome(id);
      await loadIncome();
    } catch (error) {
      alert("Failed to delete income");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Income
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your income sources
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Monthly Income
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${parseFloat(totalMonthly).toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Salary, Freelance, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {editingId ? (
                <Edit2 className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {loading
                ? "Saving..."
                : editingId
                ? "Update Income"
                : "Add Income"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Income Sources
        </h2>

        {incomes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No income sources added yet
          </p>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {income.source}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${parseFloat(income.amount).toFixed(2)} - {income.frequency}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(income)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
