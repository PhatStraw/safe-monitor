import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

async function saveSecondaryAccount(user_id, user, data) {
  const { email, name } = user;
  const { access_token, refresh_token } = data;

  try {
    const { rows } = await sql`
      INSERT INTO SecondaryAccounts (user_id, email, name, access_token, refresh_token, youtube_data)
      VALUES (${user_id}, ${email}, ${name}, ${access_token}, ${refresh_token}, ${JSON.stringify(data)})
      RETURNING *;
    `;

    return rows[0];
  } catch (error) {
    console.error('Error saving secondary account:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { code, email } = await request.json();
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: "http://localhost:3000",
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }

    const userInfo = await userInfoResponse.json();
    console.log("USER INFO", userInfo); // Log response data
    console.log("DATA", data); // Log response data

    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }
    // Find user by email
    const { rows } = await sql`
        SELECT * FROM Users WHERE email = ${email};
      `;

    // If user exists, use their id for the user_id in the SecondaryAccounts table
    if (rows.length > 0) {
      const user_id = rows[0].user_id;
      await saveSecondaryAccount(user_id, userInfo, data);
    } else {
      throw new Error("User not found");
    }
    return NextResponse.json(
      { data: { ...data, ...userInfo } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
