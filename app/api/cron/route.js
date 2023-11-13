import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false },
      {
        status: 401,
      }
    );
  }

  try {
    const { rows } = await sql`SELECT * FROM secondaryaccounts`;
    const updates = rows.map(async (account) => {
      const { access_token, refresh_token, youtube_data } = account;

      if (youtube_data?.timestamp) {
        // Parse the timestamp and check if it's at least 5 days old
        const timestamp = new Date(youtube_data.timestamp);
        const now = new Date();
        const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;

        if (now - timestamp < fiveDaysInMilliseconds) {
          // If the timestamp is less than 5 days old, skip this account
          return;
        }
      }

      const youtubeData = await fetchYoutubeData({
        access_token,
        refresh_token,
      });

      const summarizedData = await summarizeContent(youtubeData, account.email);

      if (!summarizedData) return { data: { error: "no summary to save" } };
      summarizedData.timestamp = new Date().toISOString();
      console.log("======SUMMARIZED DATA=====", summarizedData);
      await sql`UPDATE secondaryaccounts SET youtube_data = ${JSON.stringify(
        summarizedData
      )} WHERE account_id = ${rows[0].account_id}`;
      console.log("++++SAVED++++");
      return {
        data: { success: "done" },
      };
    });
    return NextResponse.json(
      { data: await Promise.all(updates) },
      { status: 200 }
    );
  } catch (error) {
    console.log("/api/cron", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
