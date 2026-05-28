import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Permission from "./Permission.js";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);


Role.belongsToMany(Permission, {
  through: "role_permissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: "role_permissions",
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});

export default Role;
