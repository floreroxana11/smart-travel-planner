export function validateTrip(form) {
  const errors = {};

  if (!form.tripName.trim()) errors.tripName = "Trip name is required.";
  if (!form.destination.trim()) errors.destination = "Destination is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be after start date.";
  }

  if (!form.category) errors.category = "Category is required.";


  if (!form.budget.trim()) {
    errors.budget = "Budget is required.";
  } else if (isNaN(Number(form.budget)) || Number(form.budget) < 0) {
    errors.budget = "Budget must be a valid positive number.";
  }

  
  if (!form.spent?.toString().trim()) {
    errors.spent = "Spent amount is required.";
  } else if (isNaN(Number(form.spent)) || Number(form.spent) < 0) {
    errors.spent = "Spent amount must be a valid non-negative number.";
  }

  return errors;
}