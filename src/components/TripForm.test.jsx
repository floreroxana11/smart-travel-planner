import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TripForm from "./TripForm";

vi.mock("../utils/validation", () => ({
  validateTrip: vi.fn(),
}));

import { validateTrip } from "../utils/validation";

describe("TripForm", () => {
  const validTrip = {
    tripName: "Paris Trip",
    destination: "Paris",
    startDate: "2026-06-10",
    endDate: "2026-06-15",
    category: "City",
    budget: "1500",
    spent: "500",
    collaborators: "Ana",
    packingList: "passport, charger",
  };

  beforeEach(() => {
    validateTrip.mockReset();
  });

  it("renders form fields and title in add mode", () => {
    validateTrip.mockReturnValue({});

    render(<TripForm title="Add New Trip" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/add new trip/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter trip name/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter destination/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter budget/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter collaborators/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter items/i)[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add trip/i }).at(-1)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /cancel/i }).at(-1)).toBeInTheDocument();
  });

  it("renders initial values in edit mode", () => {
    validateTrip.mockReturnValue({});

    render(<TripForm initial={validTrip} title="Edit Trip" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByDisplayValue("Paris Trip")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Paris")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-06-10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-06-15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("passport, charger")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /edit trip/i })[0]).toBeInTheDocument();
  });

  it("updates input values when user types", () => {
    validateTrip.mockReturnValue({});

    render(<TripForm title="Add New Trip" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const tripNameInput = screen.getAllByPlaceholderText(/enter trip name/i)[0];
    const destinationInput = screen.getAllByPlaceholderText(/enter destination/i)[0];
    const budgetInput = screen.getAllByPlaceholderText(/enter budget/i)[0];

    fireEvent.change(tripNameInput, { target: { value: "Rome Trip" } });
    fireEvent.change(destinationInput, { target: { value: "Rome" } });
    fireEvent.change(budgetInput, { target: { value: "1200" } });

    expect(tripNameInput.value).toBe("Rome Trip");
    expect(destinationInput.value).toBe("Rome");
    expect(budgetInput.value).toBe("1200");
  });

  it("calls onCancel when Cancel button is clicked", () => {
    validateTrip.mockReturnValue({});
    const onCancel = vi.fn();

    render(<TripForm title="Add New Trip" onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i }).at(-1));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls validateTrip and onSubmit when form is valid", () => {
    validateTrip.mockReturnValue({});
    const onSubmit = vi.fn();

    const { container } = render(
      <TripForm title="Add New Trip" onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    fireEvent.change(screen.getAllByPlaceholderText(/enter trip name/i)[0], {
      target: { value: "Rome Trip" },
    });

    fireEvent.change(screen.getAllByPlaceholderText(/enter destination/i)[0], {
      target: { value: "Rome" },
    });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: "2026-07-01" } });
    fireEvent.change(dateInputs[1], { target: { value: "2026-07-05" } });

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "City" },
    });

    fireEvent.change(screen.getAllByPlaceholderText(/enter budget/i)[0], {
      target: { value: "1000" },
    });

    fireEvent.change(screen.getAllByPlaceholderText(/enter collaborators/i)[0], {
      target: { value: "Ana" },
    });

    fireEvent.change(screen.getAllByPlaceholderText(/enter items/i)[0], {
      target: { value: "passport, charger" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: /add trip/i }).at(-1));

    expect(validateTrip).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      tripName: "Rome Trip",
      destination: "Rome",
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      category: "City",
      budget: "1000",
      spent: "",
      collaborators: "Ana",
      packingList: "passport, charger",
    });
  });

  it("does not call onSubmit when validation fails", () => {
    validateTrip.mockReturnValue({
      tripName: "Trip name is required",
      destination: "Destination is required",
    });

    const onSubmit = vi.fn();

    render(<TripForm title="Add New Trip" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: /add trip/i }).at(-1));

    expect(validateTrip).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Trip name is required")).toBeInTheDocument();
    expect(screen.getByText("Destination is required")).toBeInTheDocument();
  });

  it("shows correct button text in add mode and edit mode", () => {
    validateTrip.mockReturnValue({});

    const { rerender } = render(
      <TripForm title="Add New Trip" onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getAllByRole("button", { name: /add trip/i }).at(-1)).toBeInTheDocument();

    rerender(<TripForm initial={validTrip} title="Edit Trip" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /edit trip/i })[0]).toBeInTheDocument();
  });
});