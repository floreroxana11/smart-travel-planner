import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const ObservationList = sequelize.define(
  "ObservationList",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, 
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false, 
    },
    triggerAction: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    flaggedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  },
  {
    tableName: "observation_list",
    timestamps: false,
  }
);

export default ObservationList;