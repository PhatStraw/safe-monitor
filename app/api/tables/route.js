import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Create Users Table
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    // Create OAuth Tokens Table
    await sql`CREATE TABLE IF NOT EXISTS oauth_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      access_token TEXT,
      refresh_token TEXT,
      scope TEXT,
      token_type TEXT,
      expiry_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    // Create Activity Logs Table
    await sql`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      activity_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    return NextResponse.json({ result: "Tables created successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}