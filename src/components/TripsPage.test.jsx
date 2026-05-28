import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TripsPage from "./TripsPage";

vi.mock("../utils/helpers", () => ({
  formatDate: (date) => date,
  badgeClass: (category) => `badge-${category.toLowerCase().replace(/\s+/g, "-")}`,
}));

describe("TripsPage", () => {
  const trips = [
    {
      id: 1,
      tripName: "Summer Beach Escape",
      destination: "Bali, Indonesia",
      startDate: "2026-06-15",
      endDate: "2026-06-25",
      category: "Beach",
      budget: "2000",
    },
    {
      id: 2,
      tripName: "Alpine Adventure",
      destination: "Swiss Alps, Switzerland",
      startDate: "2026-08-17",
      endDate: "2026-08-24",
      category: "Mountain",
      budget: "3500",
    },
    {
      id: 3,
      tripName: "City Break Paris",
      destination: "Paris, France",
      startDate: "2026-09-01",
      endDate: "2026-09-07",
      category: "City",
      budget: "1800",
    },
    {
      id: 4,
      tripName: "Road Trip Italy",
      destination: "Tuscany, Italy",
      startDate: "2026-05-10",
      endDate: "2026-05-18",
      category: "Road Trip",
      budget: "2200",
    },
    {
      id: 5,
      tripName: "Cultural Tokyo Tour",
      destination: "Tokyo, Japan",
      startDate: "2026-10-05",
      endDate: "2026-10-15",
      category: "Cultural",
      budget: "3000",
    },
    {
      id: 6,
      tripName: "Desert Adventure",
      destination: "Dubai, UAE",
      startDate: "2026-11-12",
      endDate: "2026-11-20",
      category: "Adventure",
      budget: "2500",
    },
    {
      id: 7,
      tripName: "Weekend in Prague",
      destination: "Prague, Czech Republic",
      startDate: "2026-04-02",
      endDate: "2026-04-06",
      category: "City",
      budget: "900",
    },
  ];

  let onAdd;
  let onEdit;
  let onDelete;
  let onDetail;

  beforeEach(() => {
    onAdd = vi.fn();
    onEdit = vi.fn();
    onDelete = vi.fn();
    onDetail = vi.fn();
  });

  it("renders page heading and add button", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    expect(screen.getByText("My Trips")).toBeInTheDocument();
    expect(screen.getByText("Manage and organize all your travel plans")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new trip/i })).toBeInTheDocument();
  });

  it("calls onAdd when New Trip button is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /new trip/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when there are no trips", () => {
    render(
      <TripsPage
        trips={[]}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    expect(screen.getByText("No trips yet. Add your first trip!")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 to 0 of 0 trips")).toBeInTheDocument();
  });

  it("renders only first page trips initially", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    expect(screen.getByText("Summer Beach Escape")).toBeInTheDocument();
    expect(screen.getByText("Alpine Adventure")).toBeInTheDocument();
    expect(screen.getByText("City Break Paris")).toBeInTheDocument();
    expect(screen.getByText("Road Trip Italy")).toBeInTheDocument();
    expect(screen.getByText("Cultural Tokyo Tour")).toBeInTheDocument();

    expect(screen.queryByText("Desert Adventure")).not.toBeInTheDocument();
    expect(screen.queryByText("Weekend in Prague")).not.toBeInTheDocument();

    expect(screen.getByText("Showing 1 to 5 of 7 trips")).toBeInTheDocument();
  });

  it("goes to second page when page 2 is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByText("Desert Adventure")).toBeInTheDocument();
    expect(screen.getByText("Weekend in Prague")).toBeInTheDocument();
    expect(screen.queryByText("Summer Beach Escape")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 6 to 7 of 7 trips")).toBeInTheDocument();
  });

  it("next button changes the page", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "›" }));

    expect(screen.getByText("Desert Adventure")).toBeInTheDocument();
    expect(screen.getByText("Weekend in Prague")).toBeInTheDocument();
  });

  it("previous button changes back to first page", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "›" }));
    fireEvent.click(screen.getByRole("button", { name: "‹" }));

    expect(screen.getByText("Summer Beach Escape")).toBeInTheDocument();
    expect(screen.queryByText("Desert Adventure")).not.toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    expect(screen.getByRole("button", { name: "‹" })).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("button", { name: "›" })).toBeDisabled();
  });

  it("calls onDetail when a row is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByText("Summer Beach Escape"));
    expect(onDetail).toHaveBeenCalledTimes(1);
    expect(onDetail).toHaveBeenCalledWith(trips[0]);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "edit-1" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(trips[0]);
    expect(onDetail).not.toHaveBeenCalled();
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "delete-1" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(trips[0]);
    expect(onDetail).not.toHaveBeenCalled();
  });

  it("calls onDetail when eye button is clicked", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "detail-1" }));

    expect(onDetail).toHaveBeenCalledTimes(1);
    expect(onDetail).toHaveBeenCalledWith(trips[0]);
  });

  it("renders formatted budget values", () => {
    render(
      <TripsPage
        trips={trips}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    );

    expect(screen.getAllByText("$2,000")[0]).toBeInTheDocument();
    expect(screen.getAllByText("$3,500")[0]).toBeInTheDocument();
  });
});