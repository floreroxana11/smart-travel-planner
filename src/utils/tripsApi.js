import {
  loadOfflineTrips,
  saveOfflineTrips,
  loadPendingOperations,
  savePendingOperations,
  addPendingOperation,
  getNextOfflineId,
} from "./offlineSync";
import { getCookie, COOKIE_KEYS } from "./cookies";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/trips`;

let isSyncInProgress = false;

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


function normalizeExpense(expense) {
  return {
    id: Number(expense.id),
    title: expense.title ?? "",
    amount: expense.amount?.toString() ?? "",
    category: expense.category ?? "",
  };
}

function normalizeTrip(trip) {
  return {
    id: Number(trip.id),
    tripName: trip.tripName ?? "",
    destination: trip.destination ?? "",
    startDate: trip.startDate ?? "",
    endDate: trip.endDate ?? "",
    category: trip.category ?? "",
    budget: trip.budget?.toString() ?? "",
    spent: trip.spent?.toString() ?? "",
    collaborators: trip.collaborators ?? "",
    packingList: trip.packingList ?? "",
    expenses: Array.isArray(trip.expenses)
      ? trip.expenses.map(normalizeExpense)
      : [],
  };
}

function replaceTripInOfflineStorage(updatedTrip) {
  const offlineTrips = loadOfflineTrips().map(normalizeTrip);
  const newTrips = offlineTrips.map((trip) =>
    Number(trip.id) === Number(updatedTrip.id)
      ? normalizeTrip(updatedTrip)
      : trip
  );
  saveOfflineTrips(newTrips);
}

function removeTripFromOfflineStorage(tripId) {
  const offlineTrips = loadOfflineTrips().map(normalizeTrip);
  const newTrips = offlineTrips.filter(
    (trip) => Number(trip.id) !== Number(tripId)
  );
  saveOfflineTrips(newTrips);
}

function addTripToOfflineStorage(trip) {
  const offlineTrips = loadOfflineTrips().map(normalizeTrip);
  const newTrips = [...offlineTrips, normalizeTrip(trip)];
  saveOfflineTrips(newTrips);
}

function queueUpdateAction(updatedTrip) {
  const pendingActions = loadPendingOperations();

  const hasPendingCreate = pendingActions.some(
    (action) =>
      action.type === "create" &&
      Number(action.trip.id) === Number(updatedTrip.id)
  );

  if (hasPendingCreate) {
    const newPendingActions = pendingActions.map((action) => {
      if (
        action.type === "create" &&
        Number(action.trip.id) === Number(updatedTrip.id)
      ) {
        return {
          ...action,
          trip: normalizeTrip(updatedTrip),
        };
      }

      return action;
    });

    savePendingOperations(newPendingActions);
    return;
  }

  const newPendingActions = [
    ...pendingActions.filter(
      (action) =>
        !(
          action.type === "update" &&
          Number(action.trip.id) === Number(updatedTrip.id)
        )
    ),
    {
      type: "update",
      trip: normalizeTrip(updatedTrip),
    },
  ];

  savePendingOperations(newPendingActions);
}

function queueDeleteAction(tripId) {
  const pendingActions = loadPendingOperations();

  const hasPendingCreate = pendingActions.some(
    (action) =>
      action.type === "create" && Number(action.trip.id) === Number(tripId)
  );

  if (hasPendingCreate) {
    const newPendingActions = pendingActions.filter((action) => {
      if (
        action.type === "create" &&
        Number(action.trip.id) === Number(tripId)
      ) {
        return false;
      }

      if (
        action.type === "update" &&
        Number(action.trip.id) === Number(tripId)
      ) {
        return false;
      }

      if (action.type === "delete" && Number(action.id) === Number(tripId)) {
        return false;
      }

      return true;
    });

    savePendingOperations(newPendingActions);
    return;
  }

  const newPendingActions = [
    ...pendingActions.filter(
      (action) =>
        !(
          (action.type === "update" &&
            Number(action.trip.id) === Number(tripId)) ||
          (action.type === "delete" && Number(action.id) === Number(tripId))
        )
    ),
    {
      type: "delete",
      id: Number(tripId),
    },
  ];

  savePendingOperations(newPendingActions);
}

export async function fetchTripsWithFallback() {
  try {
    let currentPage = 1;
    let totalPages = 1;
    let allTrips = [];

    while (currentPage <= totalPages) {
      const response = await fetch(
        `${API_BASE_URL}?page=${currentPage}&limit=5`,
        {
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Server error while fetching trips.");
      }

      const result = await response.json();

      allTrips = [...allTrips, ...result.data.map(normalizeTrip)];
      totalPages = result.pagination.totalPages;
      currentPage += 1;
    }

    saveOfflineTrips(allTrips);

    return {
      trips: allTrips,
      isOffline: false,
    };
  } catch {
    const offlineTrips = loadOfflineTrips().map(normalizeTrip);

    return {
      trips: offlineTrips,
      isOffline: true,
    };
  }
}

export async function fetchTripsPage(page = 1, limit = 5) {
  const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trips page.");
  }

  const result = await response.json();

  return {
    trips: (result.data || []).map(normalizeTrip),
    pagination: result.pagination || {
      page,
      limit,
      totalItems: 0,
      totalPages: 1,
    },
  };
}

export async function createTripWithFallback(form) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form),
    });

    if (response.status === 403) {
      throw new Error("FORBIDDEN");
    }

    if (!response.ok) {
      throw new Error("Failed to create trip on server.");
    }

    const createdTrip = normalizeTrip(await response.json());
    addTripToOfflineStorage(createdTrip);

    return {
      trip: createdTrip,
      isOffline: false,
    };
  } catch (error) {
    if (error.message === "FORBIDDEN") {
      throw error;
    }

    const offlineTrips = loadOfflineTrips().map(normalizeTrip);
    const localTrip = normalizeTrip({
      ...form,
      id: getNextOfflineId(offlineTrips),
      expenses: [],
    });

    addTripToOfflineStorage(localTrip);
    addPendingOperation({
      type: "create",
      trip: localTrip,
    });

    return {
      trip: localTrip,
      isOffline: true,
    };
  }
}

export async function updateTripWithFallback(tripId, form) {
  const existingTrips = loadOfflineTrips().map(normalizeTrip);
  const currentTrip = existingTrips.find(
    (trip) => Number(trip.id) === Number(tripId)
  );

  const updatedTrip = normalizeTrip({
    ...form,
    id: Number(tripId),
    expenses: currentTrip?.expenses || [],
  });

  try {
    const response = await fetch(`${API_BASE_URL}/${tripId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedTrip),
    });

    if (response.status === 403) {
      throw new Error("FORBIDDEN");
    }

    if (!response.ok) {
      throw new Error("Failed to update trip on server.");
    }

    const savedTrip = normalizeTrip(await response.json());
    replaceTripInOfflineStorage(savedTrip);

    return {
      trip: savedTrip,
      isOffline: false,
    };
  } catch (error) {
    if (error.message === "FORBIDDEN") {
      throw error;
    }

    replaceTripInOfflineStorage(updatedTrip);
    queueUpdateAction(updatedTrip);

    return {
      trip: updatedTrip,
      isOffline: true,
    };
  }
}

export async function deleteTripWithFallback(tripId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${tripId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (response.status === 403) {
      throw new Error("FORBIDDEN");
    }

    if (!response.ok && response.status !== 200) {
      throw new Error("Failed to delete trip from server.");
    }

    removeTripFromOfflineStorage(tripId);

    return {
      isOffline: false,
    };
  } catch (error) {
    if (error.message === "FORBIDDEN") {
      throw error;
    }

    removeTripFromOfflineStorage(tripId);
    queueDeleteAction(tripId);

    return {
      isOffline: true,
    };
  }
}

export async function addExpenseToTrip(tripId, expenseData) {
  try {
    const response = await fetch(`${API_BASE_URL}/${tripId}/expenses`, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(expenseData),
    });

    const createdExpense = normalizeExpense(await response.json());

    if (!response.ok) {
      throw new Error("Failed to add expense.");
    }

    const offlineTrips = loadOfflineTrips().map(normalizeTrip);
    const updatedTrips = offlineTrips.map((trip) => {
      if (Number(trip.id) !== Number(tripId)) {
        return trip;
      }

      return {
        ...trip,
        expenses: [...(trip.expenses || []), createdExpense],
      };
    });

    saveOfflineTrips(updatedTrips);

    return {
      expense: createdExpense,
      isOffline: false,
    };
  } catch {
    const offlineTrips = loadOfflineTrips().map(normalizeTrip);

    const updatedTrips = offlineTrips.map((trip) => {
      if (Number(trip.id) !== Number(tripId)) {
        return trip;
      }

      const newExpenseId =
        trip.expenses && trip.expenses.length > 0
          ? Math.max(...trip.expenses.map((expense) => Number(expense.id))) + 1
          : 1;

      const localExpense = normalizeExpense({
        id: newExpenseId,
        title: expenseData.title,
        amount: expenseData.amount,
        category: expenseData.category,
      });

      return {
        ...trip,
        expenses: [...(trip.expenses || []), localExpense],
      };
    });

    saveOfflineTrips(updatedTrips);

    return {
      expense: null,
      isOffline: true,
    };
  }
}

export async function updateExpenseInTrip(tripId, expenseId, expenseData) {
  const response = await fetch(
    `${API_BASE_URL}/${tripId}/expenses/${expenseId}`,
    {
      method: "PUT",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(expenseData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update expense.");
  }

  return await response.json();
}

export async function deleteExpenseFromTrip(tripId, expenseId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${tripId}/expenses/${expenseId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!response.ok && response.status !== 200) {
      throw new Error("Failed to delete expense.");
    }

    const offlineTrips = loadOfflineTrips().map(normalizeTrip);
    const updatedTrips = offlineTrips.map((trip) => {
      if (Number(trip.id) !== Number(tripId)) {
        return trip;
      }

      return {
        ...trip,
        expenses: (trip.expenses || []).filter(
          (expense) => Number(expense.id) !== Number(expenseId)
        ),
      };
    });

    saveOfflineTrips(updatedTrips);

    return {
      isOffline: false,
    };
  } catch {
    const offlineTrips = loadOfflineTrips().map(normalizeTrip);
    const updatedTrips = offlineTrips.map((trip) => {
      if (Number(trip.id) !== Number(tripId)) {
        return trip;
      }

      return {
        ...trip,
        expenses: (trip.expenses || []).filter(
          (expense) => Number(expense.id) !== Number(expenseId)
        ),
      };
    });

    saveOfflineTrips(updatedTrips);

    return {
      isOffline: true,
    };
  }
}

export async function trySyncPendingOperations() {
  if (isSyncInProgress) {
    return {
      synced: false,
      processedCount: 0,
    };
  }

  const pendingActions = loadPendingOperations();

  if (pendingActions.length === 0) {
    return {
      synced: true,
      processedCount: 0,
    };
  }

  isSyncInProgress = true;

  try {
    let remainingActions = [...pendingActions];
    let localTrips = loadOfflineTrips().map(normalizeTrip);

    for (const action of pendingActions) {
      if (action.type === "create") {
        const { id, ...tripWithoutId } = action.trip;

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(tripWithoutId),
        });

        if (!response.ok) {
          throw new Error("Failed to sync create action.");
        }

        const createdTrip = normalizeTrip(await response.json());
        const oldId = Number(action.trip.id);

        localTrips = localTrips.map((trip) =>
          Number(trip.id) === oldId ? createdTrip : trip
        );

        remainingActions = remainingActions.slice(1).map((pendingAction) => {
          if (
            pendingAction.type === "update" &&
            Number(pendingAction.trip.id) === oldId
          ) {
            return {
              ...pendingAction,
              trip: {
                ...pendingAction.trip,
                id: createdTrip.id,
              },
            };
          }

          if (
            pendingAction.type === "delete" &&
            Number(pendingAction.id) === oldId
          ) {
            return {
              ...pendingAction,
              id: createdTrip.id,
            };
          }

          return pendingAction;
        });

        saveOfflineTrips(localTrips);
        savePendingOperations(remainingActions);
        continue;
      }

      if (action.type === "update") {
        const response = await fetch(`${API_BASE_URL}/${action.trip.id}`, {
          method: "PUT",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(action.trip),
        });

        if (!response.ok) {
          throw new Error("Failed to sync update action.");
        }

        const updatedTrip = normalizeTrip(await response.json());

        localTrips = localTrips.map((trip) =>
          Number(trip.id) === Number(updatedTrip.id) ? updatedTrip : trip
        );

        remainingActions = remainingActions.slice(1);

        saveOfflineTrips(localTrips);
        savePendingOperations(remainingActions);
        continue;
      }

      if (action.type === "delete") {
        const response = await fetch(`${API_BASE_URL}/${action.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });

        if (!response.ok && response.status !== 200 && response.status !== 404) {
          throw new Error("Failed to sync delete action.");
        }

        localTrips = localTrips.filter(
          (trip) => Number(trip.id) !== Number(action.id)
        );
        remainingActions = remainingActions.slice(1);

        saveOfflineTrips(localTrips);
        savePendingOperations(remainingActions);
      }
    }

    const refreshed = await fetchTripsWithFallback();

    return {
      synced: true,
      processedCount: pendingActions.length,
      trips: refreshed.trips,
      isOffline: false,
    };
  } catch (error) {
    console.error("Sync paused:", error);

    return {
      synced: false,
      processedCount: 0,
    };
  } finally {
    isSyncInProgress = false;
  }
}