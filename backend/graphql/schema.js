export const typeDefs = `#graphql
  type Expense {
    id: ID!
    title: String!
    amount: String!
    category: String!
  }

  type Trip {
    id: ID!
    tripName: String!
    destination: String!
    startDate: String!
    endDate: String!
    category: String!
    budget: String!
    spent: String!
    collaborators: String!
    packingList: String!
    expenses: [Expense!]!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type TripsPage {
    data: [Trip!]!
    pagination: PaginationInfo!
  }

  type BudgetBreakdownTrip {
    id: ID!
    tripName: String!
    destination: String!
    category: String!
    totalItems: Int!
    totalSpend: Float!
    budgetAllocation: Int!
    budgetStatus: String!
    totalExpenses: Int!
    totalExpenseAmount: Float!
  }

  type TripStatistics {
    totalTrips: Int!
    totalBudget: Float!
    totalSpent: Float!
    averageTripSpending: Float!
    categoryCounts: JSON!
    budgetBreakdownByTrip: [BudgetBreakdownTrip!]!
  }

  type TripExpenseStatistics {
    tripId: ID!
    tripName: String!
    totalExpenses: Int!
    totalExpenseAmount: Float!
    averageExpenseAmount: Float!
    categoryTotals: JSON!
  }

  scalar JSON

  input TripInput {
    tripName: String!
    destination: String!
    startDate: String!
    endDate: String!
    category: String!
    budget: String!
    spent: String!
    collaborators: String
    packingList: String
  }

  input ExpenseInput {
    title: String!
    amount: String!
    category: String!
  }

  type DeleteTripResponse {
    message: String!
    deletedTrip: Trip!
  }

  type DeleteExpenseResponse {
    message: String!
    deletedExpense: Expense!
  }

  type Query {
    trips(page: Int, limit: Int): TripsPage!
    trip(id: ID!): Trip
    tripStats: TripStatistics!
    tripExpenses(tripId: ID!): [Expense!]!
    tripExpenseStats(tripId: ID!): TripExpenseStatistics
  }

  type Mutation {
    createTrip(input: TripInput!): Trip!
    updateTrip(id: ID!, input: TripInput!): Trip
    deleteTrip(id: ID!): DeleteTripResponse

    addExpense(tripId: ID!, input: ExpenseInput!): Expense
    updateExpense(tripId: ID!, expenseId: ID!, input: ExpenseInput!): Expense
    deleteExpense(tripId: ID!, expenseId: ID!): DeleteExpenseResponse
  }
`;