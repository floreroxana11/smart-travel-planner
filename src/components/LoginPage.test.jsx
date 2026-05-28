import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("shows validation errors when fields are empty", async () => {
    render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

    fireEvent.click(screen.getByText("Continue"));

    expect(await screen.findByText("Username is required.")).toBeInTheDocument();
    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
  });

  it("does login step1 and shows OTP screen", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 1, devOtp: "123456" }),
    });

    render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("admin"), {
      target: { value: "admin" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "admin123" },
    });

    fireEvent.click(screen.getByText("Continue"));

    expect(await screen.findByText("Enter OTP")).toBeInTheDocument();
    expect(await screen.findByText("OTP code: 123456")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login/step1"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does login step2 and saves token", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ userId: 1, devOtp: "123456" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "fake-token",
          user: {
            id: 1,
            username: "admin",
            email: "admin@travel.com",
            role: { name: "admin", permissions: ["ADMIN"] },
          },
        }),
      });

    const onLogin = vi.fn();

    render(<LoginPage onLogin={onLogin} onGoRegister={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("admin"), {
      target: { value: "admin" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "admin123" },
    });

    fireEvent.click(screen.getByText("Continue"));

    await screen.findByText("Enter OTP");

    fireEvent.change(screen.getByPlaceholderText("123456"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(localStorage.getItem("auth_token")).toBe("fake-token");
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it("shows error when login step1 credentials are invalid", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Invalid username or password." }),
  });

  render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("admin"), {
    target: { value: "wronguser" },
  });

  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "wrongpass" },
  });

  fireEvent.click(screen.getByText("Continue"));

  expect(await screen.findByText("Invalid username or password.")).toBeInTheDocument();
});

it("shows error when OTP is wrong", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 1, devOtp: "123456" }),
    })
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid or expired OTP." }),
    });

  render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("admin"), {
    target: { value: "admin" },
  });

  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "admin123" },
  });

  fireEvent.click(screen.getByText("Continue"));

  await screen.findByText("Enter OTP");

  fireEvent.change(screen.getByPlaceholderText("123456"), {
    target: { value: "000000" },
  });

  fireEvent.click(screen.getByText("Log In"));

  expect(await screen.findByText("Invalid or expired OTP.")).toBeInTheDocument();
});

it("requires OTP before login step2", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ userId: 1, devOtp: "123456" }),
  });

  render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("admin"), {
    target: { value: "admin" },
  });

  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "admin123" },
  });

  fireEvent.click(screen.getByText("Continue"));

  await screen.findByText("Enter OTP");

  fireEvent.click(screen.getByText("Log In"));

  expect(await screen.findByText("OTP is required.")).toBeInTheDocument();
});

it("goes back from OTP screen to login screen", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ userId: 1, devOtp: "123456" }),
  });

  render(<LoginPage onLogin={vi.fn()} onGoRegister={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("admin"), {
    target: { value: "admin" },
  });

  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "admin123" },
  });

  fireEvent.click(screen.getByText("Continue"));

  await screen.findByText("Enter OTP");

  fireEvent.click(screen.getByText("← Back"));

  expect(await screen.findByText("Welcome back")).toBeInTheDocument();
  expect(screen.queryByText("OTP code: 123456")).not.toBeInTheDocument();
});
});