import jwt from "jsonwebtoken";
import { getUserWithRole } from "../services/authService.js";

const JWT_SECRET = "xK#9mP2qL7vN3wR8"; 

export async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserWithRole(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid sau expirat." });
  }
}

export function requirePermission(permissionName) {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. No token." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await getUserWithRole(decoded.userId);
      if (!user) return res.status(401).json({ message: "User not found." });
      req.user = user;

      const hasPermission = user.role.permissions.includes(permissionName);
      if (!hasPermission) {
        return res.status(403).json({
          message: `Forbidden. Required: ${permissionName}`,
          yourRole: user.role.name,
        });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalid sau expirat." });
    }
  };
}

export function requireAdmin(req, res, next) {
  return requirePermission("ADMIN")(req, res, next);
}