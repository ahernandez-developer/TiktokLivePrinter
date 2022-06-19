import { Sequelize } from "sequelize";
import path from "path";
const isBuild = process.env.NODE_ENV === "production";

const pathToDbFile = path.join(
  isBuild ? __dirname : __static,
  "../src/database/database.sqlite"
);

async function testConnection() {
  const connection = getConection();

  try {
    await connection.authenticate();
    return "Connection has been established successfully.";
  } catch (error) {
    return "Unable to connect to the database:", error;
  }
}

function getConection() {
  const connection = new Sequelize({
    dialect: "sqlite",
    storage: pathToDbFile,
  });

  return connection;
}

export { getConection, testConnection };
