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

const jsonScalar = {
  JSON: {
    __serialize(value) {
      return value;
    },
    __parseValue(value) {
      return value;
    },
    __parseLiteral(ast) {
      return null;
    },
  },
};

export const resolvers = {
  ...jsonScalar,

  Query: {
    trips: (_, { page = 1, limit = 5 }) => {
      return getAllTrips(page, limit);
    },

    trip: (_, { id }) => {
      return getTripById(id);
    },

    tripStats: () => {
      return getTripStatistics();
    },

    tripExpenses: (_, { tripId }) => {
      const expenses = getTripExpenses(tripId);
      return expenses ?? [];
    },

    tripExpenseStats: (_, { tripId }) => {
      return getTripExpenseStatistics(tripId);
    },
  },

  Mutation: {
    createTrip: (_, { input }) => {
      return createTrip(input);
    },

    updateTrip: (_, { id, input }) => {
      return updateTrip(id, input);
    },

    deleteTrip: (_, { id }) => {
      const deletedTrip = deleteTrip(id);

      if (!deletedTrip) {
        return null;
      }

      return {
        message: "Trip deleted successfully.",
        deletedTrip,
      };
    },

    addExpense: (_, { tripId, input }) => {
      return addExpenseToTrip(tripId, input);
    },

    updateExpense: (_, { tripId, expenseId, input }) => {
      return updateTripExpense(tripId, expenseId, input);
    },

    deleteExpense: (_, { tripId, expenseId }) => {
      const deletedExpense = deleteTripExpense(tripId, expenseId);

      if (deletedExpense === null || deletedExpense === undefined) {
        return null;
      }

      return {
        message: "Expense deleted successfully.",
        deletedExpense,
      };
    },
  },
};