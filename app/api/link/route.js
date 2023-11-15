import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { google } from "googleapis";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export const preferredRegion = "iad1";

// This function fetches an access token from Google's OAuth2 server
async function fetchToken(code) {
  // Define the endpoint for fetching the token
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  // Create a URLSearchParams object with the necessary parameters for the request
  const params = new URLSearchParams({
    code, // The authorization code received from Google's OAuth2 server
    client_id: process.env.NEXT_PUBLIC_GOOGLE_ID, // The client ID of your application
    client_secret: process.env.NEXT_PUBLIC_GOOGLE_SECRET, // The client secret of your application
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI, // The redirect URI where the user will be sent after authorization
    grant_type: "authorization_code", // The grant type for the request (in this case, authorization code)
  });

  // Make a POST request to the token endpoint with the parameters
  const tokenResponse = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // The content type of the request
    },
    body: params, // The parameters for the request
  });

  // Return the response from the server as a JSON object
  return await tokenResponse.json();
}

// This function fetches user information from Google's OAuth2 server
async function fetchUserInfo(access_token) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

// This function finds a user in the database by their email
async function findUserByEmail(email) {
  // Execute a SQL query to select all fields from the Users table where the email matches the provided email
  const { rows } = await sql`
    SELECT * FROM Users WHERE email = ${email};
    `;

  // If the query returns one or more rows, return the user_id of the first row
  if (rows.length > 0) {
    return rows[0].user_id;
  }

  // If no rows are returned (i.e., no user with the provided email was found), throw an error
  throw new Error("User not found");
}

// This function fetches YouTube data using the provided authentication credentials
async function fetchYoutubeData(auth) {
  // Create an OAuth2 client with the client ID, client secret, and redirect URI
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_ID,
    process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  // Set the credentials on the OAuth2 client
  oauth2Client.setCredentials({
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,
    // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
    // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
  });

  // Create a YouTube service client
  const service = google.youtube("v3");
  const data = {};

  // Fetch the user's liked videos
  const likedVideosResponse = await service.playlistItems
    .list({
      auth: oauth2Client,
      part: "snippet",
      playlistId: "LL", // LL is the playlist ID for the liked videos
      maxResults: 10,
    })
    .catch((err) => console.error("Error retrieving liked videos: " + err));
  data.likedVideos = likedVideosResponse.data.items;

  // Fetch the user's subscriptions
  const subscriptionsResponse = await service.subscriptions
    .list({
      auth: oauth2Client,
      part: "snippet",
      mine: true,
      maxResults: 10,
    })
    .catch((err) => console.error("Error retrieving subscriptions: " + err));
  data.subscriptions = subscriptionsResponse.data.items;

  // For each subscription, fetch the last uploaded video
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

  // Return the fetched data
  return data;
}

// This function summarizes YouTube content and sends an email with the summary
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

  // Create a transporter for sending the email
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the options for the email
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

// This function saves a secondary account to the database
async function saveSecondaryAccount(primary_id, user, data) {
  // Extract the email and name from the user object
  const { email, name } = user;

  // Extract the access token and refresh token from the data object
  const { access_token, refresh_token } = data;

  try {
    // Execute a SQL query to check if the account already exists in the SecondaryAccounts table
    const existingAccount = await sql`
      SELECT * FROM SecondaryAccounts WHERE email = ${email};
    `;

    // If the account already exists (i.e., the query returned one or more rows), return a specific object
    if (existingAccount.rows.length > 0) {
      return { status: 409, message: "Account already exists" };
    } else {
      // If the account does not exist (i.e., the query returned no rows), insert the account into the SecondaryAccounts table
      const { rows } = await sql`
        INSERT INTO SecondaryAccounts (user_id, email, name, access_token, refresh_token)
        VALUES (${primary_id}, ${email}, ${name}, ${access_token}, ${refresh_token})
        RETURNING *;
      `;

      // Return a specific object with the status and the inserted account
      return { status: 200, data: rows[0] };
    }
  } catch (error) {
    // If an error occurs, log the error and throw it
    console.error("Error saving secondary account:", error);
    throw error;
  }
}

// This function handles POST requests
export async function POST(request) {
  try {
    // Parse the request body as JSON and extract the code and email
    const { code, email } = await request.json();
    console.log("=========code, email============", code, email);

    if (!code || !email) {
      throw new Error("Missing required parameters: code or email");
    }

    // Fetch the token using the code
    const data = await fetchToken(code);
    console.log("=========data============", data);

    if (!data.access_token) {
      throw new Error("Failed to fetch token");
    }

    // Fetch the user info using the access token
    const secondaryInfo = await fetchUserInfo(data.access_token);
    console.log("=========SecondaryInfo============", secondaryInfo);
    if (!secondaryInfo) {
      throw new Error("Failed to fetch user info");
    }

    // Find the user by email and get their ID
    const primary_id = await findUserByEmail(email);
    console.log("=========primary_id============", primary_id);

    if (!primary_id) {
      throw new Error("Failed to find user by email");
    }

    // Save the secondary account to the database
    const result = await saveSecondaryAccount(primary_id, secondaryInfo, data);
    console.log("=========result============", result);

    // If the account already exists, return an error response
    if (result.status === 409) {
      throw new Error(result.message);
    }

    // Extract the account ID and name from the result
    const { account_id, name } = result.data;

    // Fetch the secondary account from the database
    const { rows } =
      await sql`SELECT * FROM secondaryaccounts WHERE account_id = ${account_id}`;

    fetch(`${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}/api/fetch_youtube`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secondary_row: rows[0],
      }),
    });

    // Return a successful response with the name and secondary ID
    return NextResponse.json(
      { data: { name, secondaryId: account_id } },
      { status: 200 }
    );
  } catch (error) {
    // If an error occurs, log the error and return an error response
    console.error("Error in POST function:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
