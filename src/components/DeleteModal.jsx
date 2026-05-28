import "./DeleteModal.css";

export default function DeleteModal({ tripName, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal modal-delete">
        <div className="delete-icon">🗑️</div>
        <h2>Delete Trip</h2>
        <p>
          Are you sure you want to delete <strong>"{tripName}"</strong>?
          <br />
          This action cannot be undone.
        </p>

        <div className="modal-delete-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}