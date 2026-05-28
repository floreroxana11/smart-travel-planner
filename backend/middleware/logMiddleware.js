import { createLog } from "../services/logService.js";

// Mapare route → action name
const ACTION_MAP = {
  "GET /api/trips":           "VIEW_TRIPS",
  "POST /api/trips":          "CREATE_TRIP",
  "PUT /api/trips":           "EDIT_TRIP",
  "DELETE /api/trips":        "DELETE_TRIP",
  "GET /api/trips/:id":       "VIEW_TRIP_DETAIL",
  "POST /api/auth/login":     "LOGIN",
  "POST /api/auth/register":  "REGISTER",
  "GET /api/auth/users":      "VIEW_ALL_USERS",
  "GET /api/chat":            "VIEW_CHAT",
};

function resolveAction(method, path) {
  if (method === "GET" && path.includes("/observation-list")) {
    return "VIEW_OBSERVATION_LIST";
  }

  if (method === "PATCH" && path.includes("/observation-list")) {
    return "RESOLVE_OBSERVATION";
  }

  if (method === "GET" && path.includes("/logs")) {
    return "VIEW_AUDIT_LOGS";
  }

  if (method === "GET" && path.includes("/messages")) {
    return "VIEW_CHAT_HISTORY";
  }

  if (method === "DELETE" && path.match(/\/trips\/\d+$/)) return "DELETE_TRIP";
  if (method === "PUT" && path.match(/\/trips\/\d+$/)) return "EDIT_TRIP";
  if (method === "GET" && path.match(/\/trips\/\d+$/)) return "VIEW_TRIP_DETAIL";

  if (method === "GET" && path.includes("/trips")) return "VIEW_TRIPS";
  if (method === "POST" && path.includes("/trips")) return "CREATE_TRIP";

  if (method === "POST" && path.includes("/auth/login")) return "LOGIN";
  if (method === "POST" && path.includes("/auth/register")) return "REGISTER";
  if (method === "GET" && path.includes("/auth/users")) return "VIEW_ALL_USERS";

  if (method === "GET" && path.includes("/chat")) return "VIEW_CHAT";

  return `${method} ${path}`;
}

export function auditLogger(req, res, next) {
  const originalSend = res.send.bind(res);

  res.send = function (body) {
    const userId  = req.user?.id || null;
    const groupId = req.user?.role?.name?.toUpperCase() || null;
    const action  = resolveAction(req.method, req.path);
    const ip      = req.ip || req.headers["x-forwarded-for"] || null;

    // Log login failed separat
    if (action === "LOGIN" && res.statusCode === 401) {
      createLog({
        userId: null,
        groupId: null,
        action: "LOGIN_FAILED",
        actionInfo: { username: req.body?.username, ip },
        ipAddress: ip,
      }).catch(console.error);
    }

    // Log unauthorized access attempts
    if (res.statusCode === 403) {
      createLog({
        userId,
        groupId,
        action: "UNAUTHORIZED_ACCESS",
        actionInfo: { path: req.path, method: req.method },
        ipAddress: ip,
      }).catch(console.error);
    }

    // Log orice alta actiune dacă e user logat
    if (userId && res.statusCode < 400) {
      createLog({
        userId,
        groupId,
        action,
        actionInfo: { path: req.path, method: req.method, status: res.statusCode },
        ipAddress: ip,
      }).catch(console.error);
    }

    return originalSend(body);
  };

  next();
}