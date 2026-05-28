import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DeleteModal from "./DeleteModal";

describe("DeleteModal", () => {
  it("renders modal title, message and trip name", () => {
    render(
      <DeleteModal
        tripName="Paris Trip"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Delete Trip")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/i)
    ).toBeInTheDocument();
    expect(screen.getByText('"Paris Trip"')).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone./i)
    ).toBeInTheDocument();
  });

  it("renders both action buttons", () => {
    render(
      <DeleteModal
        tripName="Rome"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn();

    render(
      <DeleteModal
        tripName="Rome"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Delete button is clicked", () => {
    const onConfirm = vi.fn();

    render(
      <DeleteModal
        tripName="Rome"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows the delete icon", () => {
    render(
      <DeleteModal
        tripName="Rome"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("🗑️")).toBeInTheDocument();
  });
});