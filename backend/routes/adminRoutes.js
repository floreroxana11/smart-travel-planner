import express from "express";
import { getAllLogs, getObservationList, resolveObservation } from "../services/logService.js";
import { requirePermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/logs", requirePermission("ADMIN"), async (req, res) => {
  const { limit, userId, action } = req.query;
  const logs = await getAllLogs({
    limit: limit ? parseInt(limit) : 100,
    userId: userId ? parseInt(userId) : undefined,
    action,
  });
  res.status(200).json(logs);
});

router.get("/observation-list", requirePermission("ADMIN"), async (req, res) => {
  const list = await getObservationList();
  res.status(200).json(list);
});

router.patch("/observation-list/:id/resolve", requirePermission("ADMIN"), async (req, res) => {
  try {
    const entry = await resolveObservation(req.params.id);
    res.status(200).json({ message: "Marked as resolved.", entry });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router;