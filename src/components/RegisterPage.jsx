import { useState } from "react";
import "./LoginPage.css";

const API_AUTH_URL = `https://${window.location.hostname}:3001/api/auth`;

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
    setGlobalError("");
  };

  const validate = () => {
    const errs = {};

    if (!form.username.trim()) {
      errs.username = "Username is required.";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    }

    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirm) {
      errs.confirm = "Passwords do not match.";
    }

    return errs;
  };

  const handleRegister = async () => {
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Could not create account.");
        return;
      }

      localStorage.setItem("auth_token", data.token);

      onRegister({
        id: data.user.id ?? data.userId,
        username: data.user.username,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
      });
    } catch (error) {
      console.error("Register failed:", error);
      setGlobalError("Could not connect to the server.");
    }
  };

  const f = (k) => `form-input${errors[k] ? " error" : ""}`;

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">✈️</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Smart Travel Planner today</p>

        {globalError && <div className="auth-global-error">{globalError}</div>}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className={f("username")}
            placeholder="mariaioana"
            value={form.username}
            onChange={set("username")}
          />
          {errors.username && <span className="form-error">{errors.username}</span>}
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label">Email</label>
          <input
            className={f("email")}
            type="email"
            placeholder="mariaioana@gmail.com"
            value={form.email}
            onChange={set("email")}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label">Password</label>
          <input
            className={f("password")}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label">Confirm Password</label>
          <input
            className={f("confirm")}
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set("confirm")}
          />
          {errors.confirm && <span className="form-error">{errors.confirm}</span>}
        </div>

        <button
          className="btn btn-primary auth-btn"
          onClick={handleRegister}
          style={{ marginTop: 24 }}
        >
          Create Account
        </button>

        <div className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <button className="auth-link" onClick={onGoLogin}>
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}