// pages/api/getUser.js
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

//returns a user
export async function POST(req) {
  const { email } = await req.json(); // get email from query parameters

  try {
    const { rows } = await sql`
      SELECT * FROM Users WHERE email = ${email};
    `;

    // If user exists, return the user
    if (rows.length > 0) {
      return NextResponse.json({ user: rows[0] }, { status: 200 });
    } else {
      // If user doesn't exist, return an error
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
