import { useState } from "react";
import { emptyForm, CATEGORIES } from "../utils/data";
import { validateTrip } from "../utils/validation";
import "./TripForm.css";

export default function TripForm({ initial, onSubmit, onCancel, title }) {
  const [form, setForm] = useState(initial || emptyForm());
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = () => {
    const errs = validateTrip(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const inputClass = (key) => (errors[key] ? "form-input error" : "form-input");

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">
          {initial ? "✏️" : "➕"} {title}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Trip Name</label>
            <input
              className={inputClass("tripName")}
              placeholder="Enter trip name"
              value={form.tripName}
              onChange={setField("tripName")}
            />
            {errors.tripName && <span className="form-error">{errors.tripName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Destination</label>
            <input
              className={inputClass("destination")}
              placeholder="Enter destination"
              value={form.destination}
              onChange={setField("destination")}
            />
            {errors.destination && <span className="form-error">{errors.destination}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className={inputClass("startDate")}
              value={form.startDate}
              onChange={setField("startDate")}
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className={inputClass("endDate")}
              value={form.endDate}
              onChange={setField("endDate")}
            />
            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className={errors.category ? "form-select error" : "form-select"}
              value={form.category}
              onChange={setField("category")}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Budget ($)</label>
            <input
              className={inputClass("budget")}
              placeholder="Enter budget"
              value={form.budget}
              onChange={setField("budget")}
            />
            {errors.budget && <span className="form-error">{errors.budget}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Spent So Far ($)</label>
            <input
              className={inputClass("spent")}
              placeholder="Enter amount already spent"
              value={form.spent}
              onChange={setField("spent")}
            />
            {errors.spent && <span className="form-error">{errors.spent}</span>}
            </div>

          <div className="form-group form-full">
            <label className="form-label">
              Collaborators <span>(optional)</span>
            </label>
            <input
              className="form-input"
              placeholder="Enter collaborators"
              value={form.collaborators}
              onChange={setField("collaborators")}
            />
          </div>

          <div className="form-group form-full">
            <label className="form-label">
              Packing List <span>(optional)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Enter items"
              value={form.packingList}
              onChange={setField("packingList")}
            />
          </div>
        </div>

        <div className="form-actions top-space">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initial ? "Edit Trip" : "Add Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}