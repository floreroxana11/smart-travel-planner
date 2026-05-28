const LOCAL_TRIPS_KEY = "stp_offline_trips";
const PENDING_OPERATIONS_KEY = "stp_pending_operations";

export function loadOfflineTrips() {
  try {
    const saved = localStorage.getItem(LOCAL_TRIPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveOfflineTrips(trips) {
  localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips));
}

export function loadPendingOperations() {
  try {
    const saved = localStorage.getItem(PENDING_OPERATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function savePendingOperations(operations) {
  localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(operations));
}

export function addPendingOperation(operation) {
  const operations = loadPendingOperations();
  operations.push(operation);
  savePendingOperations(operations);
}

export function clearPendingOperations() {
  localStorage.removeItem(PENDING_OPERATIONS_KEY);
}

export function getNextOfflineId(trips) {
  if (trips.length === 0) {
    return 1;
  }

  return Math.max(...trips.map((trip) => Number(trip.id))) + 1;
}