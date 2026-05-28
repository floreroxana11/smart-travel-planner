import { useState, useCallback, useEffect, useRef } from "react";
import "./App.css";

import Nav from "./components/Nav";
import PresentationPage from "./components/PresentationPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import TripForm from "./components/TripForm";
import DeleteModal from "./components/DeleteModal";
import TripsPage from "./components/TripsPage";
import DetailPage from "./components/DetailPage";
import AnalyticsPage from "./components/AnalyticsPage";
import BazingaPage from "./components/BazingaPage";
import AdminPanel from "./components/AdminPanel";

import {
  getCookie,
  setCookie,
  deleteCookie,
  COOKIE_KEYS,
} from "./utils/cookies";

import {
  fetchTripsWithFallback,
  fetchTripsPage,
  createTripWithFallback,
  updateTripWithFallback,
  deleteTripWithFallback,
  addExpenseToTrip,
  deleteExpenseFromTrip,
  updateExpenseInTrip,
  trySyncPendingOperations,
} from "./utils/tripsApi";

const WS_URL = `wss://${window.location.hostname}:3001`;
const CHAT_ROOM = "general";

function loadUser() {
  const stored = getCookie(COOKIE_KEYS.LOGGED_IN_USER);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export default function App() {
  const [trips, setTrips] = useState([]);
  const [analyticsTrips, setAnalyticsTrips] = useState([]);
  const [user, setUser] = useState(loadUser);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTrips, setHasMoreTrips] = useState(true);
  const [isLoadingMoreTrips, setIsLoadingMoreTrips] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatStatus, setChatStatus] = useState("Disconnected");
  const wsRef = useRef(null);

  const [view, setView] = useState(() => {
    const last = getCookie(COOKIE_KEYS.LAST_VIEW);
    const loggedIn = !!loadUser();

    if (loggedIn && last && ["trips", "analytics"].includes(last)) {
      return last;
    }

    return "home";
  });

  const [modal, setModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailBackView, setDetailBackView] = useState("trips");

  async function loadInitialTrips() {
    try {
      setLoadingTrips(true);

      const result = await fetchTripsPage(1, 5);

      setTrips(result.trips);
      setCurrentPage(1);
      setHasMoreTrips(result.pagination.page < result.pagination.totalPages);
      setIsOffline(false);

      if (selectedTrip) {
        const updatedSelectedTrip = result.trips.find(
          (trip) => trip.id === selectedTrip.id
        );
        setSelectedTrip(updatedSelectedTrip || null);
      }
    } catch (error) {
      console.error("Failed to load initial trips:", error);

      const fallbackResult = await fetchTripsWithFallback();
      setTrips(fallbackResult.trips);
      setIsOffline(fallbackResult.isOffline);
      setHasMoreTrips(false);

      if (selectedTrip) {
        const updatedSelectedTrip = fallbackResult.trips.find(
          (trip) => trip.id === selectedTrip.id
        );
        setSelectedTrip(updatedSelectedTrip || null);
      }
    } finally {
      setLoadingTrips(false);
    }
  }

  async function loadAllTripsForAnalytics() {
    try {
      setLoadingAnalytics(true);

      let page = 1;
      let totalPages = 1;
      let allTrips = [];

      while (page <= totalPages) {
        const result = await fetchTripsPage(page, 5);
        allTrips = [...allTrips, ...result.trips];
        totalPages = result.pagination.totalPages;
        page += 1;
      }

      setAnalyticsTrips(allTrips);
    } catch (error) {
      console.error("Failed to load analytics trips:", error);

      const fallbackResult = await fetchTripsWithFallback();
      setAnalyticsTrips(fallbackResult.trips || []);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function loadChatHistory(userId) {
    try {
      const response = await fetch(
        `https://${window.location.hostname}:3001/api/chat/${CHAT_ROOM}/messages`,
        {
          headers: {
            "x-user-id": String(userId),
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const messages = await response.json();
      setChatMessages(
        messages.map((message) => ({
          type: "message",
          username: message.username,
          text: message.text,
          timestamp: message.timestamp,
        }))
      );
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }

  const loadMoreTrips = useCallback(async () => {
    if (isLoadingMoreTrips || !hasMoreTrips || isOffline) {
      return;
    }

    try {
      setIsLoadingMoreTrips(true);

      const nextPage = currentPage + 1;
      const result = await fetchTripsPage(nextPage, 5);

      setTrips((prevTrips) => {
        const existingIds = new Set(prevTrips.map((trip) => Number(trip.id)));
        const newTrips = result.trips.filter(
          (trip) => !existingIds.has(Number(trip.id))
        );

        return [...prevTrips, ...newTrips];
      });

      setCurrentPage(nextPage);
      setHasMoreTrips(result.pagination.page < result.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load more trips:", error);
    } finally {
      setIsLoadingMoreTrips(false);
    }
  }, [currentPage, hasMoreTrips, isLoadingMoreTrips, isOffline]);

  useEffect(() => {
    if (user) {
      loadInitialTrips();
    } else {
      setLoadingTrips(false);
      setIsOffline(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (view === "analytics") {
      loadAllTripsForAnalytics();
    }
  }, [view]);

  useEffect(() => {
    if (view !== "home" && view !== "login" && view !== "register") {
      setCookie(COOKIE_KEYS.LAST_VIEW, view);
    }
  }, [view]);

  useEffect(() => {
    async function syncPendingIfPossible() {
      const result = await trySyncPendingOperations();

      if (result.synced && result.processedCount > 0) {
        await loadInitialTrips();

        if (view === "analytics") {
          await loadAllTripsForAnalytics();
        }

        setIsOffline(false);
        setSyncMessage(`Synced ${result.processedCount} pending operation(s).`);

        setTimeout(() => {
          setSyncMessage("");
        }, 3000);
      }
    }

    const intervalId = setInterval(() => {
      syncPendingIfPossible();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [view]);

  useEffect(() => {
    if (!user?.id) {
      setChatStatus("Disconnected");
      setChatMessages([]);
      return;
    }

    loadChatHistory(user.id);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setChatStatus("Connected");

      ws.send(
        JSON.stringify({
          type: "join",
          roomId: CHAT_ROOM,
          userId: user.id,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_TRIPS_BATCH" && Array.isArray(data.trips)) {
          setTrips((prevTrips) => {
            const existingIds = new Set(
              prevTrips.map((trip) => Number(trip.id))
            );

            const newTrips = data.trips.filter(
              (trip) => !existingIds.has(Number(trip.id))
            );

            return [...prevTrips, ...newTrips];
          });

          setAnalyticsTrips((prevTrips) => {
            const existingIds = new Set(
              prevTrips.map((trip) => Number(trip.id))
            );

            const newTrips = data.trips.filter(
              (trip) => !existingIds.has(Number(trip.id))
            );

            return [...prevTrips, ...newTrips];
          });

          return;
        }

        if (data.type === "joined") {
          setChatMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: `${data.username} joined room ${data.roomId}`,
            },
          ]);
          return;
        }

        if (data.type === "user_joined") {
          setChatMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: `${data.username} joined the chat`,
            },
          ]);
          return;
        }

        if (data.type === "user_left") {
          setChatMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: `${data.username} left the chat`,
            },
          ]);
          return;
        }

        if (data.type === "message") {
          setChatMessages((prev) => [
            ...prev,
            {
              type: "message",
              username: data.username,
              text: data.text,
              timestamp: data.timestamp,
            },
          ]);
          return;
        }

        if (data.type === "message") {
          setChatMessages((prev) => {
            const alreadyExists = prev.some(
              (message) =>
                message.type === "message" &&
                message.username === data.username &&
                message.text === data.text &&
                message.timestamp === data.timestamp
            );

            if (alreadyExists) {
              return prev;
            }

            return [
              ...prev,
              {
                type: "message",
                username: data.username,
                text: data.text,
                timestamp: data.timestamp,
              },
            ];
          });

          return;
        }
      } catch (error) {
        console.error("Failed to process WS message:", error);
      }
    };

    ws.onclose = () => {
      setChatStatus("Disconnected");
    };

    ws.onerror = (error) => {
      console.log("WS error:", error);
      setChatStatus("Error");
    };

    return () => {
      ws.close();
    };
  }, [user]);

  function sendChatMessage() {
    if (!chatText.trim()) {
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== 1) {
      setChatMessages((prev) => [
        ...prev,
        {
          type: "system",
          text: "Chat is not connected.",
        },
      ]);
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        text: chatText.trim(),
      })
    );

    setChatText("");
  }

  const navigateTo = (v) => setView(v);

  const handleLogin = (u) => {
    console.log("LOGIN USER:", u);
    setUser(u);
    setCookie(COOKIE_KEYS.LOGGED_IN_USER, JSON.stringify(u));
    setView("trips");
  };

  const handleRegister = (u) => {
    setUser(u);
    setCookie(COOKIE_KEYS.LOGGED_IN_USER, JSON.stringify(u));
    setView("trips");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    deleteCookie(COOKIE_KEYS.LOGGED_IN_USER);
    deleteCookie(COOKIE_KEYS.LAST_VIEW);
    setView("home");
    setSelectedTrip(null);
    setDetailBackView("trips");
  };

  useEffect(() => {
    const TIMEOUT_MS = 30 * 60 * 1000; // 30 minute
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      if (user) {
        timer = setTimeout(() => {
          handleLogout();
          alert("Ai fost deconectat din cauza inactivității.");
        }, TIMEOUT_MS);
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // pornește timer-ul la mount

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user, handleLogout]);

  const handleAddExpense = useCallback(
    async (tripId, expenseData) => {
      try {
        await addExpenseToTrip(tripId, expenseData);

        setTrips((prev) =>
          prev.map((trip) => {
            if (trip.id !== tripId) {
              return trip;
            }

            const newExpenseId =
              trip.expenses && trip.expenses.length > 0
                ? Math.max(
                  ...trip.expenses.map((expense) => Number(expense.id))
                ) + 1
                : 1;

            const newExpense = {
              id: newExpenseId,
              title: expenseData.title,
              amount: expenseData.amount.toString(),
              category: expenseData.category,
            };

            const updatedTrip = {
              ...trip,
              expenses: [...(trip.expenses || []), newExpense],
            };

            if (selectedTrip?.id === tripId) {
              setSelectedTrip(updatedTrip);
            }

            return updatedTrip;
          })
        );

        setAnalyticsTrips((prev) =>
          prev.map((trip) => {
            if (trip.id !== tripId) {
              return trip;
            }

            const newExpenseId =
              trip.expenses && trip.expenses.length > 0
                ? Math.max(
                  ...trip.expenses.map((expense) => Number(expense.id))
                ) + 1
                : 1;

            return {
              ...trip,
              expenses: [
                ...(trip.expenses || []),
                {
                  id: newExpenseId,
                  title: expenseData.title,
                  amount: expenseData.amount.toString(),
                  category: expenseData.category,
                },
              ],
            };
          })
        );
      } catch (error) {
        console.error("Failed to add expense:", error);
      }
    },
    [selectedTrip]
  );

  const handleUpdateExpense = useCallback(
    async (tripId, expenseId, expenseData) => {
      try {
        const updatedExpense = await updateExpenseInTrip(
          tripId,
          expenseId,
          expenseData
        );

        setTrips((prev) =>
          prev.map((trip) => {
            if (trip.id !== tripId) {
              return trip;
            }

            const updatedTrip = {
              ...trip,
              expenses: (trip.expenses || []).map((expense) =>
                Number(expense.id) === Number(expenseId)
                  ? updatedExpense
                  : expense
              ),
            };

            if (selectedTrip?.id === tripId) {
              setSelectedTrip(updatedTrip);
            }

            return updatedTrip;
          })
        );

        setAnalyticsTrips((prev) =>
          prev.map((trip) =>
            trip.id !== tripId
              ? trip
              : {
                ...trip,
                expenses: (trip.expenses || []).map((expense) =>
                  Number(expense.id) === Number(expenseId)
                    ? updatedExpense
                    : expense
                ),
              }
          )
        );
      } catch (error) {
        console.error("Failed to update expense:", error);
      }
    },
    [selectedTrip]
  );

  const handleDeleteExpense = useCallback(
    async (tripId, expenseId) => {
      try {
        await deleteExpenseFromTrip(tripId, expenseId);

        setTrips((prev) =>
          prev.map((trip) => {
            if (trip.id !== tripId) {
              return trip;
            }

            const updatedTrip = {
              ...trip,
              expenses: (trip.expenses || []).filter(
                (expense) => Number(expense.id) !== Number(expenseId)
              ),
            };

            if (selectedTrip?.id === tripId) {
              setSelectedTrip(updatedTrip);
            }

            return updatedTrip;
          })
        );

        setAnalyticsTrips((prev) =>
          prev.map((trip) =>
            trip.id !== tripId
              ? trip
              : {
                ...trip,
                expenses: (trip.expenses || []).filter(
                  (expense) => Number(expense.id) !== Number(expenseId)
                ),
              }
          )
        );
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    },
    [selectedTrip]
  );

  const addTrip = useCallback(
    async (form) => {
      try {
        const result = await createTripWithFallback(form);

        if (result.isOffline) {
          setIsOffline(true);
          setTrips((prev) => [...prev, result.trip]);
        } else {
          await loadInitialTrips();
          if (view === "analytics") {
            await loadAllTripsForAnalytics();
          }
          setIsOffline(false);
        }

        setModal(null);
      } catch (error) {
        if (error.message === "FORBIDDEN") {
          alert("You do not have permission to add trips.");
          return;
        }

        console.error("Failed to add trip:", error);
      }
    },
    [view]
  );

  const editTrip = useCallback(
    async (form) => {
      try {
        const result = await updateTripWithFallback(modal.trip.id, form);

        if (result.isOffline) {
          setIsOffline(true);

          setTrips((prev) =>
            prev.map((trip) =>
              trip.id === modal.trip.id ? result.trip : trip
            )
          );

          setAnalyticsTrips((prev) =>
            prev.map((trip) =>
              trip.id === modal.trip.id ? result.trip : trip
            )
          );

          if (selectedTrip?.id === modal.trip.id) {
            setSelectedTrip(result.trip);
          }
        } else {
          await loadInitialTrips();
          if (view === "analytics") {
            await loadAllTripsForAnalytics();
          }
          setIsOffline(false);
        }

        setModal(null);
      } catch (error) {
        if (error.message === "FORBIDDEN") {
          alert("You do not have permission to edit trips.");
          return;
        }

        console.error("Failed to edit trip:", error);
      }
},
[modal, selectedTrip, view]
  );

const deleteTrip = useCallback(async () => {
  try {
    const result = await deleteTripWithFallback(modal.trip.id);

    if (result.isOffline) {
      setIsOffline(true);
      setTrips((prev) => prev.filter((trip) => trip.id !== modal.trip.id));
      setAnalyticsTrips((prev) =>
        prev.filter((trip) => trip.id !== modal.trip.id)
      );
    } else {
      await loadInitialTrips();
      if (view === "analytics") {
        await loadAllTripsForAnalytics();
      }
      setIsOffline(false);
    }

    if (selectedTrip?.id === modal.trip.id) {
      setSelectedTrip(null);
      setView(detailBackView);
    }

    setModal(null);
  } catch (error) {
    if (error.message === "FORBIDDEN") {
      alert("You do not have permission to delete trips.");
      return;
    }

    console.error("Failed to delete trip:", error);
  }
}, [modal, selectedTrip, detailBackView, view]);

const openAdd = () => setModal({ type: "add" });
const openEdit = (trip) => setModal({ type: "edit", trip });
const openDelete = (trip) => setModal({ type: "delete", trip });

const openDetail = (trip, backView = "trips") => {
  setSelectedTrip(trip);
  setDetailBackView(backView);
  setView("detail");
};

const openBazinga = (trip) => {
  setSelectedTrip(trip);
  setView("bazinga");
};

return (
  <div className="app">
    <Nav
      onHome={() => setView(user ? "trips" : "home")}
      onAnalytics={() => navigateTo("analytics")}
      onAdmin={() => setView("admin")}
      onLogout={handleLogout}
      user={user}
      view={view}
      onGoLogin={() => setView("login")}
      onGoRegister={() => setView("register")}
    />

    {isOffline && (
      <div
        style={{
          background: "#fff3cd",
          color: "#856404",
          padding: "10px 16px",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Offline mode: changes are stored locally and will sync when the server
        is back.
      </div>
    )}

    {syncMessage && (
      <div
        style={{
          background: "#d1e7dd",
          color: "#0f5132",
          padding: "10px 16px",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        {syncMessage}
      </div>
    )}

    {user && (
      <div
        style={{
          margin: "16px auto",
          maxWidth: "1100px",
          background: "#111827",
          color: "white",
          border: "1px solid #374151",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Real-Time Chat ({CHAT_ROOM}) — {chatStatus}
        </h3>

        <div
          style={{
            height: "160px",
            overflowY: "auto",
            background: "#020617",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {chatMessages.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No messages yet.</p>
          ) : (
            chatMessages.map((message, index) => (
              <div key={index} style={{ marginBottom: "6px" }}>
                {message.type === "system" ? (
                  <em style={{ color: "#94a3b8" }}>{message.text}</em>
                ) : (
                  <span>
                    <strong>{message.username}: </strong>
                    {message.text}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={chatText}
            onChange={(event) => setChatText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendChatMessage();
              }
            }}
            placeholder="Write a chat message..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #475569",
            }}
          />
          <button
            onClick={sendChatMessage}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    )}

    {view === "home" && (
      <PresentationPage onStart={() => setView("login")} />
    )}

    {view === "login" && (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setView("register")}
      />
    )}

    {view === "register" && (
      <RegisterPage
        onRegister={handleRegister}
        onGoLogin={() => setView("login")}
      />
    )}

    {view === "trips" &&
      (loadingTrips ? (
        <div className="page">
          <p style={{ padding: "24px" }}>Loading trips...</p>
        </div>
      ) : (
        <TripsPage
          trips={trips}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={openDelete}
          onDetail={(trip) => openDetail(trip, "trips")}
          onBazinga={openBazinga}
          onLoadMore={loadMoreTrips}
          hasMore={hasMoreTrips}
          isLoadingMore={isLoadingMoreTrips}
        />
      ))}

    {view === "detail" && selectedTrip && (
      <DetailPage
        trip={selectedTrip}
        onBack={() => setView(detailBackView)}
        onEdit={openEdit}
        onBazinga={openBazinga}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    )}

    {view === "analytics" &&
      (loadingAnalytics ? (
        <div className="page">
          <p style={{ padding: "24px" }}>Loading analytics...</p>
        </div>
      ) : (
        <AnalyticsPage
          trips={analyticsTrips}
          onDetail={(trip) => openDetail(trip, "analytics")}
        />
      ))}

    {view === "admin" && user?.role?.name === "admin" && (
      <AdminPanel currentUser={user} />
    )}

    {view === "bazinga" && selectedTrip && (
      <BazingaPage trip={selectedTrip} onBack={() => setView("detail")} />
    )}

    {modal?.type === "add" && (
      <TripForm
        title="Add New Trip"
        onSubmit={addTrip}
        onCancel={() => setModal(null)}
      />
    )}

    {modal?.type === "edit" && (
      <TripForm
        title="Edit Trip"
        initial={modal.trip}
        onSubmit={editTrip}
        onCancel={() => setModal(null)}
      />
    )}

    {modal?.type === "delete" && (
      <DeleteModal
        tripName={modal.trip.tripName}
        onConfirm={deleteTrip}
        onCancel={() => setModal(null)}
      />
    )}
  </div>
);
} 