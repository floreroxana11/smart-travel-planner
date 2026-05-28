import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tripName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    collaborators: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    packingList: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
  },
  {
    tableName: "trips",
    timestamps: true,
  }
);

export default Trip;