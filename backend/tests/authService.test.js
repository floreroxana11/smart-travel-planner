import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  loginUser,
  getUserWithRole,
  generateOtp,
  verifyOtp,
  initiatePasswordReset,
  confirmPasswordReset,
} from "../services/authService.js";

import { sequelize } from "../database/init.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xK#9mP2qL7vN3wR8";

const UNIQUE = Date.now();

const TEST_USER = {
  username: `testuser_${UNIQUE}`,
  email: `testuser_${UNIQUE}@test.com`,
  password: "parola123",
};

let createdUser;

beforeAll(async () => {
  await sequelize.sync();

  const [role] = await Role.findOrCreate({
    where: { name: "user" },
    defaults: {
      description: "Normal user with restricted permissions",
    },
  });

  await User.destroy({
    where: {
      username: TEST_USER.username,
    },
  });

  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

  createdUser = await User.create({
    username: TEST_USER.username,
    email: TEST_USER.email,
    passwordHash,
    roleId: role.id,
  });
});

afterAll(async () => {
  await User.destroy({
    where: {
      username: TEST_USER.username,
    },
  });

  await sequelize.close();
});

describe("authService — loginUser", () => {
  it("returneaza user cu rol la credentiale corecte", async () => {
    const user = await loginUser({
      username: TEST_USER.username,
      password: TEST_USER.password,
    });

    expect(user).not.toBeNull();
    expect(user.username).toBe(TEST_USER.username);
    expect(user.role).toBeDefined();
    expect(Array.isArray(user.role.permissions)).toBe(true);
  });

  it("returneaza null la parola gresita", async () => {
    const user = await loginUser({
      username: TEST_USER.username,
      password: "parolaGresita",
    });

    expect(user).toBeNull();
  });

  it("returneaza null la username inexistent", async () => {
    const user = await loginUser({
      username: "userCareNuExista",
      password: "orice",
    });

    expect(user).toBeNull();
  });
});

describe("JWT — generare si verificare token", () => {
  it("token-ul generat la login contine userId, role si permissions", async () => {
    const user = await loginUser({
      username: TEST_USER.username,
      password: TEST_USER.password,
    });

    expect(user).not.toBeNull();

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        permissions: user.role.permissions,
      },
      JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    const decoded = jwt.verify(token, JWT_SECRET);

    expect(decoded.userId).toBe(user.id);
    expect(decoded.role).toBe(user.role.name);
    expect(Array.isArray(decoded.permissions)).toBe(true);
  });

  it("token cu secret gresit este respins", () => {
    const token = jwt.sign(
      {
        userId: 1,
        role: "user",
      },
      "secretGresit",
      {
        expiresIn: "30m",
      }
    );

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow();
  });

  it("token expirat este respins", async () => {
    const token = jwt.sign(
      {
        userId: 1,
        role: "user",
      },
      JWT_SECRET,
      {
        expiresIn: "0s",
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow(/expired/);
  });
});

describe("authService — getUserWithRole", () => {
  it("returneaza userul cu rol dupa id", async () => {
    const user = await getUserWithRole(createdUser.id);

    expect(user).not.toBeNull();
    expect(user.id).toBe(createdUser.id);
    expect(user.role).toBeDefined();
  });

  it("returneaza null pentru id inexistent", async () => {
    const user = await getUserWithRole(999999);

    expect(user).toBeNull();
  });
});

describe("OTP authentication", () => {
  it("genereaza OTP de 6 cifre si il valideaza corect", () => {
    const otp = generateOtp(createdUser.id);

    expect(otp).toMatch(/^\d{6}$/);
    expect(verifyOtp(createdUser.id, otp)).toBe(true);
  });

  it("respinge OTP gresit", () => {
    generateOtp(createdUser.id);

    expect(verifyOtp(createdUser.id, "000000")).toBe(false);
  });

  it("nu permite refolosirea aceluiasi OTP dupa validare", () => {
    const otp = generateOtp(createdUser.id);

    expect(verifyOtp(createdUser.id, otp)).toBe(true);
    expect(verifyOtp(createdUser.id, otp)).toBe(false);
  });
});

describe("Password recovery", () => {
  it("genereaza cod de reset pentru email existent", async () => {
    const code = await initiatePasswordReset(TEST_USER.email);

    expect(code).toMatch(/^\d{6}$/);
  });

  it("arunca eroare pentru email inexistent", async () => {
    await expect(
      initiatePasswordReset("email_inexistent@test.com")
    ).rejects.toThrow("Email not found.");
  });

  it("reseteaza parola si permite login cu parola noua", async () => {
    const code = await initiatePasswordReset(TEST_USER.email);

    await confirmPasswordReset(TEST_USER.email, code, "parolaNoua123");

    const user = await loginUser({
      username: TEST_USER.username,
      password: "parolaNoua123",
    });

    expect(user).not.toBeNull();
    expect(user.username).toBe(TEST_USER.username);
  });

  it("respinge cod de reset gresit", async () => {
    const code = await initiatePasswordReset(TEST_USER.email);

    await expect(
      confirmPasswordReset(TEST_USER.email, "000000", "altaParola123")
    ).rejects.toThrow("Invalid code.");

    expect(code).toMatch(/^\d{6}$/);
  });
});