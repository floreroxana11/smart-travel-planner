import sequelize from "./db.js";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Log from "../models/Log.js";
import ObservationList from "../models/ObservationList.js";

const PERMISSIONS = [
  { name: "ADMIN",          description: "Full admin access" },
  { name: "VIEW_TRIPS",     description: "View all trips" },
  { name: "CREATE_TRIP",    description: "Create a new trip" },
  { name: "EDIT_TRIP",      description: "Edit existing trips" },
  { name: "DELETE_TRIP",    description: "Delete trips" },
  { name: "VIEW_EXPENSES",  description: "View expenses" },
  { name: "MANAGE_EXPENSES",description: "Create/edit/delete expenses" },
  { name: "VIEW_STATS",     description: "View statistics" },
  { name: "USE_CHAT",       description: "Use the real-time chat" },
];

const ADMIN_PERMISSIONS   = PERMISSIONS.map(p => p.name);
const USER_PERMISSIONS    = ["VIEW_TRIPS", "VIEW_EXPENSES", "VIEW_STATS", "USE_CHAT"];
const EDITOR_PERMISSIONS = [
  "VIEW_TRIPS", "CREATE_TRIP", "EDIT_TRIP",
  "VIEW_EXPENSES", "MANAGE_EXPENSES", "VIEW_STATS", "USE_CHAT"
];

const TRIPS_SEED = [
  {
    tripName: "Summer Beach Escape", destination: "Bali, Indonesia",
    startDate: "2026-06-15", endDate: "2026-06-25", category: "Beach",
    budget: 2000, spent: 1450,
    collaborators: "Sarah Johnson, Emily Davis",
    packingList: "swimsuit, pyjama, sunglasses, t-shirts, charger",
    expenses: [
      { title: "Flight", amount: 700, category: "Transport" },
      { title: "Hotel",  amount: 500, category: "Accommodation" },
      { title: "Food",   amount: 250, category: "Food" },
    ],
  },
  {
    tripName: "Alpine Adventure", destination: "Swiss Alps, Switzerland",
    startDate: "2026-08-17", endDate: "2026-08-24", category: "Mountain",
    budget: 3500, spent: 3600,
    collaborators: "Frank Reynolds",
    packingList: "hiking boots, jacket, gloves, thermos, map",
    expenses: [
      { title: "Cabin",    amount: 1800, category: "Accommodation" },
      { title: "Ski Pass", amount: 900,  category: "Activities" },
      { title: "Food",     amount: 900,  category: "Food" },
    ],
  },
  {
    tripName: "City Break Paris", destination: "Paris, France",
    startDate: "2026-09-01", endDate: "2026-09-07", category: "City",
    budget: 1800, spent: 900,
    collaborators: "",
    packingList: "passport, camera, comfortable shoes, umbrella",
    expenses: [
      { title: "Train",          amount: 250, category: "Transport" },
      { title: "Hotel",          amount: 400, category: "Accommodation" },
      { title: "Museum Tickets", amount: 250, category: "Activities" },
    ],
  },
  {
    tripName: "Road Trip Italy", destination: "Tuscany, Italy",
    startDate: "2026-05-10", endDate: "2026-05-18", category: "Road Trip",
    budget: 2200, spent: 1200,
    collaborators: "Alex Popescu",
    packingList: "car charger, sunglasses, map, snacks, camera",
    expenses: [
      { title: "Fuel",   amount: 350, category: "Transport" },
      { title: "Hotel",  amount: 500, category: "Accommodation" },
      { title: "Snacks", amount: 350, category: "Food" },
    ],
  },
  {
    tripName: "Cultural Tokyo Tour", destination: "Tokyo, Japan",
    startDate: "2026-10-05", endDate: "2026-10-15", category: "Cultural",
    budget: 3000, spent: 1800,
    collaborators: "Maria Ionescu",
    packingList: "passport, adapter, camera, comfortable shoes",
    expenses: [
      { title: "Flight",         amount: 900, category: "Transport" },
      { title: "Hotel",          amount: 600, category: "Accommodation" },
      { title: "Temple Tickets", amount: 300, category: "Activities" },
    ],
  },
  {
    tripName: "Desert Adventure", destination: "Dubai, UAE",
    startDate: "2026-11-12", endDate: "2026-11-20", category: "Adventure",
    budget: 2500, spent: 950,
    collaborators: "",
    packingList: "sunscreen, hat, light clothes, water bottle",
    expenses: [
      { title: "Flight",        amount: 500, category: "Transport" },
      { title: "Desert Safari", amount: 300, category: "Activities" },
      { title: "Meals",         amount: 150, category: "Food" },
    ],
  },
  {
    tripName: "Weekend in Prague", destination: "Prague, Czech Republic",
    startDate: "2026-04-02", endDate: "2026-04-06", category: "City",
    budget: 900, spent: 350,
    collaborators: "Andrei Georgescu",
    packingList: "jacket, passport, camera, cash",
    expenses: [
      { title: "Bus",    amount: 100, category: "Transport" },
      { title: "Hostel", amount: 150, category: "Accommodation" },
      { title: "Coffee", amount: 100, category: "Food" },
    ],
  },
];

export async function initDatabase() {
  await sequelize.sync();

  for (const perm of PERMISSIONS) {
    await Permission.findOrCreate({ where: { name: perm.name }, defaults: perm });
  }

  const [adminRole] = await Role.findOrCreate({
    where: { name: "admin" },
    defaults: { name: "admin", description: "Administrator with full permissions" },
  });
  const [userRole] = await Role.findOrCreate({
    where: { name: "user" },
    defaults: { name: "user", description: "Normal user with restricted permissions" },
  });
  const [editorRole] = await Role.findOrCreate({
  where: { name: "editor" },
  defaults: { name: "editor", description: "Editor with create/edit permissions" },
});

const editorPerms = await Permission.findAll({ where: { name: EDITOR_PERMISSIONS } });
await editorRole.setPermissions(editorPerms);

  const allPerms  = await Permission.findAll({ where: { name: ADMIN_PERMISSIONS } });
  const userPerms = await Permission.findAll({ where: { name: USER_PERMISSIONS } });

  await adminRole.setPermissions(allPerms);
  await userRole.setPermissions(userPerms);

  const existingUsers = await User.count();
  if (existingUsers === 0) {
    const adminHash = await bcrypt.hash("admin123", 10);
    const userHash  = await bcrypt.hash("user123",  10);
    const editorHash = await bcrypt.hash("editor123", 10);

    await User.create({ username: "admin",   email: "admin@travel.com",  passwordHash: adminHash, roleId: adminRole.id });
    await User.create({ username: "alice",   email: "alice@travel.com",  passwordHash: userHash,  roleId: userRole.id });
    await User.create({ username: "bob",     email: "bob@travel.com",    passwordHash: userHash,  roleId: userRole.id });
    await User.create({ username: "carol", email: "carol@travel.com", passwordHash: editorHash, roleId: editorRole.id });
    console.log("Default users seeded: admin / alice / bob");
  }

  const tripCount = await Trip.count();
  if (tripCount === 0) {
    for (const tripData of TRIPS_SEED) {
      const { expenses, ...tripFields } = tripData;
      const trip = await Trip.create(tripFields);
      for (const expense of expenses) {
        await Expense.create({ ...expense, tripId: trip.id });
      }
    }
    console.log("Trips seeded.");
  }

  console.log("Database ready.");
}

export { sequelize, Trip, Expense, User, Role, Permission };
