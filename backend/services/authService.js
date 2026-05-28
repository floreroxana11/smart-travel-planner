import bcrypt from "bcrypt";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const SALT_ROUNDS = 10;

export async function registerUser({ username, email, password, roleName = "user" }) {
  
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) throw new Error(`Role '${roleName}' does not exist.`);

  
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ username, email, passwordHash, roleId: role.id });
  return getUserWithRole(user.id);
}

export async function loginUser({ username, password }) {
  const user = await User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "permissions" }],
      },
    ],
  });

  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
    },
  };
}

export async function getUserWithRole(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "permissions" }],
      },
    ],
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
    },
  };
}


export async function getAllUsers() {
  const users = await User.findAll({
    include: [
      {
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "permissions" }],
      },
    ],
  });

  return users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
    },
  }));
}

export async function getAllRoles() {
  return Role.findAll({
    include: [{ model: Permission, as: "permissions" }],
  });
}


export async function getAllPermissions() {
  return Permission.findAll();
}

// Store temporar pentru coduri OTP (in-memory, suficient pentru lab)
const otpStore = new Map(); // { userId: { code, expiresAt } }

export function generateOtp(userId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 cifre
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute
  otpStore.set(userId, { code, expiresAt });
  console.log(`[OTP for user ${userId}]: ${code}`); // in lab il vezi in terminal
  return code;
}

export function verifyOtp(userId, code) {
  const entry = otpStore.get(userId);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { otpStore.delete(userId); return false; }
  if (entry.code !== code) return false;
  otpStore.delete(userId);
  return true;
}

const resetStore = new Map(); // { email: { code, expiresAt } }

export async function initiatePasswordReset(email) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("Email not found.");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minute

  resetStore.set(email, {
    code,
    expiresAt,
    userId: user.id,
  });

  console.log(`[RESET CODE for ${email}]: ${code}`);

  return code;
}

export async function confirmPasswordReset(email, code, newPassword) {
  const entry = resetStore.get(email);
  if (!entry) throw new Error("No reset request for this email.");
  if (Date.now() > entry.expiresAt) { resetStore.delete(email); throw new Error("Code expired."); }
  if (entry.code !== code) throw new Error("Invalid code.");
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.update({ passwordHash }, { where: { id: entry.userId } });
  resetStore.delete(email);
  return true;
}