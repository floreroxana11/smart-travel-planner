import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("shows validation errors when fields are empty", async () => {
    render(<RegisterPage onRegister={vi.fn()} onGoLogin={vi.fn()} />);

    fireEvent.click(screen.getByText("Create Account"));

    expect(await screen.findByText("Username is required.")).toBeInTheDocument();
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<RegisterPage onRegister={vi.fn()} onGoLogin={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("mariaioana"), {
      target: { value: "maria" },
    });

    fireEvent.change(screen.getByPlaceholderText("mariaioana@gmail.com"), {
      target: { value: "maria@test.com" },
    });

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");

    fireEvent.change(passwordInputs[0], {
      target: { value: "password123" },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: "different123" },
    });

    fireEvent.click(screen.getByText("Create Account"));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("sends register request and saves token", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "register-token",
        user: {
          id: 10,
          username: "maria",
          email: "maria@test.com",
          role: { name: "user", permissions: ["USER"] },
        },
      }),
    });

    const onRegister = vi.fn();

    render(<RegisterPage onRegister={onRegister} onGoLogin={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("mariaioana"), {
      target: { value: "maria" },
    });

    fireEvent.change(screen.getByPlaceholderText("mariaioana@gmail.com"), {
      target: { value: "maria@test.com" },
    });

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");

    fireEvent.change(passwordInputs[0], {
      target: { value: "password123" },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(localStorage.getItem("auth_token")).toBe("register-token");
      expect(onRegister).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/register"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows error when password is too short", async () => {
  render(<RegisterPage onRegister={vi.fn()} onGoLogin={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("mariaioana"), {
    target: { value: "maria" },
  });

  fireEvent.change(screen.getByPlaceholderText("mariaioana@gmail.com"), {
    target: { value: "maria@test.com" },
  });

  const passwordInputs = screen.getAllByPlaceholderText("••••••••");

  fireEvent.change(passwordInputs[0], {
    target: { value: "123" },
  });

  fireEvent.change(passwordInputs[1], {
    target: { value: "123" },
  });

  fireEvent.click(screen.getByText("Create Account"));

  expect(await screen.findByText("Password must be at least 6 characters.")).toBeInTheDocument();
});

it("shows backend error when username or email already exists", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Username or email already taken." }),
  });

  render(<RegisterPage onRegister={vi.fn()} onGoLogin={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("mariaioana"), {
    target: { value: "maria" },
  });

  fireEvent.change(screen.getByPlaceholderText("mariaioana@gmail.com"), {
    target: { value: "maria@test.com" },
  });

  const passwordInputs = screen.getAllByPlaceholderText("••••••••");

  fireEvent.change(passwordInputs[0], {
    target: { value: "password123" },
  });

  fireEvent.change(passwordInputs[1], {
    target: { value: "password123" },
  });

  fireEvent.click(screen.getByText("Create Account"));

  expect(await screen.findByText("Username or email already taken.")).toBeInTheDocument();
});

it("calls onGoLogin when Log In link is clicked", () => {
  const onGoLogin = vi.fn();

  render(<RegisterPage onRegister={vi.fn()} onGoLogin={onGoLogin} />);

  fireEvent.click(screen.getByText("Log In"));

  expect(onGoLogin).toHaveBeenCalled();
});
});