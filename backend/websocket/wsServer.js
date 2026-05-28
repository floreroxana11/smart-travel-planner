import { getUserWithRole } from "../services/authService.js";
import { saveMessage } from "../services/chatService.js";

let wsServerInstance = null;

const rooms = new Map();

function sendJson(ws, data) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToRoom(roomId, data, exceptWs = null) {
  const clients = rooms.get(roomId);

  if (!clients) {
    return;
  }

  clients.forEach((client) => {
    if (client !== exceptWs && client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

export function setWebSocketServerInstance(wss) {
  wsServerInstance = wss;

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected.");

    ws.currentRoomId = null;
    ws.currentUser = null;

    ws.on("message", async (rawMessage) => {
      try {
        const data = JSON.parse(rawMessage.toString());

        if (data.type === "join") {
          const user = await getUserWithRole(data.userId);

          if (!user) {
            return sendJson(ws, {
              type: "error",
              message: "Invalid userId.",
            });
          }

          if (!user.role.permissions.includes("USE_CHAT")) {
            return sendJson(ws, {
              type: "error",
              message: "You do not have permission to use chat.",
            });
          }

          const roomId = data.roomId || "general";

          ws.currentRoomId = roomId;
          ws.currentUser = user;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
          }

          rooms.get(roomId).add(ws);

          sendJson(ws, {
            type: "joined",
            roomId,
            username: user.username,
            role: user.role.name,
          });

          broadcastToRoom(
            roomId,
            {
              type: "user_joined",
              roomId,
              username: user.username,
            },
            ws
          );

          return;
        }

        if (data.type === "message") {
          if (!ws.currentRoomId || !ws.currentUser) {
            return sendJson(ws, {
              type: "error",
              message: "You must join a room before sending messages.",
            });
          }

          if (!data.text || !data.text.trim()) {
            return sendJson(ws, {
              type: "error",
              message: "Message text is required.",
            });
          }

          const savedMessage = await saveMessage({
            roomId: ws.currentRoomId,
            userId: ws.currentUser.id,
            username: ws.currentUser.username,
            text: data.text.trim(),
          });

          const payload = {
            type: "message",
            roomId: savedMessage.roomId,
            userId: savedMessage.userId,
            username: savedMessage.username,
            text: savedMessage.text,
            timestamp: savedMessage.timestamp,
          };

          broadcastToRoom(ws.currentRoomId, payload, ws);
          sendJson(ws, payload);

          return;
        }

        sendJson(ws, {
          type: "error",
          message: "Unknown WebSocket message type.",
        });
      } catch (err) {
        sendJson(ws, {
          type: "error",
          message: "Invalid WebSocket message.",
        });
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected.");

      if (ws.currentRoomId && rooms.has(ws.currentRoomId)) {
        rooms.get(ws.currentRoomId).delete(ws);

        if (ws.currentUser) {
          broadcastToRoom(ws.currentRoomId, {
            type: "user_left",
            roomId: ws.currentRoomId,
            username: ws.currentUser.username,
          });
        }
      }
    });
  });

  console.log("WebSocket server initialized.");
}

export function broadcastNewTrips(newTrips) {
  if (!wsServerInstance) {
    return;
  }

  const payload = JSON.stringify({
    type: "NEW_TRIPS_BATCH",
    trips: newTrips,
  });

  wsServerInstance.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}