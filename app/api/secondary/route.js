// pages/api/getSecondaryAccounts.js
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
export async function POST(req) {
  console.log("HERERERER");
  const { user_id, email } = await req.json(); // get user_id from request body
  let account;
  try {
    if (user_id) {
      const { rows } = await sql`
        SELECT * FROM secondaryaccounts WHERE user_id = ${user_id};
      `;
      account = rows;
    } else {
      // First find the user by email
      const { rows: userRows } = await sql`
      SELECT * FROM users WHERE email = ${email};
    `;
      if (userRows.length > 0) {
        // If user exists, use the user_id to find the secondary accounts
        const { rows: accountRows } = await sql`
        SELECT * FROM secondaryaccounts WHERE user_id = ${userRows[0].user_id};
      `;
        account = accountRows;
      } else {
        // If user does not exist, return an error
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }
    console.log(account);
    // If secondary accounts exist, return them
    if (account.length > 0) {
      return NextResponse.json({ data: account }, { status: 200 });
    } else {
      // If no secondary accounts exist, return an error
      return NextResponse.json(
        { error: "No secondary accounts found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving secondary accounts:", error);
    return NextResponse.json(
      { error: "Error retrieving secondary accounts" },
      { status: 500 }
    );
  }
}
