const ALLOWED_CATEGORIES = [
  "Beach",
  "Mountain",
  "City",
  "Adventure",
  "Cultural",
  "Road Trip",
  "Other",
];

export function validateTrip(trip) {
  const errors = {};

  if (!trip.tripName || !trip.tripName.trim()) {
    errors.tripName = "Trip name is required.";
  }

  if (!trip.destination || !trip.destination.trim()) {
    errors.destination = "Destination is required.";
  }

  if (!trip.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (!trip.endDate) {
    errors.endDate = "End date is required.";
  }

  if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) {
    errors.endDate = "End date must be after start date.";
  }

  if (!trip.category) {
    errors.category = "Category is required.";
  } else if (!ALLOWED_CATEGORIES.includes(trip.category)) {
    errors.category = "Category is invalid.";
  }

  if (trip.budget === undefined || trip.budget === null || trip.budget.toString().trim() === "") {
    errors.budget = "Budget is required.";
  } else if (isNaN(Number(trip.budget)) || Number(trip.budget) < 0) {
    errors.budget = "Budget must be a valid non-negative number.";
  }

  if (trip.spent === undefined || trip.spent === null || trip.spent.toString().trim() === "") {
    errors.spent = "Spent amount is required.";
  } else if (isNaN(Number(trip.spent)) || Number(trip.spent) < 0) {
    errors.spent = "Spent amount must be a valid non-negative number.";
  }

  return errors;
}