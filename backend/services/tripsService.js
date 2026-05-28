import { Op } from "sequelize";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";

export async function getAllTrips(page = 1, limit = 5, filters = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.destination) {
    where.destination = { [Op.like]: `%${filters.destination}%` };
  }
  if (filters.budgetMin !== undefined) {
    where.budget = { ...(where.budget || {}), [Op.gte]: filters.budgetMin };
  }
  if (filters.budgetMax !== undefined) {
    where.budget = { ...(where.budget || {}), [Op.lte]: filters.budgetMax };
  }

  const { count, rows } = await Trip.findAndCountAll({
    where,
    include: [{ model: Expense, as: "expenses" }],
    limit: Number(limit),
    offset,
    order: [["id", "ASC"]],
  });

  return {
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
}

export async function getTripById(id) {
  const trip = await Trip.findByPk(id, {
    include: [{ model: Expense, as: "expenses" }],
  });
  return trip || null;
}

export async function createTrip(data) {
  const trip = await Trip.create({
    tripName: data.tripName,
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    category: data.category,
    budget: data.budget,
    spent: data.spent || 0,
    collaborators: data.collaborators || "",
    packingList: data.packingList || "",
  });
  return getTripById(trip.id);
}

export async function updateTrip(id, data) {
  const trip = await Trip.findByPk(id);
  if (!trip) return null;

  await trip.update({
    tripName: data.tripName,
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    category: data.category,
    budget: data.budget,
    spent: data.spent,
    collaborators: data.collaborators ?? trip.collaborators,
    packingList: data.packingList ?? trip.packingList,
  });

  return getTripById(id);
}

export async function deleteTrip(id) {
  const trip = await Trip.findByPk(id, {
    include: [{ model: Expense, as: "expenses" }],
  });
  if (!trip) return null;

  const snapshot = trip.toJSON();
  await trip.destroy();
  return snapshot;
}


export async function getTripStatistics() {
  const trips = await Trip.findAll({
    include: [{ model: Expense, as: "expenses" }],
  });

  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget), 0);
  const totalSpent = trips.reduce((sum, t) => sum + Number(t.spent), 0);
  const averageTripSpending = totalTrips > 0 ? totalSpent / totalTrips : 0;

  const categoryCounts = {};
  const budgetBreakdownByTrip = trips.map((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;

    const totalExpenseAmount = t.expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    return {
      id: t.id,
      tripName: t.tripName,
      destination: t.destination,
      category: t.category,
      totalItems: t.packingList
        ? t.packingList.split(",").map(i => i.trim()).filter(i => i.length > 0).length
        : 0,
      totalSpend: Number(t.spent),
      budgetAllocation:
        Number(t.budget) > 0 ? Math.round((Number(t.spent) / Number(t.budget)) * 100) : 0,

      budgetStatus:
        !t.budget || Number(t.budget) <= 0
          ? "No Budget"
          : Number(t.spent) > Number(t.budget)
            ? "Over Budget"
            : Number(t.spent) / Number(t.budget) >= 0.7
              ? "Near Limit"
              : "On Track",
      totalExpenses: t.expenses.length,
      totalExpenseAmount,
    };
  });

  return {
    totalTrips,
    totalBudget,
    totalSpent,
    averageTripSpending,
    categoryCounts,
    budgetBreakdownByTrip,
  };
}


export async function getTripExpenses(tripId) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return null;

  return Expense.findAll({ where: { tripId }, order: [["id", "ASC"]] });
}

export async function addExpenseToTrip(tripId, data) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return null;

  const expense = await Expense.create({
    title: data.title,
    amount: data.amount,
    category: data.category,
    tripId: Number(tripId),
  });

  return expense;
}

export async function updateTripExpense(tripId, expenseId, data) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return null;

  const expense = await Expense.findOne({
    where: { id: expenseId, tripId },
  });
  if (!expense) return undefined;

  await expense.update({
    title: data.title,
    amount: data.amount,
    category: data.category,
  });

  return expense;
}

export async function deleteTripExpense(tripId, expenseId) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return null;

  const expense = await Expense.findOne({
    where: { id: expenseId, tripId },
  });
  if (!expense) return undefined;

  const snapshot = expense.toJSON();
  await expense.destroy();
  return snapshot;
}

export async function getTripExpenseStatistics(tripId) {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return null;

  const expenses = await Expense.findAll({ where: { tripId } });

  const totalExpenses = expenses.length;
  const totalExpenseAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const averageExpenseAmount =
    totalExpenses > 0 ? totalExpenseAmount / totalExpenses : 0;

  const categoryTotals = {};
  for (const e of expenses) {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + Number(e.amount);
  }

  return {
    tripId,
    tripName: trip.tripName,
    totalExpenses,
    totalExpenseAmount,
    averageExpenseAmount,
    categoryTotals,
  };
}