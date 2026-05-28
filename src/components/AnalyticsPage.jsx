import "./AnalyticsPage.css";

function countPackingItems(packingList) {
  if (!packingList || !packingList.trim()) return 0;

  return packingList
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0).length;
}

function getBudgetAllocation(spent, budget) {
  if (!budget || Number(budget) <= 0) return 0;
  return Math.round((Number(spent) / Number(budget)) * 100);
}

function getBudgetStatus(spent, budget) {
  if (!budget || Number(budget) <= 0) return "No Budget";

  const percent = (Number(spent) / Number(budget)) * 100;

  if (percent > 100) return "Over Budget";
  if (percent >= 70) return "Near Limit";
  return "On Track";
}

function getStatusClass(status) {
  if (status === "Over Budget") return "status-over";
  if (status === "Near Limit") return "status-near";
  if (status === "On Track") return "status-on-track";
  return "status-neutral";
}

function BarChart({ data, maxValue }) {
  return (
    <div className="analytics-chart-card tilt-card">
      <h3>Trip Count by Category</h3>

      {data.length === 0 ? (
        <p className="analytics-empty-text">No data available.</p>
      ) : (
        <div className="analytics-bar-list">
          {data.map((item) => (
            <div key={item.label} className="analytics-bar-row">
              <span className="analytics-bar-label">{item.label}</span>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill"
                  style={{
                    width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  }}
                />
              </div>

              <span className="analytics-bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DonutChart({ spent, budget }) {
  const total = spent + Math.max(budget - spent, 0);
  const spentPercent = total > 0 ? (spent / total) * 100 : 0;
  const remainingPercent = total > 0 ? (Math.max(budget - spent, 0) / total) * 100 : 0;

  return (
    <div className="analytics-chart-card tilt-card">
      <h3>Spent vs. Budget Breakdown</h3>

      <div className="analytics-donut-wrap">
        <div
          className="analytics-donut"
          style={{
            background: `conic-gradient(
              #2563eb 0% ${spentPercent}%,
              #93c5fd ${spentPercent}% ${spentPercent + remainingPercent}%,
              rgba(255,255,255,0.08) ${spentPercent + remainingPercent}% 100%
            )`,
          }}
        >
          <div className="analytics-donut-inner" />
        </div>

        <div className="analytics-donut-legend">
          <div className="analytics-legend-row">
            <span className="analytics-legend-dot spent-dot" />
            <span>Total Spent</span>
          </div>
          <div className="analytics-legend-row">
            <span className="analytics-legend-dot remaining-dot" />
            <span>Remaining Budget</span>
          </div>
        </div>

        <div className="analytics-donut-total">
          <strong>${budget.toLocaleString()}</strong>
          <span>Total Budget</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage({ trips, onDetail }) {
  const analyticsTrips = trips.map((trip) => {
    const budget = Number(trip.budget || 0);
    const spent = Number(trip.spent || 0);
    const totalItems = countPackingItems(trip.packingList);
    const allocation = getBudgetAllocation(spent, budget);
    const status = getBudgetStatus(spent, budget);

    return {
      ...trip,
      budget,
      spent,
      totalItems,
      allocation,
      status,
    };
  });

  const totalTrips = analyticsTrips.length;
  const totalSpent = analyticsTrips.reduce((sum, trip) => sum + trip.spent, 0);
  const totalBudget = analyticsTrips.reduce((sum, trip) => sum + trip.budget, 0);
  const avgSpent = totalTrips > 0 ? (totalSpent / totalTrips).toFixed(1) : "0.0";

  const categoryCounts = {};
  analyticsTrips.forEach((trip) => {
    categoryCounts[trip.category] = (categoryCounts[trip.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const maxCategoryValue = Math.max(...categoryData.map((item) => item.value), 0);

  const tableRows = [...analyticsTrips].sort((a, b) => b.spent - a.spent);

  return (
    <div className="page analytics-page">
      <div className="analytics-heading">
        <div>
          <h1>Visual Analytics</h1>
          <p>Track your travel insights and spending</p>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="analytics-stat-card tilt-card">
          <div className="analytics-stat-label">Total Trips</div>
          <div className="analytics-stat-value">{totalTrips}</div>
        </div>

        <div className="analytics-stat-card tilt-card">
          <div className="analytics-stat-label">Total Spend</div>
          <div className="analytics-stat-value">${totalSpent.toLocaleString()}</div>
        </div>

        <div className="analytics-stat-card tilt-card">
          <div className="analytics-stat-label">Total Budget</div>
          <div className="analytics-stat-value">${totalBudget.toLocaleString()}</div>
        </div>

        <div className="analytics-stat-card tilt-card">
          <div className="analytics-stat-label">Average Trip Spending</div>
          <div className="analytics-stat-value">${avgSpent}</div>
        </div>
      </div>

      <div className="analytics-layout">
        <div className="analytics-left">
          <BarChart data={categoryData} maxValue={maxCategoryValue} />
          <DonutChart spent={totalSpent} budget={totalBudget} />
        </div>

        <div className="analytics-right">
          <div className="analytics-table-card tilt-card">
            <div className="analytics-table-header">
              <h3>Budget Breakdown by Trip</h3>
             
            </div>

            {tableRows.length === 0 ? (
              <p className="analytics-empty-text">No trips available.</p>
            ) : (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Trip Name</th>
                      <th>Category</th>
                      <th>Total Items</th>
                      <th>Total Spend</th>
                      <th>Budget Allocation %</th>
                      <th>Budget Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((trip) => (
                      <tr key={trip.id} onClick={() => onDetail(trip)}>
                        <td>
                          <div className="analytics-trip-name">{trip.tripName}</div>
                          <div className="analytics-trip-destination">{trip.destination}</div>
                        </td>

                        <td>{trip.category}</td>

                        <td>{trip.totalItems} items</td>

                        <td>${trip.spent.toLocaleString()}</td>

                        <td>
                          <div className="analytics-allocation-cell">
                            <span>{trip.allocation}%</span>
                            <div className="analytics-allocation-bar">
                              <div
                                className="analytics-allocation-fill"
                                style={{ width: `${Math.min(trip.allocation, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`analytics-status-pill ${getStatusClass(trip.status)}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}