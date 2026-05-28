import { useState } from "react";
import "./LoginPage.css";

const API_AUTH_URL = `https://${window.location.hostname}:3001/api/auth`;

export default function LoginPage({ onLogin, onGoRegister }) {
  const [step, setStep] = useState(1); // 1 = credentiale, 2 = OTP, 3 = forgot password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  // Forgot password state
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpStep, setFpStep] = useState(1); // 1=email, 2=code+newpass

  // STEP 1: trimite credentialele
  const handleStep1 = async () => {
    setGlobalSuccess("");

    const errs = {};
    if (!username.trim()) errs.username = "Username is required.";
    if (!password.trim()) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/login/step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Invalid username or password.");
        return;
      }

      setUserId(data.userId);
      setGlobalError("");
      setErrors({});
      setGlobalSuccess(`OTP code: ${data.devOtp}`);
      setStep(2);
    } catch {
      setGlobalError("Could not connect to the server.");
    }
  };

  // STEP 2: trimite OTP
  const handleStep2 = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required." });
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/login/step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otp.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Invalid or expired OTP.");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      setGlobalError("");
      onLogin({
        id: data.user.id,
        username: data.user.username,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
      });
    } catch {
      setGlobalError("Could not connect to the server.");
    }
  };

  // FORGOT PASSWORD step 1: cere codul
  const handleFpSendCode = async () => {
    if (!fpEmail.trim()) {
      setErrors({ fpEmail: "Email is required." });
      return;
    }
    try {
      const response = await fetch(`${API_AUTH_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGlobalError(data.message || "Email not found.");
        return;
      }
      setGlobalError("");
      setGlobalSuccess(`Reset code: ${data.devResetCode}`);
      setFpStep(2);
    } catch {
      setGlobalError("Could not connect to the server.");
    }
  };

  // FORGOT PASSWORD step 2: reseteaza parola
  const handleFpReset = async () => {
    if (!fpCode.trim() || !fpNewPassword.trim()) {
      setErrors({ fpCode: "All fields required." });
      return;
    }
    try {
      const response = await fetch(`${API_AUTH_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fpEmail.trim(),
          code: fpCode.trim(),
          newPassword: fpNewPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGlobalError(data.message || "Reset failed.");
        return;
      }
      setGlobalError("");
      setGlobalSuccess("Password reset successfully! You can now log in.");
      setStep(1);
      setFpStep(1);
      setFpEmail(""); setFpCode(""); setFpNewPassword("");
    } catch {
      setGlobalError("Could not connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">✈️</div>

        {step === 1 && (
          <>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Smart Travel Planner</p>

            {globalError && <div className="auth-global-error">{globalError}</div>}
            {globalSuccess && <div style={{ color: "green", marginBottom: 12 }}>{globalSuccess}</div>}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className={`form-input${errors.username ? " error" : ""}`}
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors({}); setGlobalError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStep1()}
              />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Password</label>
              <input
                className={`form-input${errors.password ? " error" : ""}`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); setGlobalError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStep1()}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button className="btn btn-primary auth-btn" onClick={handleStep1} style={{ marginTop: 24 }}>
              Continue
            </button>

            <div className="auth-hint">
              Admin: <code>admin</code> / <code>admin123</code><br />
              User: <code>alice</code> / <code>user123</code>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="auth-link" onClick={() => { setStep("forgot"); setGlobalError(""); setGlobalSuccess(""); }}>
                Forgot password?
              </button>
            </div>

            <div className="auth-switch">
              Don't have an account?{" "}
              <button className="auth-link" onClick={onGoRegister}>Register</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="auth-title">Enter OTP</h1>
            <p className="auth-subtitle">Enter the 6-digit code below</p>

            {globalError && <div className="auth-global-error">{globalError}</div>}


            {globalSuccess && (
              <div style={{ color: "green", marginBottom: 12 }}>
                {globalSuccess}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <input
                className={`form-input${errors.otp ? " error" : ""}`}
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setErrors({}); setGlobalError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStep2()}
              />
              {errors.otp && <span className="form-error">{errors.otp}</span>}
            </div>

            <button className="btn btn-primary auth-btn" onClick={handleStep2} style={{ marginTop: 24 }}>
              Log In
            </button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                className="auth-link"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setUserId(null);
                  setGlobalError("");
                  setGlobalSuccess("");
                  setErrors({});
                }}
              >
                ← Back
              </button>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <h1 className="auth-title">Reset Password</h1>

            {globalError && <div className="auth-global-error">{globalError}</div>}
            {globalSuccess && <div style={{ color: "green", marginBottom: 12 }}>{globalSuccess}</div>}

            {fpStep === 1 && (
              <>
                <p className="auth-subtitle">Enter your email to receive a reset code</p>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-input${errors.fpEmail ? " error" : ""}`}
                    type="email"
                    placeholder="you@email.com"
                    value={fpEmail}
                    onChange={(e) => { setFpEmail(e.target.value); setErrors({}); }}
                  />
                  {errors.fpEmail && <span className="form-error">{errors.fpEmail}</span>}
                </div>
                <button className="btn btn-primary auth-btn" onClick={handleFpSendCode} style={{ marginTop: 24 }}>
                  Send Reset Code
                </button>
              </>
            )}

            {fpStep === 2 && (
              <>
                  <p className="auth-subtitle">Enter the reset code and your new password</p>
                <div className="form-group">
                  <label className="form-label">Reset Code</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="123456"
                    value={fpCode}
                    onChange={(e) => setFpCode(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                  />
                </div>
                {errors.fpCode && <span className="form-error">{errors.fpCode}</span>}
                <button className="btn btn-primary auth-btn" onClick={handleFpReset} style={{ marginTop: 24 }}>
                  Reset Password
                </button>
              </>
            )}

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="auth-link" onClick={() => { setStep(1); setFpStep(1); setGlobalError(""); setGlobalSuccess(""); }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}