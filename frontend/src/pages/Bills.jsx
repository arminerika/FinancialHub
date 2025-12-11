import { useState, useEffect } from "react";
import { addBill, getBills, deleteBill, updateBill } from "../services/api";
import { Plus, Receipt, AlertCircle, Edit2, Trash2 } from "lucide-react";

const Bills = ({ userId }) => {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "1",
    frequency: "monthly",
    category: "Utilities",
    autoPay: false,
  });

  const categories = [
    "Utilities",
    "Insurance",
    "Subscription",
    "Rent/Mortgage",
    "Loan Payment",
    "Other",
  ];

  useEffect(() => {
    loadBills();
  }, [userId]);

  const loadBills = async () => {
    try {
      const data = await getBills(userId);
      setBills(data.bills || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error loading bills:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const billData = {
        userId,
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: parseInt(formData.dueDate),
        frequency: formData.frequency,
        category: formData.category,
        autoPay: formData.autoPay,
      };

      if (editingId) {
        await updateBill(editingId, billData);
      } else {
        await addBill(billData);
      }

      setFormData({
        name: "",
        amount: "",
        dueDate: "1",
        frequency: "monthly",
        category: "Utilities",
        autoPay: false,
      });
      setEditingId(null);
      setShowForm(false);
      await loadBills();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill");
    }
  };

  const handleEdit = (bill) => {
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.due_date.toString(),
      frequency: bill.frequency,
      category: bill.category,
      autoPay: bill.auto_pay === 1,
    });
    setEditingId(bill.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: "",
      amount: "",
      dueDate: "1",
      frequency: "monthly",
      category: "Utilities",
      autoPay: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    try {
      await deleteBill(id);
      await loadBills();
    } catch (error) {
      alert("Failed to delete bill");
    }
  };

  const isOverdue = (dueDate) => {
    const today = new Date().getDate();
    return today > dueDate;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bills & Reminders
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Monthly Bills
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          ${parseFloat(total).toFixed(2)}
        </p>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? "Edit Bill" : "Add New Bill"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bill Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Electric, Internet, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date (Day of Month)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1-31"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoPay"
                checked={formData.autoPay}
                onChange={(e) =>
                  setFormData({ ...formData, autoPay: e.target.checked })
                }
                className="w-4 h-4 text-primary-600"
              />
              <label
                htmlFor="autoPay"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Auto-pay enabled
              </label>
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
                {editingId ? "Update Bill" : "Add Bill"}
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Upcoming Bills
        </h3>
        {bills.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No bills tracked yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add bills to get payment reminders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills
              .sort((a, b) => a.due_date - b.due_date)
              .map((bill) => {
                const overdue = isOverdue(bill.due_date);

                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      overdue
                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {bill.name}
                          </p>
                          {bill.auto_pay === 1 && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              Auto-pay
                            </span>
                          )}
                          {overdue && (
                            <span className="flex items-center text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${parseFloat(bill.amount).toFixed(2)} • Due on day{" "}
                          {bill.due_date} • {bill.frequency} • {bill.category}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
