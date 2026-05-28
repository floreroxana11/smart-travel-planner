import { describe, it, expect } from "vitest";
import { validateTrip } from "../validators/tripValidator.js";

describe("validateTrip", () => {
  it("should return no errors for a valid trip", () => {
    const validTrip = {
      tripName: "Barcelona Getaway",
      destination: "Barcelona, Spain",
      startDate: "2026-07-10",
      endDate: "2026-07-15",
      category: "City",
      budget: "1500",
      spent: "500",
      collaborators: "",
      packingList: "passport, charger",
    };

    const errors = validateTrip(validTrip);

    expect(errors).toEqual({});
  });

  it("should return errors for missing required fields", () => {
    const invalidTrip = {
      tripName: "",
      destination: "",
      startDate: "",
      endDate: "",
      category: "",
      budget: "",
      spent: "",
    };

    const errors = validateTrip(invalidTrip);

    expect(errors.tripName).toBeDefined();
    expect(errors.destination).toBeDefined();
    expect(errors.startDate).toBeDefined();
    expect(errors.endDate).toBeDefined();
    expect(errors.category).toBeDefined();
    expect(errors.budget).toBeDefined();
    expect(errors.spent).toBeDefined();
  });

  it("should return an error when end date is before start date", () => {
    const invalidTrip = {
      tripName: "Test Trip",
      destination: "Rome",
      startDate: "2026-09-10",
      endDate: "2026-09-05",
      category: "City",
      budget: "1000",
      spent: "300",
    };

    const errors = validateTrip(invalidTrip);

    expect(errors.endDate).toBe("End date must be after start date.");
  });

  it("should return an error when category is invalid", () => {
    const invalidTrip = {
      tripName: "Test Trip",
      destination: "Rome",
      startDate: "2026-09-10",
      endDate: "2026-09-15",
      category: "InvalidCategory",
      budget: "1000",
      spent: "300",
    };

    const errors = validateTrip(invalidTrip);

    expect(errors.category).toBe("Category is invalid.");
  });

  it("should return an error when budget or spent are negative", () => {
    const invalidTrip = {
      tripName: "Test Trip",
      destination: "Rome",
      startDate: "2026-09-10",
      endDate: "2026-09-15",
      category: "City",
      budget: "-100",
      spent: "-5",
    };

    const errors = validateTrip(invalidTrip);

    expect(errors.budget).toBeDefined();
    expect(errors.spent).toBeDefined();
  });
});