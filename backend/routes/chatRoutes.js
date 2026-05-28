import express from "express";
import { getRoomMessages, getRooms, clearRoom } from "../services/chatService.js";
import { requireAuth, requirePermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/rooms", requireAuth, async (req, res) => {
  const rooms = await getRooms();
  res.status(200).json(rooms);
});

router.get("/:roomId/messages", requireAuth, async (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const messages = await getRoomMessages(roomId, limit);
  res.status(200).json(messages);
});

router.delete("/:roomId", requirePermission("ADMIN"), async (req, res) => {
  const result = await clearRoom(req.params.roomId);
  res.status(200).json({ message: "Room cleared.", ...result });
});

export default router;
