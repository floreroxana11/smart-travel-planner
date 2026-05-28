import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DetailPage from "./DetailPage";

describe("DetailPage", () => {
  const trip = {
    tripName: "Paris Getaway",
    destination: "Paris",
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    category: "City Break",
    budget: 2500,
    collaborators: "Ana, Maria",
    packingList: "Passport, Clothes, Charger",
  };

  it("renders trip main details", () => {
    render(<DetailPage trip={trip} onBack={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText("Trip Details")).toBeInTheDocument();
    expect(screen.getByText("Paris Getaway")).toBeInTheDocument();
    expect(screen.getByText("📍 Paris")).toBeInTheDocument();
    expect(screen.getByText("$2,500")).toBeInTheDocument();
    expect(screen.getByText("Ana, Maria")).toBeInTheDocument();
    expect(
      screen.getByText("Passport, Clothes, Charger")
    ).toBeInTheDocument();
  });

  it("renders formatted duration", () => {
    render(<DetailPage trip={trip} onBack={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText("5 days")).toBeInTheDocument();
  });

  it("calls onBack when top back button is clicked", () => {
    const onBack = vi.fn();

    render(<DetailPage trip={trip} onBack={onBack} onEdit={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: /back/i })[0]);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when bottom back button is clicked", () => {
    const onBack = vi.fn();

    render(<DetailPage trip={trip} onBack={onBack} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /back to trips/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit with trip when Edit Trip button is clicked", () => {
    const onEdit = vi.fn();

    render(<DetailPage trip={trip} onBack={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: /edit trip/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(trip);
  });

  it("shows collaborators and packing list only when they exist", () => {
    const tripWithoutOptionalFields = {
      ...trip,
      collaborators: "",
      packingList: "",
    };

    render(
      <DetailPage
        trip={tripWithoutOptionalFields}
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.queryByText("Collaborators")).not.toBeInTheDocument();
    expect(screen.queryByText("Packing List")).not.toBeInTheDocument();
  });

  it('shows "—" when dates are missing', () => {
    const tripWithoutDates = {
      ...trip,
      startDate: "",
      endDate: "",
    };

    render(
      <DetailPage trip={tripWithoutDates} onBack={vi.fn()} onEdit={vi.fn()} />
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});