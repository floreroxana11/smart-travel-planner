import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStatistics,
  getTripExpenses,
  addExpenseToTrip,
  updateTripExpense,
  deleteTripExpense,
  getTripExpenseStatistics,
} from "../services/tripsService.js";
import { validateTrip } from "../validators/tripValidator.js";
import * as tripGenerator from "../generator/tripGenerator.js";

function validateExpense(expenseData) {
  const errors = {};
  if (!expenseData.title || !expenseData.title.trim()) {
    errors.title = "Expense title is required.";
  }
  if (expenseData.amount === undefined || expenseData.amount === null || expenseData.amount === "") {
    errors.amount = "Expense amount is required.";
  } else if (Number(expenseData.amount) < 0) {
    errors.amount = "Expense amount must be a positive number.";
  }
  if (!expenseData.category || !expenseData.category.trim()) {
    errors.category = "Expense category is required.";
  }
  return errors;
}

export async function handleGetAllTrips(req, res) {
  const { page = 1, limit = 5, category, destination, budgetMin, budgetMax } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (destination) filters.destination = destination;
  if (budgetMin) filters.budgetMin = Number(budgetMin);
  if (budgetMax) filters.budgetMax = Number(budgetMax);
  const result = await getAllTrips(page, limit, filters);
  res.status(200).json(result);
}

export async function handleGetTripById(req, res) {
  const trip = await getTripById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found." });
  res.status(200).json(trip);
}

export async function handleCreateTrip(req, res) {
  const errors = validateTrip(req.body);
  if (Object.keys(errors).length > 0) return res.status(400).json({ message: "Validation failed.", errors });
  const newTrip = await createTrip(req.body);
  res.status(201).json(newTrip);
}

export async function handleUpdateTrip(req, res) {
  const errors = validateTrip(req.body);
  if (Object.keys(errors).length > 0) return res.status(400).json({ message: "Validation failed.", errors });
  const updatedTrip = await updateTrip(req.params.id, req.body);
  if (!updatedTrip) return res.status(404).json({ message: "Trip not found." });
  res.status(200).json(updatedTrip);
}

export async function handleDeleteTrip(req, res) {
  const deletedTrip = await deleteTrip(req.params.id);
  if (!deletedTrip) return res.status(404).json({ message: "Trip not found." });
  res.status(200).json({ message: "Trip deleted successfully.", deletedTrip });
}

export async function handleGetTripStatistics(req, res) {
  const stats = await getTripStatistics();
  res.status(200).json(stats);
}

export async function handleGetTripExpenses(req, res) {
  const expenses = await getTripExpenses(req.params.id);
  if (expenses === null) return res.status(404).json({ message: "Trip not found." });
  res.status(200).json(expenses);
}

export async function handleAddTripExpense(req, res) {
  const errors = validateExpense(req.body);
  if (Object.keys(errors).length > 0) return res.status(400).json({ message: "Expense validation failed.", errors });
  const newExpense = await addExpenseToTrip(req.params.id, req.body);
  if (newExpense === null) return res.status(404).json({ message: "Trip not found." });
  res.status(201).json(newExpense);
}

export async function handleUpdateTripExpense(req, res) {
  const errors = validateExpense(req.body);
  if (Object.keys(errors).length > 0) return res.status(400).json({ message: "Expense validation failed.", errors });
  const updatedExpense = await updateTripExpense(req.params.tripId, req.params.expenseId, req.body);
  if (updatedExpense === null) return res.status(404).json({ message: "Trip not found." });
  if (updatedExpense === undefined) return res.status(404).json({ message: "Expense not found." });
  res.status(200).json(updatedExpense);
}

export async function handleDeleteTripExpense(req, res) {
  const deletedExpense = await deleteTripExpense(req.params.tripId, req.params.expenseId);
  if (deletedExpense === null) return res.status(404).json({ message: "Trip not found." });
  if (deletedExpense === undefined) return res.status(404).json({ message: "Expense not found." });
  res.status(200).json({ message: "Expense deleted successfully.", deletedExpense });
}

export async function handleGetTripExpenseStatistics(req, res) {
  const stats = await getTripExpenseStatistics(req.params.id);
  if (stats === null) return res.status(404).json({ message: "Trip not found." });
  res.status(200).json(stats);
}

export function startGenerator(req, res) {
  const result = tripGenerator.startFakeGenerator();
  res.status(200).json(result);
}

export function stopGenerator(req, res) {
  const result = tripGenerator.stopFakeGenerator();
  res.status(200).json(result);
}