import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../data/travel_planner.sqlite"),
  logging: false,
});

export default sequelize;