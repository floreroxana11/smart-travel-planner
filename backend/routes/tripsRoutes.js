import express from "express";
import {
  handleGetAllTrips,
  handleGetTripById,
  handleCreateTrip,
  handleUpdateTrip,
  handleDeleteTrip,
  handleGetTripStatistics,
  handleGetTripExpenses,
  handleAddTripExpense,
  handleUpdateTripExpense,
  handleDeleteTripExpense,
  handleGetTripExpenseStatistics,
  startGenerator,
  stopGenerator,
} from "../controllers/tripsController.js";

import { requirePermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requirePermission("VIEW_TRIPS"), handleGetAllTrips);
router.get("/stats", requirePermission("VIEW_STATS"), handleGetTripStatistics);
router.get("/:id", requirePermission("VIEW_TRIPS"), handleGetTripById);

router.post("/", requirePermission("CREATE_TRIP"), handleCreateTrip);
router.put("/:id", requirePermission("EDIT_TRIP"), handleUpdateTrip);
router.delete("/:id", requirePermission("DELETE_TRIP"), handleDeleteTrip);

router.post("/start-generator", requirePermission("ADMIN"), startGenerator);
router.post("/stop-generator", requirePermission("ADMIN"), stopGenerator);

router.get("/:id/expenses", requirePermission("VIEW_EXPENSES"), handleGetTripExpenses);
router.post("/:id/expenses", requirePermission("MANAGE_EXPENSES"), handleAddTripExpense);

router.get("/:id/expenses/stats", requirePermission("VIEW_STATS"), handleGetTripExpenseStatistics);
router.put("/:tripId/expenses/:expenseId", requirePermission("MANAGE_EXPENSES"), handleUpdateTripExpense);
router.delete("/:tripId/expenses/:expenseId", requirePermission("MANAGE_EXPENSES"), handleDeleteTripExpense);

export default router;