import { inngest } from "./client";
import { sql } from "@vercel/postgres";
import { google } from "googleapis";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

async function fetchToken(code) {
  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    code,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_ID,
    client_secret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
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

  // if (!tokenResponse.ok) {
  //   throw new Error(`HTTP error! status: ${tokenResponse.status}`);
  // }
  return await tokenResponse.json();
}

async function fetchUserInfo(access_token) {
  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (!userInfoResponse.ok) {
    throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
  }

  return await userInfoResponse.json();
}

async function findUserByEmail(email) {
  const { rows } = await sql`
    SELECT * FROM Users WHERE email = ${email};
    `;

  if (rows.length > 0) {
    return rows[0].user_id;
  }

  throw new Error("User not found");
}

async function fetchYoutubeData(auth) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_ID,
    process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,
    // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
    // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
  });

  const service = google.youtube("v3");
  const data = {};

  // Get liked videos
  const likedVideosResponse = await service.playlistItems
    .list({
      auth: oauth2Client,
      part: "snippet",
      playlistId: "LL", // LL is the playlist ID for the liked videos
      maxResults: 10,
    })
    .catch((err) => console.error("Error retrieving liked videos: " + err));
  data.likedVideos = likedVideosResponse.data.items;

  // Get subscriptions
  const subscriptionsResponse = await service.subscriptions
    .list({
      auth: oauth2Client,
      part: "snippet",
      mine: true,
      maxResults: 10,
    })
    .catch((err) => console.error("Error retrieving subscriptions: " + err));
  data.subscriptions = subscriptionsResponse.data.items;

  // Get last uploaded video for each subscription
  for (let i = 0; i < data.subscriptions.length; i++) {
    const channelId = data.subscriptions[i].snippet.resourceId.channelId;
    const uploadsResponse = await service.search
      .list({
        auth: oauth2Client,
        part: "snippet",
        channelId: channelId,
        type: "video",
        order: "date", // to ensure the latest video comes first
        maxResults: 1,
      })
      .catch((err) =>
        console.error(
          "Error retrieving last uploaded video for each subscription: " + err
        )
      );
    data.subscriptions[i].lastUploadedVideo = uploadsResponse.data.items[0];
  }

  // Write data to file
  return data;
}

async function summarizeContent(data, email) {
  // Extract the liked videos and subscriptions
  const likedVideos = data.likedVideos;
  const subscriptions = data.subscriptions;

  // Prepare the prompt for the GPT-3 model
  let prompt = "Summarize the following YouTube content:\n\n";

  prompt += "Liked Videos:\n";
  likedVideos.forEach((video) => {
    prompt += `- ${video.snippet.title}: ${video.snippet.description}\n`;
  });

  prompt += "\nSubscriptions:\n";
  subscriptions.forEach((subscription) => {
    prompt += `- ${subscription.snippet.title}: ${subscription.snippet.description}\n`;
  });

  // Use the ChatGPT model to generate a summary
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
            you are an ai assistant hired by parents to monitor their 
            childrens internet exposure. 
  
            given the following content from youtube, analyze 
            and create a json object that contains a personal 
            email newsletter that will be sent to the parent
            whose childs content this is and split the contents 
            of that newletter into seperate objects on the response 
            that can be displayed to the user via an api call. 
            give opinion on the psych of the child and topics to 
            discuss with the child.
            
            response should be in the following format:
            {
              "email_newsletter": {
                "subject": "Your Child's Recent YouTube Activity - Insightful Overview and Discussion Topics",
                "greeting": "Dear Parent,",
                "introduction": "",
                "content_analysis": [
                  {
                    "topic": "",
                    "content": ""
                  },
                  {
                    "topic": "",
                    "content": ""
                  },
                  {
                    "topic": "",
                    "content": ""
                  },
                  {
                    "topic": "",
                    "content": "."
                  }
                ],
                "psych_analysis": {
                  "overview": "",
                  "topics_to_discuss": [
                    "",
                    "",
                    "",
                    ""
                  ]
                },
                "closing": "",
                "sign_off": ""
              }
            }
            `,
      },
      {
        role: "user",
        content: `${prompt}`,
      },
    ],
  });
  const parsed = JSON.parse(response.choices[0].message.content);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject:
      "Your Child's Recent YouTube Activity - Insightful Overview and Discussion Topics",
    html: `
      <html>
        <head>
          <style>
            /* Add your custom CSS styles here */
          </style>
        </head>
        <body>
          <h1>Your Child's Recent YouTube Activity</h1>
          <p>Dear Parent,</p>
          <p>${parsed.email_newsletter.introduction}</p>
          
          <h2>Content Analysis</h2>
          <ul>
            ${parsed.email_newsletter.content_analysis
              .map(
                (analysis) => `
              <li>
                <h3>${analysis.topic}</h3>
                <p>${analysis.content}</p>
              </li>
            `
              )
              .join("")}
          </ul>
          
          <h2>Psychological Analysis</h2>
          <p>${parsed.email_newsletter.psych_analysis.overview}</p>
          <h3>Topics to Discuss:</h3>
          <ul>
            ${parsed.email_newsletter.psych_analysis.topics_to_discuss
              .map(
                (topic) => `
              <li>${topic}</li>
            `
              )
              .join("")}
          </ul>
          
          <p>${parsed.email_newsletter.closing}</p>
          <p>${parsed.email_newsletter.sign_off}</p>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  // Return the summary in JSON format
  return parsed;
}

async function saveSecondaryAccount(user_id, user, data, youtubeData) {
  const { email, name } = user;
  const { access_token, refresh_token } = data;

  try {
    const { rows } = await sql`
        INSERT INTO SecondaryAccounts (user_id, email, name, access_token, refresh_token, youtube_data)
        VALUES (${user_id}, ${email}, ${name}, ${access_token}, ${refresh_token}, ${JSON.stringify(
      youtubeData
    )})
        RETURNING *;
      `;

    return rows[0];
  } catch (error) {
    console.error("Error saving secondary account:", error);
    throw error;
  }
}

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { cron: "0 9 * * MON" },
  async ({ step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { body: "Hello, World!" };
  }
);

export const fetchAndSummarizeYoutubeData = inngest.createFunction(
  { name: "Fetch and Summarize Youtube Data", id: "handle-weekly-data" },
  { cron: "TZ=America/New_York 0 8 * * 1" }, // Run every Monday at 8am
  async ({ step, event }) => {
    const events = rows.map(async (account) => {
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

      return {
        name: "app/youtube.data.summarized",
        data: {
          accountId: account.id,
          summarizedData,
        },
      };
    });

    await step.sendEvent(await Promise.all(events));
  }
);

export const fetchAndSummarizeYoutubeDataOnSignup = inngest.createFunction(
  { name: "Fetch and Summarize Youtube Data on Signup", id: "handle-signup" },
  { event: "app/user.signup" },
  async ({ step, event }) => {
    const accountId = event.data?.accountId;

    // If an accountId is provided, only fetch that account
    const { rows } = await step.run(
      "Load specific secondary account",
      async () =>
        await sql`SELECT * FROM secondaryaccounts WHERE account_id = ${accountId}`
    );

    const { access_token, refresh_token, youtube_data } = rows[0];

      // Parse the timestamp and check if it's at least 5 days old
      if (youtube_data?.timestamp) {
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

      const summarizedData = await summarizeContent(youtubeData, rows[0].email);

      await step.sendEvent("send-summarized-youtube",{
        name: "app/youtube.data.summarized",
        data: {
          accountId: rows[0].account_id,
          summarizedData,
        },
      })
  }
);

export const handleSummarizedYoutubeData = inngest.createFunction(
  { name: "Handle Summarized Youtube Data", id: "handle-summary" },
  { event: "app/youtube.data.summarized" },
  async ({ event }) => {
    const summarizedData = event.data.summarizedData;
    if(!summarizedData) return {data: {error: "no summary to save"}}
    summarizedData.timestamp = new Date().toISOString();
    await sql`UPDATE secondaryaccounts SET youtube_data = ${JSON.stringify(
      summarizedData
    )} WHERE account_id = ${event.data.accountId}`;
    console.log("++++SAVED++++");
    return {
      data: { success: "done" },
    };
  }
);
