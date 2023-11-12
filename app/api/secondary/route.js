// pages/api/getSecondaryAccounts.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
export async function POST(req) {
  const { user_id } = await req.json(); // get user_id from request body

  try {
    const { rows } = await sql`
      SELECT * FROM SecondaryAccounts WHERE user_id = ${user_id};
    `;

    // If secondary accounts exist, return them
    if (rows.length > 0) {
      return NextResponse.json({ data: rows }, { status: 200 });

    } else {
      // If no secondary accounts exist, return an error
      return NextResponse.json({ error: 'No secondary accounts found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error retrieving secondary accounts:', error);
    return NextResponse.json(
        { error: "Error retrieving secondary accounts" },
        { status: 500 }
      );

  }
}