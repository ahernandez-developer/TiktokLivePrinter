import { getConection } from "../database/index";

async function db() {
  const connection = getConection();

  try {
    await connection.authenticate();
    return "Connection has been established successfully.";
  } catch (error) {
    return "Unable to connect to the database:", error;
  }
}

export { db };
