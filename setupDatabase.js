require('dotenv').config()
const { Pool } = require("pg");

// PostgreSQL connection string from Vercel
import connectionString from "./connection"
console.log(connectionString)
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // This is necessary if the server uses a self-signed certificate
  },
});

const createTables = async () => {
  const client = await pool.connect();

  try {
    // SQL for creating tables
    await client.query(`
    DROP TABLE IF EXISTS SecondaryAccounts CASCADE;

    DROP TABLE IF EXISTS Users CASCADE;

    CREATE TABLE IF NOT EXISTS Users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        google_id VARCHAR(255) UNIQUE
      );
    
      CREATE TABLE IF NOT EXISTS SecondaryAccounts (
        account_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES Users(user_id),
        email VARCHAR(255),
        name VARCHAR(255),
        access_token VARCHAR(255),
        refresh_token VARCHAR(255),
        youtube_data JSONB
      );
    `);

    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables", err.stack);
  } finally {
    client.release();
  }
};

createTables().then(() => pool.end());
