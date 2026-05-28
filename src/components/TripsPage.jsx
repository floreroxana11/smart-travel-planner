import { useEffect, useRef } from "react";
import { formatDate, badgeClass } from "../utils/helpers";
import "./TripsPage.css";

export default function TripsPage({
  trips,
  onAdd,
  onEdit,
  onDelete,
  onDetail,
  onBazinga,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) {
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const currentTarget = loadMoreRef.current;

    if (!currentTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const total = trips.length;

  return (
    <div className="page">
      <div className="page-heading">
        <h1>My Trips</h1>
        <p>Manage and organize all your travel plans</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Trips</div>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>
            ➕ New Trip
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trip Name</th>
                <th>Destination</th>
                <th>Date Range</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <div className="empty-icon">✈️</div>
                      <p>No trips yet. Add your first trip!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((trip) => {
                  const budget = Number(trip.budget || 0);
                  const spent = Number(trip.spent || 0);
                  const isOverBudget = spent > budget;

                  return (
                    <tr key={trip.id} onClick={() => onDetail(trip)}>
                      <td>
                        <strong>{trip.tripName}</strong>
                      </td>
                      <td>{trip.destination}</td>
                      <td className="nowrap">
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </td>
                      <td>
                        <span className={badgeClass(trip.category)}>
                          {trip.category}
                        </span>
                      </td>
                      <td>${budget.toLocaleString()}</td>
                      <td
                        style={{
                          color: isOverBudget ? "#f87171" : "#34d399",
                          fontWeight: 700,
                        }}
                      >
                        ${spent.toLocaleString()}
                      </td>
                      <td>
                        <div
                          className="td-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            aria-label={`edit-${trip.id}`}
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => onEdit(trip)}
                          >
                            ✏️
                          </button>
                          <button
                            aria-label={`delete-${trip.id}`}
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => onDelete(trip)}
                          >
                            🗑️
                          </button>
                          <button
                            aria-label={`detail-${trip.id}`}
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => onDetail(trip)}
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing {total} loaded trip{total === 1 ? "" : "s"}
          </span>
        </div>

        <div
          ref={loadMoreRef}
          style={{
            height: "20px",
          }}
        />

        {isLoadingMore && (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0 20px 0",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            Loading more trips...
          </div>
        )}

        {!hasMore && trips.length > 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0 20px 0",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            No more trips to load.
          </div>
        )}
      </div>
    </div>
  );
}