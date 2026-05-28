import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Log = sequelize.define(
  "Log",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    actionInfo: {
      type: DataTypes.TEXT,
      allowNull: true, 
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "logs",
    timestamps: false,
  }
);

export default Log;