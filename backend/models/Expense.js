import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Trip from "./Trip.js";

const Expense = sequelize.define(
  "Expense",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Trip,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "expenses",
    timestamps: true,
  }
);

Trip.hasMany(Expense, { foreignKey: "tripId", as: "expenses", onDelete: "CASCADE" });
Expense.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

export default Expense;