import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getAllRoles,
  getAllPermissions,
  getUserWithRole,
  generateOtp,
  verifyOtp,
  initiatePasswordReset,
  confirmPasswordReset
} from "../services/authService.js";
import { requireAuth, requirePermission } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xK#9mP2qL7vN3wR8";
const JWT_EXPIRES = "30m"; // expira în 30 minute (inactivitate)

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, roleName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "username, email and password are required.",
    });
  }

  try {
    const user = await registerUser({
      username,
      email,
      password,
      roleName: roleName || "user",
    });

    const fullUser = await getUserWithRole(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        permissions: user.role.permissions  // array cu permisiunile
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: fullUser,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Username or email already taken.",
      });
    }

    res.status(400).json({ message: err.message });
  }
});

router.post("/login/step1", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username and password are required.",
    });
  }

  const user = await loginUser({ username, password });

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password.",
    });
  }

  const otp = generateOtp(user.id);

  res.json({
    message: "OTP generated",
    userId: user.id,
    devOtp: otp,
  });
});

// Pasul 2: verifica OTP si da token
router.post("/login/step2", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp)
    return res.status(400).json({ message: "userId and otp are required." });

  const valid = verifyOtp(userId, otp);
  if (!valid) return res.status(401).json({ message: "Invalid or expired OTP." });

  const user = await getUserWithRole(userId);
  const token = jwt.sign(
    { userId: user.id, role: user.role.name, permissions: user.role.permissions },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.status(200).json({ message: "Login successful.", token, user });
});

router.get("/profile", requireAuth, async (req, res) => {
  res.status(200).json(req.user);
});

router.get("/users", requirePermission("ADMIN"), async (req, res) => {
  const users = await getAllUsers();
  res.status(200).json(users);
});

router.get("/roles", requireAuth, async (req, res) => {
  const roles = await getAllRoles();
  res.status(200).json(roles);
});

router.get("/permissions", requireAuth, async (req, res) => {
  const perms = await getAllPermissions();
  res.status(200).json(perms);
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email is required.",
    });
  }

  try {
    const code = await initiatePasswordReset(email);

    res.json({
      message: "Reset code generated",
      devResetCode: code,
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword)
    return res.status(400).json({ message: "email, code and newPassword are required." });
  try {
    await confirmPasswordReset(email, code, newPassword);
    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
