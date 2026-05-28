import { useState, useEffect } from "react";
import {
  MAX_LUGGAGE_KG,
  ITEM_CATEGORIES,
  getTotalWeight,
  getWeightStatus,
  getOptimizationTips,
  DEMO_ITEMS_BY_TRIP,
  emptyItem,
  validateItem,
} from "../utils/bazinga";
import "./BazingaPage.css";

const LS_KEY = "bazinga_items";

function loadItems() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveItems(allItems) {
  localStorage.setItem(LS_KEY, JSON.stringify(allItems));
}

export default function BazingaPage({ trip, onBack }) {
  const tripId = String(trip.id);

  const [allItems, setAllItems] = useState(() => {
    const stored = loadItems();
    if (!stored[tripId] && DEMO_ITEMS_BY_TRIP[trip.id]) {
      stored[tripId] = DEMO_ITEMS_BY_TRIP[trip.id];
    }
    return stored;
  });

  const items = allItems[tripId] || [];

  const [form, setForm] = useState(emptyItem());
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    saveItems(allItems);
  }, [allItems]);

  const setAllForTrip = (newItems) => {
    setAllItems((prev) => {
      const updated = { ...prev, [tripId]: newItems };
      return updated;
    });
  };

  const handleAdd = () => {
    const errs = validateItem(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    if (editingId) {
      setAllForTrip(
        items.map((i) =>
          i.id === editingId ? { ...form, id: editingId } : i
        )
      );
      setEditingId(null);
    } else {
      const newItem = { ...form, id: `item_${Date.now()}` };
      setAllForTrip([...items, newItem]);
    }
    setForm(emptyItem());
    setFormErrors({});
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ ...item });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setAllForTrip(items.filter((i) => i.id !== id));
  };

  const handleCancel = () => {
    setForm(emptyItem());
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const status = getWeightStatus(items);
  const tips = getOptimizationTips(items, status.over);

  const inputClass = (k) =>
    `form-input${formErrors[k] ? " error" : ""}`;

  return (
    <div className="page bazinga-page">
      <div className="bazinga-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div className="bazinga-header-text">
          <div className="bazinga-title">🧳 Luggage Optimizer</div>
          <div className="bazinga-subtitle">
            {trip.tripName} — {trip.destination}
          </div>
        </div>
      </div>

      {/* Weight Summary */}
      <div className="bazinga-summary-grid">
        <div className="weight-card">
          <div className="weight-label">Packed Weight</div>
          <div className="weight-value">{status.total} kg</div>
        </div>
        <div className="weight-card">
          <div className="weight-label">Limit</div>
          <div className="weight-value">{status.limit} kg</div>
        </div>
        <div className={`weight-card${status.over ? " weight-over" : " weight-ok"}`}>
          <div className="weight-label">
            {status.over ? "⚠️ Over by" : "✅ Remaining"}
          </div>
          <div className="weight-value">{status.diff} kg</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bazinga-progress-wrap">
        <div className="bazinga-progress-track">
          <div
            className={`bazinga-progress-fill${status.over ? " over" : ""}`}
            style={{ width: `${status.percent}%` }}
          />
        </div>
        <div className="bazinga-progress-labels">
          <span>{status.percent}% of {MAX_LUGGAGE_KG} kg limit used</span>
          <span>{status.total} / {MAX_LUGGAGE_KG} kg</span>
        </div>
      </div>

      <div className="bazinga-columns">
        {/* Items list */}
        <div className="bazinga-items-section">
          <div className="bazinga-section-header">
            <div className="bazinga-section-title">Packed Items</div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm(emptyItem());
              }}
            >
              ➕ Add Item
            </button>
          </div>

          {showForm && (
            <div className="bazinga-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    className={inputClass("name")}
                    placeholder="e.g. Hiking Boots"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                  {formErrors.name && (
                    <span className="form-error">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className={
                      formErrors.category ? "form-select error" : "form-select"
                    }
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="">Select category</option>
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="form-error">{formErrors.category}</span>
                  )}
                </div>

                <div className="form-group form-full">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    className={inputClass("weight")}
                    placeholder="e.g. 1.2"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, weight: e.target.value }))
                    }
                  />
                  {formErrors.weight && (
                    <span className="form-error">{formErrors.weight}</span>
                  )}
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleAdd}>
                  {editingId ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && !showForm ? (
            <div className="bazinga-empty">
              <div>🎒</div>
              <p>No items added yet. Start packing!</p>
            </div>
          ) : (
            <div className="bazinga-item-list">
              {items.map((item) => (
                <div key={item.id} className="bazinga-item">
                  <div className="bazinga-item-info">
                    <div className="bazinga-item-name">{item.name}</div>
                    <div className="bazinga-item-meta">
                      {item.category} · {item.weight} kg
                    </div>
                  </div>
                  <div className="bazinga-item-actions">
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optimization Tips */}
        <div className="bazinga-tips-section">
          <div className="bazinga-section-title">💡 Optimization Tips</div>
          <div className="bazinga-tips">
            {tips.map((tip, i) => (
              <div key={i} className="bazinga-tip">
                {tip}
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="bazinga-breakdown">
              <div className="bazinga-section-title" style={{ marginTop: 20 }}>
                📦 By Category
              </div>
              {Object.entries(
                items.reduce((acc, item) => {
                  acc[item.category] =
                    (acc[item.category] || 0) + Number(item.weight || 0);
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([cat, weight]) => (
                  <div key={cat} className="bazinga-cat-row">
                    <span>{cat}</span>
                    <span>{parseFloat(weight.toFixed(2))} kg</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}