import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// GET ALL SECONDARYACCOUNTS ASSOCIATED WITH THE EMAIL OR USER_ID
export async function POST(req) {
  // Destructure user_id and email from the request body
  const { user_id, email } = await req.json(); 

  let account;
  
  try {
    // If user_id is provided in the request
    if (user_id) {
      // Query the database to get all secondary accounts associated with the user_id
      const { rows } = await sql`
        SELECT * FROM secondaryaccounts WHERE user_id = ${user_id};
      `;
      // Store the result in the account variable
      account = rows;
    } else {
      // If user_id is not provided, find the user by email
      const { rows: userRows } = await sql`
      SELECT * FROM users WHERE email = ${email};
    `;
      // If user exists
      if (userRows.length > 0) {
        // Use the user_id to find the secondary accounts
        const { rows: accountRows } = await sql`
        SELECT * FROM secondaryaccounts WHERE user_id = ${userRows[0].user_id};
      `;
        // Store the result in the account variable
        account = accountRows;
      } else {
        // If user does not exist, return an error
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

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
    // Log any errors that occur when retrieving secondary accounts
    console.error("Error retrieving secondary accounts:", error);
    // Return an error response
    return NextResponse.json(
      { error: "Error retrieving secondary accounts" },
      { status: 500 }
    );
  }
}