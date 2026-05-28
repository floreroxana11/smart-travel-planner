import { useMemo, useState } from "react";
import { formatDate, badgeClass } from "../utils/helpers";
import "./DetailPage.css";

export default function DetailPage({
  trip,
  onBack,
  onEdit,
  onBazinga,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
}) {
  const budget = Number(trip.budget || 0);
  const spent = Number(trip.spent || 0);
  const remaining = budget - spent;

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingAmount, setEditingAmount] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  const expenses = trip.expenses || [];

  const expenseStats = useMemo(() => {
    const totalExpenses = expenses.length;

    const totalExpenseAmount = expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount || 0);
    }, 0);

    const averageExpenseAmount =
      totalExpenses > 0
        ? (totalExpenseAmount / totalExpenses).toFixed(2)
        : "0.00";

    return {
      totalExpenses,
      totalExpenseAmount,
      averageExpenseAmount,
    };
  }, [expenses]);

  function handleAddExpense() {
    if (!expenseTitle.trim() || !expenseAmount.trim() || !expenseCategory.trim()) {
      return;
    }

    onAddExpense(trip.id, {
      title: expenseTitle,
      amount: expenseAmount,
      category: expenseCategory,
    });

    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseCategory("");
  }

  function startEditingExpense(expense) {
    setEditingExpenseId(expense.id);
    setEditingTitle(expense.title);
    setEditingAmount(expense.amount.toString());
    setEditingCategory(expense.category);
  }

  function cancelEditingExpense() {
    setEditingExpenseId(null);
    setEditingTitle("");
    setEditingAmount("");
    setEditingCategory("");
  }

  function handleSaveExpense(expenseId) {
    if (!editingTitle.trim() || !editingAmount.trim() || !editingCategory.trim()) {
      return;
    }

    onUpdateExpense(trip.id, expenseId, {
      title: editingTitle,
      amount: editingAmount,
      category: editingCategory,
    });

    cancelEditingExpense();
  }

  return (
    <div className="page">
      <div className="detail-page">
        <div className="detail-header">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            ← Back
          </button>
          <span className="detail-header-text">Trip Details</span>
        </div>

        <div className="detail-card">
          <div className="detail-title">{trip.tripName}</div>
          <div className="detail-dest">📍 {trip.destination}</div>

          <div className="detail-grid">
            <div className="detail-field">
              <label>Date Range</label>
              <p>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>

            <div className="detail-field">
              <label>Category</label>
              <p>
                <span className={badgeClass(trip.category)}>
                  {trip.category}
                </span>
              </p>
            </div>

            <div className="detail-field">
              <label>Budget</label>
              <p>${budget.toLocaleString()}</p>
            </div>

            <div className="detail-field">
              <label>Spent</label>
              <p>${spent.toLocaleString()}</p>
            </div>

            <div className="detail-field">
              <label>Remaining</label>
              <p style={{ color: remaining < 0 ? "#f87171" : "#34d399" }}>
                ${remaining.toLocaleString()}
              </p>
            </div>

            <div className="detail-field">
              <label>Duration</label>
              <p>
                {trip.startDate && trip.endDate
                  ? `${Math.ceil(
                      (new Date(trip.endDate) - new Date(trip.startDate)) /
                        (1000 * 60 * 60 * 24)
                    )} days`
                  : "—"}
              </p>
            </div>

            {trip.collaborators && (
              <div className="detail-field detail-field-full">
                <label>Collaborators</label>
                <p>{trip.collaborators}</p>
              </div>
            )}

            {trip.packingList && (
              <div className="detail-field detail-field-full">
                <label>Packing List</label>
                <p>{trip.packingList}</p>
              </div>
            )}
          </div>

          <div className="detail-divider" />

          <div className="detail-field detail-field-full">
            <label>Expense Statistics</label>
            <p>Total expenses: {expenseStats.totalExpenses}</p>
            <p>Total amount: ${expenseStats.totalExpenseAmount.toLocaleString()}</p>
            <p>Average amount: ${expenseStats.averageExpenseAmount}</p>
          </div>

          <div className="detail-divider" />

          <div className="detail-field detail-field-full">
            <label>Add Expense</label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Expense title"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="input"
              />

              <input
                type="number"
                placeholder="Amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="input"
              />

              <input
                type="text"
                placeholder="Category"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="input"
              />

              <button className="btn btn-primary" onClick={handleAddExpense}>
                Add
              </button>
            </div>
          </div>

          <div className="detail-divider" />

          <div className="detail-field detail-field-full">
            <label>Expenses</label>

            {expenses.length === 0 ? (
              <p>No expenses yet.</p>
            ) : (
              <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {editingExpenseId === expense.id ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr auto auto",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="input"
                        />

                        <input
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          className="input"
                        />

                        <input
                          type="text"
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          className="input"
                        />

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSaveExpense(expense.id)}
                        >
                          Save
                        </button>

                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={cancelEditingExpense}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <strong>{expense.title}</strong>
                          <div style={{ opacity: 0.8, marginTop: "4px" }}>
                            {expense.category} · ${Number(expense.amount).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => startEditingExpense(expense)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => onDeleteExpense(trip.id, expense.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-divider" />

          <div className="detail-actions">
            <button
              className="btn btn-ghost"
              onClick={() => onBazinga(trip)}
              title="Open Luggage Optimizer"
            >
              🧳 Luggage Optimizer
            </button>

            <button className="btn btn-primary" onClick={() => onEdit(trip)}>
              ✏️ Edit Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}