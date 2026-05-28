import { describe, it, expect, beforeEach } from "vitest";
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
import { sequelize, Trip, Expense } from "../database/init.js";

const testTrips = [
  {
    tripName: "Summer Beach Escape",
    destination: "Bali, Indonesia",
    startDate: "2026-06-15",
    endDate: "2026-06-25",
    category: "Beach",
    budget: 2000,
    spent: 1450,
    collaborators: "Sarah",
    packingList: "swimsuit, pyjama, sunglasses",
  },
  {
    tripName: "Alpine Adventure",
    destination: "Swiss Alps, Switzerland",
    startDate: "2026-08-17",
    endDate: "2026-08-24",
    category: "Mountain",
    budget: 3500,
    spent: 3600,
    collaborators: "Frank",
    packingList: "hiking boots, jacket",
  },
  {
    tripName: "City Break Paris",
    destination: "Paris, France",
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    category: "City",
    budget: 1800,
    spent: 900,
    collaborators: "",
    packingList: "passport, camera",
  },
  {
    tripName: "Road Trip Italy",
    destination: "Tuscany, Italy",
    startDate: "2026-05-10",
    endDate: "2026-05-18",
    category: "Road Trip",
    budget: 2200,
    spent: 1200,
    collaborators: "Alex",
    packingList: "charger, map",
  },
  {
    tripName: "Cultural Tokyo Tour",
    destination: "Tokyo, Japan",
    startDate: "2026-10-05",
    endDate: "2026-10-15",
    category: "Cultural",
    budget: 3000,
    spent: 1800,
    collaborators: "Maria",
    packingList: "passport, adapter",
  },
  {
    tripName: "Desert Adventure",
    destination: "Dubai, UAE",
    startDate: "2026-11-12",
    endDate: "2026-11-20",
    category: "Adventure",
    budget: 2500,
    spent: 950,
    collaborators: "",
    packingList: "sunscreen, hat",
  },
  {
    tripName: "Weekend in Prague",
    destination: "Prague, Czech Republic",
    startDate: "2026-04-02",
    endDate: "2026-04-06",
    category: "City",
    budget: 900,
    spent: 350,
    collaborators: "Andrei",
    packingList: "jacket, passport",
  },
];

let firstTripId;
let firstExpenseId;

async function resetTestDatabase() {
  await sequelize.sync();

  await Expense.destroy({ where: {} });
  await Trip.destroy({ where: {} });

  const createdTrips = await Trip.bulkCreate(testTrips, { returning: true });

  firstTripId = createdTrips[0].id;

  const createdExpenses = await Expense.bulkCreate(
    [
      { title: "Flight", amount: 700, category: "Transport", tripId: firstTripId },
      { title: "Hotel", amount: 500, category: "Accommodation", tripId: firstTripId },
      { title: "Food", amount: 250, category: "Food", tripId: firstTripId },
    ],
    { returning: true }
  );

  firstExpenseId = createdExpenses[0].id;
}

describe("tripsService", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("should return paginated trips", async () => {
    const result = await getAllTrips(1, 5);

    expect(result.data.length).toBe(5);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(5);
    expect(result.pagination.totalItems).toBeGreaterThan(0);
    expect(result.pagination.totalPages).toBeGreaterThan(0);
  });

  it("should return second page of paginated trips", async () => {
    const result = await getAllTrips(2, 5);

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination.page).toBeGreaterThan(0);
    expect(result.pagination.totalItems).toBeGreaterThan(0);
  });

  it("should filter trips by category", async () => {
    const result = await getAllTrips(1, 10, { category: "City" });

    expect(result.data.length).toBe(2);
    expect(result.data.every((trip) => trip.category === "City")).toBe(true);
  });

  it("should filter trips by destination", async () => {
    const result = await getAllTrips(1, 10, { destination: "Paris" });

    expect(result.data.length).toBe(1);
    expect(result.data[0].destination).toContain("Paris");
  });

  it("should filter trips by budget range", async () => {
    const result = await getAllTrips(1, 10, {
      budgetMin: 1000,
      budgetMax: 2500,
    });

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.every(
        (trip) => Number(trip.budget) >= 1000 && Number(trip.budget) <= 2500
      )
    ).toBe(true);
  });

  it("should return one trip by id with expenses", async () => {
    const trip = await getTripById(firstTripId);

    expect(trip).toBeDefined();
    expect(trip.id).toBe(firstTripId);
    expect(trip.tripName).toBe("Summer Beach Escape");
    expect(trip.expenses.length).toBe(3);
  });

  it("should return null for missing trip", async () => {
    const trip = await getTripById(999999);
    expect(trip).toBeNull();
  });

  it("should create a new trip and persist it in DB", async () => {
    const createdTrip = await createTrip({
      tripName: "Barcelona Getaway",
      destination: "Barcelona, Spain",
      startDate: "2026-07-10",
      endDate: "2026-07-15",
      category: "City",
      budget: "1500",
      spent: "500",
      collaborators: "Ana",
      packingList: "passport, charger",
    });

    expect(createdTrip.id).toBeDefined();
    expect(createdTrip.tripName).toBe("Barcelona Getaway");

    const dbTrip = await Trip.findByPk(createdTrip.id);
    expect(dbTrip).not.toBeNull();
    expect(dbTrip.tripName).toBe("Barcelona Getaway");
  });

  it("should update an existing trip", async () => {
    const updatedTrip = await updateTrip(firstTripId, {
      tripName: "Updated Beach Escape",
      destination: "Bali, Indonesia",
      startDate: "2026-06-15",
      endDate: "2026-06-26",
      category: "Beach",
      budget: "2500",
      spent: "1600",
      collaborators: "Sarah",
      packingList: "swimsuit, charger",
    });

    expect(updatedTrip.tripName).toBe("Updated Beach Escape");
    expect(updatedTrip.endDate).toBe("2026-06-26");
  });

  it("should return null when updating missing trip", async () => {
    const result = await updateTrip(999999, {
      tripName: "Missing",
      destination: "Nowhere",
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      category: "City",
      budget: "100",
      spent: "10",
    });

    expect(result).toBeNull();
  });

  it("should delete an existing trip from DB", async () => {
    const deletedTrip = await deleteTrip(firstTripId);

    expect(deletedTrip).toBeDefined();
    expect(deletedTrip.id).toBe(firstTripId);

    const tripAfterDelete = await getTripById(firstTripId);
    expect(tripAfterDelete).toBeNull();
  });

  it("should return null when deleting missing trip", async () => {
    const result = await deleteTrip(999999);
    expect(result).toBeNull();
  });

  it("should return trip statistics", async () => {
    const stats = await getTripStatistics();

    expect(stats.totalTrips).toBe(7);
    expect(stats.totalBudget).toBeGreaterThan(0);
    expect(stats.totalSpent).toBeGreaterThan(0);
    expect(stats.averageTripSpending).toBeGreaterThan(0);
    expect(stats.categoryCounts.City).toBe(2);
    expect(stats.budgetBreakdownByTrip.length).toBe(7);
  });

  it("should return expenses for a trip", async () => {
    const expenses = await getTripExpenses(firstTripId);

    expect(expenses.length).toBe(3);
    expect(expenses[0].tripId).toBe(firstTripId);
  });

  it("should return null for expenses of missing trip", async () => {
    const result = await getTripExpenses(999999);
    expect(result).toBeNull();
  });

  it("should add expense to trip and persist it", async () => {
    const expense = await addExpenseToTrip(firstTripId, {
      title: "Taxi",
      amount: "40",
      category: "Transport",
    });

    expect(expense.id).toBeDefined();
    expect(expense.title).toBe("Taxi");

    const dbExpense = await Expense.findByPk(expense.id);
    expect(dbExpense).not.toBeNull();
    expect(dbExpense.tripId).toBe(firstTripId);
  });

  it("should return null when adding expense to missing trip", async () => {
    const result = await addExpenseToTrip(999999, {
      title: "Taxi",
      amount: "40",
      category: "Transport",
    });

    expect(result).toBeNull();
  });

  it("should update expense", async () => {
    const updatedExpense = await updateTripExpense(firstTripId, firstExpenseId, {
      title: "Updated Flight",
      amount: "800",
      category: "Transport",
    });

    expect(updatedExpense.title).toBe("Updated Flight");
    expect(Number(updatedExpense.amount)).toBe(800);
  });

  it("should return undefined when updating missing expense", async () => {
    const result = await updateTripExpense(firstTripId, 999999, {
      title: "Missing",
      amount: "10",
      category: "Other",
    });

    expect(result).toBeUndefined();
  });

  it("should delete expense", async () => {
    const deletedExpense = await deleteTripExpense(firstTripId, firstExpenseId);

    expect(deletedExpense).toBeDefined();
    expect(deletedExpense.id).toBe(firstExpenseId);

    const dbExpense = await Expense.findByPk(firstExpenseId);
    expect(dbExpense).toBeNull();
  });

  it("should return expense statistics for a trip", async () => {
    const stats = await getTripExpenseStatistics(firstTripId);

    expect(stats.tripId).toBe(firstTripId);
    expect(stats.tripName).toBe("Summer Beach Escape");
    expect(stats.totalExpenses).toBe(3);
    expect(stats.totalExpenseAmount).toBe(1450);
    expect(stats.categoryTotals.Transport).toBe(700);
  });

  it("should return null for expense statistics of missing trip", async () => {
    const result = await getTripExpenseStatistics(999999);
    expect(result).toBeNull();
  });
});