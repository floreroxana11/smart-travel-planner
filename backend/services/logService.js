import Log from "../models/Log.js";
import ObservationList from "../models/ObservationList.js";
import User from "../models/User.js";
import { Op } from "sequelize";

export async function createLog({ userId, groupId, action, actionInfo, ipAddress }) {
  const log = await Log.create({
    userId: userId || null,
    groupId: groupId || null,
    action,
    actionInfo: actionInfo ? JSON.stringify(actionInfo) : null,
    ipAddress: ipAddress || null,
    timestamp: new Date(),
  });

  if (userId) {
    await checkForMalevolentBehaviour(userId);
  }

  return log;
}

const RULES = [
  {
    action: "LOGIN_FAILED",
    windowMinutes: 5,
    threshold: 5,
    reason: "5+ failed login attempts in 5 minutes (possible brute force)",
    trigger: "BRUTE_FORCE_LOGIN",
  },
  {
    action: "DELETE_TRIP",
    windowMinutes: 10,
    threshold: 3,
    reason: "5+ trips deleted in 10 minutes (possible mass deletion attack)",
    trigger: "MASS_DELETE",
  },
  {
    action: "CREATE_TRIP",
    windowMinutes: 5,
    threshold: 10,
    reason: "10+ trips created in 5 minutes (possible spam/flood)",
    trigger: "TRIP_SPAM",
  },
  {
    action: "UNAUTHORIZED_ACCESS",
    windowMinutes: 10,
    threshold: 20,
    reason: "20+ unauthorized access attempts in 10 minutes",
    trigger: "UNAUTHORIZED_PROBE",
  },
];

async function checkForMalevolentBehaviour(userId) {
  for (const rule of RULES) {
    const windowStart = new Date(Date.now() - rule.windowMinutes * 60 * 1000);

    const count = await Log.count({
      where: {
        userId,
        action: rule.action,
        timestamp: { [Op.gte]: windowStart },
      },
    });

    if (count >= rule.threshold) {
      await flagUser(userId, rule.reason, rule.trigger);
    }
  }
}

async function flagUser(userId, reason, triggerAction) {
  const user = await User.findByPk(userId);
  if (!user) return;

  await ObservationList.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      username: user.username,
      reason,
      triggerAction,
      flaggedAt: new Date(),
      resolved: false,
    },
  });

  console.warn(`🚨 User "${user.username}" (id: ${userId}) flagged: ${reason}`);
}

export async function getAllLogs({ limit = 100, userId, action } = {}) {
  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;

  return Log.findAll({
    where,
    order: [["timestamp", "DESC"]],
    limit,
  });
}

export async function getObservationList() {
  return ObservationList.findAll({
    order: [["flaggedAt", "DESC"]],
  });
}

export async function resolveObservation(id) {
  const entry = await ObservationList.findByPk(id);
  if (!entry) throw new Error("Observation entry not found.");
  entry.resolved = true;
  await entry.save();
  return entry;
}