import chatDb from "../nosql/chatDb.js";

/**
 * Save a new chat message to NeDB (NoSQL document store).
 * Document shape: { roomId, userId, username, text, timestamp }
 */
export async function saveMessage({ roomId, userId, username, text }) {
  const doc = {
    roomId,
    userId,
    username,
    text,
    timestamp: new Date().toISOString(),
  };
  return chatDb.insertAsync(doc);
}

/**
 * Get the last N messages for a room, sorted oldest-first.
 */
export async function getRoomMessages(roomId, limit = 50) {
  const messages = await chatDb
    .findAsync({ roomId })
    .sort({ timestamp: 1 })
    .limit(limit);
  return messages;
}

/**
 * Get all rooms that have at least one message.
 */
export async function getRooms() {
  const allMessages = await chatDb.findAsync({});
  const roomIds = [...new Set(allMessages.map((m) => m.roomId))];
  return roomIds.map((id) => ({ roomId: id }));
}

/**
 * Delete all messages in a room (admin only).
 */
export async function clearRoom(roomId) {
  const numRemoved = await chatDb.removeAsync({ roomId }, { multi: true });
  return { roomId, messagesDeleted: numRemoved };
}
