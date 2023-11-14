import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { google } from "googleapis";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

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

    if (!data) {
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

    // Extract the access token, refresh token, and YouTube data from the account
    const { access_token, refresh_token } = rows[0];

    const youtubeData = await fetchYoutubeData({
      access_token,
      refresh_token,
    });
    // const youtubeData = {

    //   "likedVideos": [
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "ek7t23m0f1nAJjAJncDJWRQgkcs",
    //       "id": "TEwudUVsMktVWjNKV0E",
    //       "snippet": {
    //         "publishedAt": "2023-11-07T17:07:56Z",
    //         "channelId": "",
    //         "title": "Sam Altman on Choosing Projects, Creating Value, and Finding Purpose",
    //         "description": "Sam Altman - https://twitter.com/sama - expands on ideas that have come up in several of his essays. Specifically: choosing projects, creating value, and finding purpose.\n\nSam’s the president of YC Group - https://ycombinator.com/ - and co-chairman of OpenAI - https://openai.com/\n\nThe YC podcast is hosted by Craig Cannon - https://twitter.com/craigcannon\n\n***\n\nTopics\n\n:55 – From The Days Are Long But The Decades Are Short – Minimize your own cognitive load from distracting things that don’t really matter. It’s hard to overstate how important this is, and how bad most people are at it. http://blog.samaltman.com/the-days-are-long-but-the-decades-are-short\n\n3:20 – Stepping back and evaluating your work\n\n5:00 – Creating metrics for your projects\n\n6:00 – Taking a year off\n\n9:00 – Figuring out when to commit\n\n11:00 – Poker\n\n12:00 – From Productivity – Sleep seems to be the most important physical factor in productivity for me. Exercise is probably the second most important physical factor. The third area is nutrition. http://blog.samaltman.com/productivity\n\n14:30 – From You and Your Research by Richard Hamming – If what you are doing is not important, and if you don’t think it is going to lead to something important, why are you at Bell Labs working on it?’ http://blog.samaltman.com/you-and-your-research\n\n16:00 – From The Days Are Long But The Decades Are Short – Things in life are rarely as risky as they seem. Most people are too risk-averse, and so most advice is biased too much towards conservative paths. http://blog.samaltman.com/the-days-are-long-but-the-decades-are-short\n\n17:00 – Perspective shifts\n\n19:45 – From Productivity – My system has three key pillars: “Make sure to get the important shit done”, “Don’t waste time on stupid shit”, and “make a lot of lists”. http://blog.samaltman.com/productivity\n\n22:00 – What Happened to Innovation http://blog.samaltman.com/what-happened-to-innovation-1\n\n24:20 – From You and Your Research by Richard Hamming – He who works with the door open gets all kinds of interruptions, but he also occasionally gets clues as to what the world is and what might be important. http://blog.samaltman.com/you-and-your-research\n\n26:20 – The deferred life plan doesn’t work\n\n31:20 – From The Merge – Our self-worth is so based on our intelligence that we believe it must be singular and not slightly higher than all the other animals on a continuum. Perhaps the AI will feel the same way and note that differences between us and bonobos are barely worth discussing. http://blog.samaltman.com/the-merge\n\n33:40 – Weight training\n\n35:00 – The Way to Love by Anthony de Mello https://www.amazon.com/Way-Love-Meditations-Anthony-Classics/dp/038524939X",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/uEl2KUZ3JWA/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/uEl2KUZ3JWA/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/uEl2KUZ3JWA/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/uEl2KUZ3JWA/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/uEl2KUZ3JWA/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 0,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "uEl2KUZ3JWA"
    //         },
    //         "videoOwnerChannelTitle": "Y Combinator",
    //         "videoOwnerChannelId": "UCcefcZRL2oaA_uBNeo5UOWg"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "2mlJha0fsG0AGVxDMvzfTnv4jOo",
    //       "id": "TEwueFppNGtUSkctTEU",
    //       "snippet": {
    //         "publishedAt": "2023-11-05T21:11:28Z",
    //         "channelId": "",
    //         "title": "How to Sell by Tyler Bosmeny",
    //         "description": "Tyler Bosmeny from YC alumnus Clever shares his expertise on how an early stage company should think about sales and about building an enterprise sales team.\n\nYou can find the lecture transcript and slides here: https://www.startupschool.org/videos/43\n\nLearn more at https://www.startupschool.org/",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/xZi4kTJG-LE/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/xZi4kTJG-LE/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/xZi4kTJG-LE/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/xZi4kTJG-LE/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/xZi4kTJG-LE/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 1,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "xZi4kTJG-LE"
    //         },
    //         "videoOwnerChannelTitle": "Y Combinator",
    //         "videoOwnerChannelId": "UCcefcZRL2oaA_uBNeo5UOWg"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "7WNjJnSzB6RM2ACPppodmoaH6QU",
    //       "id": "TEwuVGg4Sm9JYW40ZGc",
    //       "snippet": {
    //         "publishedAt": "2023-11-05T20:53:23Z",
    //         "channelId": "",
    //         "title": "How to Get and Evaluate Startup Ideas | Startup School",
    //         "description": "YC Group Partner Jared Friedman shares a framework for how to get and evaluate startup ideas. He shares many examples of YC companies and the inside stories of how they came up with the ideas that turned into billion dollar companies. Even if you have an existing idea, this talk helps founders confirm that their idea is good and/or provide framework for a future pivot.\n\nApply to Y Combinator: https://yc.link/SUS-apply\nWork at a startup: https://yc.link/SUS-jobs\n\nChapters (Powered by https://bit.ly/chapterme-yc) - \n00:00 - Finding a promising idea\n00:51 - Where does this advice come from?\n01:44 - 4 most common mistakes\n06:29 - 10 key questions to ask about any startup idea\n14:40 - 3 things that make your startup idea good\n19:42 - How to come up with startup ideas\n21:25 - 7 recipes for generating startups ideas\n\n#startup #tech #entrepreneur",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/Th8JoIan4dg/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/Th8JoIan4dg/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/Th8JoIan4dg/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/Th8JoIan4dg/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/Th8JoIan4dg/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 2,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "Th8JoIan4dg"
    //         },
    //         "videoOwnerChannelTitle": "Y Combinator",
    //         "videoOwnerChannelId": "UCcefcZRL2oaA_uBNeo5UOWg"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "BnCAA8VcX7YuaXUUnd_rmKcMRWM",
    //       "id": "TEwuTk9VZHh2THRaQVU",
    //       "snippet": {
    //         "publishedAt": "2023-10-24T06:15:08Z",
    //         "channelId": "",
    //         "title": "Building A $250 Million SaaS Startup: Abhishek Nayak, Appsmith - Backstage With Millionaires",
    //         "description": "Listen to this podcast as audio: https://open.spotify.com/episode/4VEWuaXCm3KXCQzxX3jbh7\n\nIn this episode of Backstage With Millionaires podcast, we sit down with Abhishek Nayak, founder and CEO of Appsmith, to discuss his entrepreneurial journey.\n\n00:00 - Intro\n03:34 - Time at BITS Pilani\n07:28 - Saying NO to a Job\n09:10 - Meeting Co-Founder\n11:03 - GharPay - First Startup\n15:54 - Clink - Second Startup\n19:00 - Wise - Third Startup\n20:24 - Building Bicycle AI\n24:50 - Pivot to Mobshow\n28:50 - Time at Accel Launchpad\n29:29 - Idea for Appsmith\n34:30 - Initial Response\n36:48 - Tasting Success\n38:50 - Difficult Times\n42:19 - Outro\n\nAbhishek started his entrepreneurial journey in 2011, when he built 'GharPay', a platform to let e-commerce companies collect cash payments. \n\nHe then started Clinknow, a product in the transaction marketing space with the Gharpay team and investors.\n\nAfter Ezetap acquired Clink, Abhishek worked as director of products at Ezetap before moving on to his next venture.\n\nHe started 'Wise' in 2015, a hardware startup, where their team built two products, but couldn't find a product-market fit, and hence pivoted to an AI started called Bicycle AI.\n\nBicycle AI applied deep learning and machine learning to automate customer service for companies. The team saw success there but had issues with the working on AI and hence shut it down. \n\nAbhishek started Appsmith in 2019, an open source project that makes it easy to build and maintain custom internal business tools.\n\nIt has since raised over $51 Million, and is currently valued at over $250 Million.\n\nAppsmith currently has a team of 140, and their clients are present in every country on the globe.\n\nConnect with us:\n\nTwitter: https://twitter.com/bwmillionaires/ \nLinkedIn: https://www.linkedin.com/company/backstagewithmillionaires/ \nInstagram: https://www.instagram.com/backstagewithmillionaires/ \nDiscord: https://discord.gg/XySGGhXKep\nSpotify: https://open.spotify.com/show/5rGPalovc6AKsfbOyjh32p\n\n#startup #entrepreneur #saas",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/NOUdxvLtZAU/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/NOUdxvLtZAU/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/NOUdxvLtZAU/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/NOUdxvLtZAU/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/NOUdxvLtZAU/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 3,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "NOUdxvLtZAU"
    //         },
    //         "videoOwnerChannelTitle": "Backstage with Millionaires",
    //         "videoOwnerChannelId": "UCnpekFV93kB1O0rVqEKSumg"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "gmX8-OaPF5Zp02fKKMdrm2AUeHE",
    //       "id": "TEwuMzFVOVhfWEQ2M2M",
    //       "snippet": {
    //         "publishedAt": "2023-10-24T05:19:39Z",
    //         "channelId": "",
    //         "title": "Validate Your SaaS Idea FAST (Step-by-Step SaaS Validation Process)💡✅",
    //         "description": "Validate your SaaS idea NOW! In under a month, you can validate your SaaS idea with this step-by-step SaaS idea validation process. This process is the perfect way to gather traffic and to see how many people are going to be interested in your product so you can decide if your idea is worth pursuing.\n\nWatch these next: ⬇️⬇️\n\nThe Best Customer Acquisition Funnels for a SaaS Startup: https://youtu.be/XeRVY_-jRyI\nHow to Validate Your Idea & Launch to $7k in Recurring Revenue: https://youtu.be/GLay7kksLtc\nStarting a SaaS Business? Here's Your Winning Go-to-Market Plan: https://youtu.be/wLoHNv9qMKw\n\n🔗More links from video:\n·Episode 628: The 5 P.M. Idea Evaluation Framework: https://www.startupsfortherestofus.com/episodes/episode-628-the-5-p-m-idea-validation-framework\n·State of Independent SaaS Report: https://microconf.com/state-of-indie-saas\n·Episode 589: Finding a SaaS Idea Through 70 Cold Calls: https://www.startupsfortherestofus.com/episodes/episode-589-finding-a-saas-idea-through-70-cold-calls\n·The Mom Test: https://a.co/d/2wuyRdd\n\nVideo Sponsor:\nThis week’s video was sponsored by Lemon.io.  Cut down on hiring time by working with vetted devs at competitive rates.\nGet 15% off your first 4 weeks working with their engineers. 👉  https://lemon.io/microconf\n\n📈 SUBSCRIBE: https://www.youtube.com/microconf?sub_confirmation=1\n\nWelcome to MicroConf - Where Independent SaaS Founders Launch, Meet, Learn, and Grow! MicroConf is the world’s most trusted community for bootstrapped SaaS founders. \n\nMicroConf is a community of SaaS founders that brings together bootstrapped and independently-funded B2B SaaS companies who are not looking to chase “unicorn status'' or venture capital.\n\nWe provide SaaS training, education and networking opportunities for other founders who are pre-product, focused on scaling their business, and looking for an exit strategy.\n\nMicroConf began more than a decade ago. Since then, we’ve hosted more than 25 events with nearly 200 speakers, helped thousands of attendees, and impacted tens of thousands more through our videos and online community. \n\nReady to take your SaaS startup to the next level? Check these out: \n\nIn Person Events: https://microconf.com/upcoming-events\nDigital Events: https://microconfremote.com\nMastermind Matching: https://microconf.com/masterminds\n\n\nLet’s Connect...\nWebsite: https://microconf.com/\nFacebook: https://facebook.com/microconf\nTwitter: https://twitter.com/microconf",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/31U9X_XD63c/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/31U9X_XD63c/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/31U9X_XD63c/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/31U9X_XD63c/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/31U9X_XD63c/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 4,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "31U9X_XD63c"
    //         },
    //         "videoOwnerChannelTitle": "MicroConf",
    //         "videoOwnerChannelId": "UCHoBKQDRkJcOY2BO47q5Ruw"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "zFiNEfv9UCFNd4dO9x7deCWNACs",
    //       "id": "TEwuejR4UzI3VnlWTXM",
    //       "snippet": {
    //         "publishedAt": "2023-10-09T06:13:04Z",
    //         "channelId": "",
    //         "title": "How to Survive the Next Tech Revolution (w/ Brett Gibson)",
    //         "description": "Listen to the High Bit podcast: https://initialized.com/highbit\n\nApply for Initialized Partner role here:\nhttps://jobs.lever.co/initialized/be8b452f-6499-4a69-a340-3b3ea430e837\n\nTechnology is changing the world, and it’s the people who can build something from scratch who will create it. Today we're sitting down with my multi-time cofounder and friend, Brett Gibson. He runs Initialized Capital alongside Jen Wolf now that I’m back at YC.\n\n0:00 Technology is changing the world\n0:49 Write/rewrite happens in tech over and over again\n6:46 High Bit\n12:51 Initialized hiring an investing partner\n\n100% of the revenue from this channel is donated to https://www.code2040.org​ - thank you for helping me help the engineers of tomorrow.\n\nI'm Garry Tan, President & CEO at Y Combinator. I was an engineer, designer and product manager who turned into a founder and investor, and now I want to help you in your journey to build technology that changes the world. These videos are about helping people build world-class teams and startups that touch a billion people. \n\nPlease like this video and subscribe to my channel if you want to see more videos like this!\n\nFollow me on Twitter and Instagram so you'll never miss my videos and ideas—\nhttps://instagram.com/garrytan​\nhttps://twitter.com/garrytan",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/z4xS27VyVMs/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/z4xS27VyVMs/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/z4xS27VyVMs/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/z4xS27VyVMs/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/z4xS27VyVMs/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 5,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "z4xS27VyVMs"
    //         },
    //         "videoOwnerChannelTitle": "Garry Tan",
    //         "videoOwnerChannelId": "UCIBgYfDjtWlbJhg--Z4sOgQ"
    //       }
    //     },
    //     {
    //       "kind": "youtube#playlistItem",
    //       "etag": "J81rr7HwAAJDRBSSlKP1jkjXW3A",
    //       "id": "TEwuQlJwMEM0UDhwRU0",
    //       "snippet": {
    //         "publishedAt": "2023-10-09T06:11:10Z",
    //         "channelId": "",
    //         "title": "A profitable fintech built on helping special needs customers",
    //         "description": "https://www.truelinkfinancial.com/\n\nFinancial freedom. What if I told you there were people with special needs who can and should be able to live a full life where they can fully participate in their own financial lives? What if I told you that wasn’t just a big mission - that it was a profitable business and one of the only profitable neobanks? \n\nToday we’re sitting down with my friend and YC/Initialized founder Kai Stinchcombe - he’s the founder and CEO of True Link Financial. \n\nToday, he shares the lessons he learned the hard way, so you don’t have to. \n\nhttps://www.truelinkfinancial.com/\n\n00:57 Pick a problem and a customer \n2:59 Really solve the problem with product perfectly designed for that customer \n4:55 LTV vs CAC\n\n100% of the revenue from this channel is donated to https://www.code2040.org​ - thank you for helping me help the engineers of tomorrow.\n\nI'm Garry Tan, President & CEO at Y Combinator. I was an engineer, designer and product manager who turned into a founder and investor, and now I want to help you in your journey to build technology that changes the world. These videos are about helping people build world-class teams and startups that touch a billion people. \n\nPlease like this video and subscribe to my channel if you want to see more videos like this!\n\nFollow me on Twitter and Instagram so you'll never miss my videos and ideas—\nhttps://instagram.com/garrytan​\nhttps://twitter.com/garrytan",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://i.ytimg.com/vi/BRp0C4P8pEM/default.jpg",
    //             "width": 120,
    //             "height": 90
    //           },
    //           "medium": {
    //             "url": "https://i.ytimg.com/vi/BRp0C4P8pEM/mqdefault.jpg",
    //             "width": 320,
    //             "height": 180
    //           },
    //           "high": {
    //             "url": "https://i.ytimg.com/vi/BRp0C4P8pEM/hqdefault.jpg",
    //             "width": 480,
    //             "height": 360
    //           },
    //           "standard": {
    //             "url": "https://i.ytimg.com/vi/BRp0C4P8pEM/sddefault.jpg",
    //             "width": 640,
    //             "height": 480
    //           },
    //           "maxres": {
    //             "url": "https://i.ytimg.com/vi/BRp0C4P8pEM/maxresdefault.jpg",
    //             "width": 1280,
    //             "height": 720
    //           }
    //         },
    //         "channelTitle": "",
    //         "playlistId": "LL",
    //         "position": 6,
    //         "resourceId": {
    //           "kind": "youtube#video",
    //           "videoId": "BRp0C4P8pEM"
    //         },
    //         "videoOwnerChannelTitle": "Garry Tan",
    //         "videoOwnerChannelId": "UCIBgYfDjtWlbJhg--Z4sOgQ"
    //       }
    //     }
    //   ],
    //   "subscriptions": [
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "ZZ6vVfcQ2ZfI7C8iXQ-jiRqjG2o",
    //       "id": "tFgJJd4ZrH8t3JeP0sdwbdOCV_gmCnU1nAg_QJ_4fYg",
    //       "snippet": {
    //         "publishedAt": "2023-10-04T05:53:42.282535Z",
    //         "title": "Garry Tan",
    //         "description": "Hi, I'm Garry Tan —I'm President & CEO of Y Combinator. I'm a designer, engineer, and investor in early stage startups. Previously Founder & Managing Partner of Initialized Capital, an early stage venture capital fund that was earliest in Coinbase and Instacart. \n\nBefore that, I was a a partner at Y Combinator. Invested in and directly worked with over 700 companies the earliest possible stage, often just an idea. I cofounded Posterous and helped build it to a world-class website used by millions. (Acquired by Twitter) I also helped build the engineering team for Palantir Technology's quant finance analysis platform, and designed the current Palantir logo and wordmark.\n\nI love building things. Forbes Midas List 2019 through 2022 🚀",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UCIBgYfDjtWlbJhg--Z4sOgQ"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKaENopZ45XK_roWM7mueooDyM6agy-fUbcpmkBP1R8=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKaENopZ45XK_roWM7mueooDyM6agy-fUbcpmkBP1R8=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKaENopZ45XK_roWM7mueooDyM6agy-fUbcpmkBP1R8=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "_Ny8j_mX7FNxgId82C3hogEYVB0",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "FNKyL5Q-OVQ"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-10-26T18:00:05Z",
    //           "channelId": "UCIBgYfDjtWlbJhg--Z4sOgQ",
    //           "title": "From Underdog to Undefeated: The Edrizio De La Cruz founder story",
    //           "description": "Edrizio's book now available on Amazon: https://amzn.to/3Sc2JIx Edrizio De La Cruz's immigrant startup founder story is truly one ...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/FNKyL5Q-OVQ/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/FNKyL5Q-OVQ/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/FNKyL5Q-OVQ/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "Garry Tan",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-10-26T18:00:05Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "0JT4hggkyqpq4RRVyFxUviL4Clg",
    //       "id": "tFgJJd4ZrH8t3JeP0sdwbfkJFADUNfyMa0yc_wR3_FI",
    //       "snippet": {
    //         "publishedAt": "2023-11-04T02:37:21.260493Z",
    //         "title": "Y Combinator",
    //         "description": "Videos to help you build a successful startup. Subscribe for startup advice, founder stories, and a look inside Y Combinator.\n\nWhat is Y Combinator?\nWe invest $500,000 in every startup and work intensively with the founders for three months. For the life of their company, founders have access to the most powerful community in the world, essential advice, later-stage funding and programs, recruiting resources, and exclusive deals. \n\nVisit ycombinator.com to learn more.\n\nVideo Team:\nZach Both - Video and Content Lead\nRyan Loughlin - Senior Producer",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UCcefcZRL2oaA_uBNeo5UOWg"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/mSqaIvHn4agaznTzuOZg8-cbSl8rt_K5FhkyQ_C6_VhPfXZagDrS1OvkLz9Dyax9fq7Curoo=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/mSqaIvHn4agaznTzuOZg8-cbSl8rt_K5FhkyQ_C6_VhPfXZagDrS1OvkLz9Dyax9fq7Curoo=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/mSqaIvHn4agaznTzuOZg8-cbSl8rt_K5FhkyQ_C6_VhPfXZagDrS1OvkLz9Dyax9fq7Curoo=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "SaacHY2oOYDUkGiQKNORp1tnPGs",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "A4sgu3XqpBo"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-04T00:21:42Z",
    //           "channelId": "UCcefcZRL2oaA_uBNeo5UOWg",
    //           "title": "Empathy and knowing the problem you&#39;re solving are core to design (and making something people want)",
    //           "description": "",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/A4sgu3XqpBo/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/A4sgu3XqpBo/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/A4sgu3XqpBo/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "Y Combinator",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-04T00:21:42Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "enNkQYKmOQUkiU7R4YVZvhgeSJg",
    //       "id": "tFgJJd4ZrH-7nqXGMszDP4IkWQh8LnUSwqly8OBc-1w",
    //       "snippet": {
    //         "publishedAt": "2023-10-24T05:19:27.85467Z",
    //         "title": "MicroConf",
    //         "description": "Welcome to MicroConf - Where Independent SaaS Founders Launch, Meet, Learn, and Grow! MicroConf is the world’s most trusted community for bootstrapped SaaS founders. \n\nMicroConf is a community of SaaS founders that brings together bootstrapped and independently-funded B2B SaaS companies who are not looking to chase “unicorn status'' or venture capital.\n\nWe provide SaaS training, education and networking opportunities for other founders who are pre-product, focused on scaling their business, and looking for an exit strategy.\n\nMicroConf began almost a decade ago. Since then, we’ve hosted 19 events with nearly 200 speakers, helped thousands of attendees, and impacted tens of thousands more through our videos and online community. \n\nReady to take your SaaS startup to the next level? Check these out: \n\nIn Person Events: https://microconf.com/upcoming-events\nDigital Events: https://microconfremote.com\nMastermind Matching: https://microconf.com/masterminds",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UCHoBKQDRkJcOY2BO47q5Ruw"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKYunOS_9z08ZZfIDwQLyq7C4vJelKQrv-3FzTgWyw=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKYunOS_9z08ZZfIDwQLyq7C4vJelKQrv-3FzTgWyw=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKYunOS_9z08ZZfIDwQLyq7C4vJelKQrv-3FzTgWyw=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "XS_Bfe7bLFEueghliEKohPMAvZk",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "6QIGL9RH1S8"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-05T17:00:03Z",
    //           "channelId": "UCHoBKQDRkJcOY2BO47q5Ruw",
    //           "title": "5 GENIUS SaaS Ideas I&#39;d Build Myself If I Had Time...",
    //           "description": "If you're looking for SaaS ideas, this one's for you. I share five genius SaaS (Software as a Service) ideas that I would personally ...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/6QIGL9RH1S8/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/6QIGL9RH1S8/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/6QIGL9RH1S8/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "MicroConf",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-05T17:00:03Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "Q8kbna66AbD57NL208FKFlZeuL4",
    //       "id": "tFgJJd4ZrH-YGe9mcxFRx9eN-AVD7vn-HCLLYaCZVq0",
    //       "snippet": {
    //         "publishedAt": "2023-10-31T22:24:07.355712Z",
    //         "title": "JohnnyTime",
    //         "description": "Smart Contract Hacking, Auditing, Security, DEFI, and WEB3.\nI release three new alpha videos every week so make sure to subscribe and turn on the bell notification button 🔔",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UC7u3j2v5wVVuQ2peTKDaP5Q"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/Xy2lgsPIZSL8pOw9cRWVIlfGuMPlqtn7CnEr3cdBKdGiYLy8fjnC46F3-nSFv_WDm2r8t0G_s-w=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/Xy2lgsPIZSL8pOw9cRWVIlfGuMPlqtn7CnEr3cdBKdGiYLy8fjnC46F3-nSFv_WDm2r8t0G_s-w=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/Xy2lgsPIZSL8pOw9cRWVIlfGuMPlqtn7CnEr3cdBKdGiYLy8fjnC46F3-nSFv_WDm2r8t0G_s-w=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "91ZKUV7rgCylwuH5UVw-xK9VOrk",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "GXKNQdohTJU"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-07T09:30:05Z",
    //           "channelId": "UC7u3j2v5wVVuQ2peTKDaP5Q",
    //           "title": "How Does Spearbit Get the Best Researchers Out There?",
    //           "description": "Spearbit attracts top researchers - known facts. How do they do it and what's the secret to not only attracting young talent, but also ...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/GXKNQdohTJU/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/GXKNQdohTJU/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/GXKNQdohTJU/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "JohnnyTime",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-07T09:30:05Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "GtO6j8MhLpZZhC68_haDtxc01xQ",
    //       "id": "tFgJJd4ZrH8t3JeP0sdwbZD18twW3b13aTkvpIYxpXM",
    //       "snippet": {
    //         "publishedAt": "2023-10-24T05:54:40.589064Z",
    //         "title": "Brian Dean",
    //         "description": "I’m a serial entrepreneur here to teach you how to start, grow and sell 7-figure businesses.",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UCx7J37QuXsGL7QG6SMIpqKg"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/WxmWLrdBADvv03i1rr_iyE-G47XDyeAS0pWGFCmJtbaKinG7s3C5bBotJvSooPwkGdT8-JTYAA=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/WxmWLrdBADvv03i1rr_iyE-G47XDyeAS0pWGFCmJtbaKinG7s3C5bBotJvSooPwkGdT8-JTYAA=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/WxmWLrdBADvv03i1rr_iyE-G47XDyeAS0pWGFCmJtbaKinG7s3C5bBotJvSooPwkGdT8-JTYAA=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "YA0qE89j1cLbA4A3InMhqxg7JwQ",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "GtP3LWjwMRs"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-01T17:45:00Z",
    //           "channelId": "UCx7J37QuXsGL7QG6SMIpqKg",
    //           "title": "How to Make Sure Your Emails DON&#39;T End Up in Promotions",
    //           "description": "Tired of your emails ending up in everyone's Promotions tab? Here's a quick tip on how to fix that...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/GtP3LWjwMRs/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/GtP3LWjwMRs/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/GtP3LWjwMRs/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "Brian Dean",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-01T17:45:00Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "iR7RBvXPNou5bYaC3gdnF2gO4hU",
    //       "id": "tFgJJd4ZrH_cPXK8dhc4oU0CknqsFGliFe8JIju_stI",
    //       "snippet": {
    //         "publishedAt": "2023-10-23T00:54:32.126406Z",
    //         "title": "ThePrimeagen",
    //         "description": "Vim - Rust - TypeScript",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UC8ENHE5xdFSwx71u3fDH5Xw"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKbwzM9mdpqpkRLwG-3-cVG3_DvnRoujnT-pVNGu=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKbwzM9mdpqpkRLwG-3-cVG3_DvnRoujnT-pVNGu=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/ytc/APkrFKbwzM9mdpqpkRLwG-3-cVG3_DvnRoujnT-pVNGu=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "c7wQfcXZ2k8zdUMPH76MBAfGtKk",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "6jPiuOXmxEc"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-08-03T14:09:29Z",
    //           "channelId": "UC8ENHE5xdFSwx71u3fDH5Xw",
    //           "title": "What You Need To Learn 2023 (as a software engineer)",
    //           "description": "Twitch Everything is built live on twitch Twitch : https://bit.ly/3xhFO3E Discord: discord.gg/ThePrimeagen Spotify DevHour: ...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/6jPiuOXmxEc/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/6jPiuOXmxEc/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/6jPiuOXmxEc/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "ThePrimeagen",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-08-03T14:09:29Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "tlLhlToZODvgFVZFylNN4EY2D_E",
    //       "id": "tFgJJd4ZrH9YsaWnVoLgcj5CLd7F4SfZf-EhN_0hFbw",
    //       "snippet": {
    //         "publishedAt": "2023-03-06T05:18:27.550904Z",
    //         "title": "Creative Crew with Brad Hussey",
    //         "description": "There are tons of web design videos and web design channels out there teaching you how to code and develop a website. But this channel is different. You don’t need understand code to build a beautiful and functional website. The solution? Using one of the best no-code website builders out right now: Wix Studio.\n\nMy name’s Brad Hussey. I'm a web designer and I’ve partnered with Wix to create an inspiring, educational, and world-class YouTube channel and community for professional web designers and design agencies who are mastering the art, business, and craft of web design. Alongside popular topics such as choosing fonts and layout design, we also delve into cutting-edge topics such as AI Web Design, ChatGPT, and Midjourney tutorials to help you build beautiful and functional websites with the latest tech.\n\nLearn how to make responsive websites and join us every week for new web designer tutorials, Wix Studio videos, and livestreams.\n\nJoin the Creative Crew: https://bit.ly/3I7yuNw",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UC0wUfjdwYM-BLPdBwZ-2Ofw"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/dtkuyX6a2Q-2nA4wzAVJ0ETCV_qe1YfLxQ62vXw6Gi-N9OINQ3bRHxV0t331gMC95uSwDiCl=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/dtkuyX6a2Q-2nA4wzAVJ0ETCV_qe1YfLxQ62vXw6Gi-N9OINQ3bRHxV0t331gMC95uSwDiCl=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/dtkuyX6a2Q-2nA4wzAVJ0ETCV_qe1YfLxQ62vXw6Gi-N9OINQ3bRHxV0t331gMC95uSwDiCl=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "Yho2ojrzBdtplJknfOQSMHgnrfM",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "3_PbcgaTWXo"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-06T20:30:00Z",
    //           "channelId": "UC0wUfjdwYM-BLPdBwZ-2Ofw",
    //           "title": "No Code? No Problem – Wix Makes Text Animations Easy",
    //           "description": "This no-code tool is the game-changer every web designer needs now! Brad Hussey showcases 5 of Wix Studio's best features!",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/3_PbcgaTWXo/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/3_PbcgaTWXo/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/3_PbcgaTWXo/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "Creative Crew with Brad Hussey",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-06T20:30:00Z"
    //         }
    //       }
    //     },
    //     {
    //       "kind": "youtube#subscription",
    //       "etag": "Cb6L837Hu9K1sm48hAan1fA7iAU",
    //       "id": "tFgJJd4ZrH9YsaWnVoLgctTqT5FW9X-v44IB5uwJIno",
    //       "snippet": {
    //         "publishedAt": "2023-03-05T19:58:51.001758Z",
    //         "title": "10X INCOME",
    //         "description": "Hey,👋 Please remember that making online money requires time and effort.",
    //         "resourceId": {
    //           "kind": "youtube#channel",
    //           "channelId": "UC1YBt7XX1NynB6gOOm06-BQ"
    //         },
    //         "channelId": "UCJV27jxA1TMWBw3Fk1FCDmQ",
    //         "thumbnails": {
    //           "default": {
    //             "url": "https://yt3.ggpht.com/zHdrmqMOhUJggACerhVi3rVDh5Y1KJPPgn1hI_vGDcftOoX8Wwd9mULh8j6pNCiiuLzhlr3APA=s88-c-k-c0x00ffffff-no-rj"
    //           },
    //           "medium": {
    //             "url": "https://yt3.ggpht.com/zHdrmqMOhUJggACerhVi3rVDh5Y1KJPPgn1hI_vGDcftOoX8Wwd9mULh8j6pNCiiuLzhlr3APA=s240-c-k-c0x00ffffff-no-rj"
    //           },
    //           "high": {
    //             "url": "https://yt3.ggpht.com/zHdrmqMOhUJggACerhVi3rVDh5Y1KJPPgn1hI_vGDcftOoX8Wwd9mULh8j6pNCiiuLzhlr3APA=s800-c-k-c0x00ffffff-no-rj"
    //           }
    //         }
    //       },
    //       "lastUploadedVideo": {
    //         "kind": "youtube#searchResult",
    //         "etag": "Fi5YECJtM3TAIfMxV3ofzQH2x7w",
    //         "id": {
    //           "kind": "youtube#video",
    //           "videoId": "30SEm4Y11UA"
    //         },
    //         "snippet": {
    //           "publishedAt": "2023-11-05T15:18:21Z",
    //           "channelId": "UC1YBt7XX1NynB6gOOm06-BQ",
    //           "title": "Easy AI Side Hustle for PASSIVE INCOME! ($100K)",
    //           "description": "My Products & Side Hustles List: https://10xincome.store/products/10x-secrets-27-ai-side-hustles-digital-products Join the ...",
    //           "thumbnails": {
    //             "default": {
    //               "url": "https://i.ytimg.com/vi/30SEm4Y11UA/default.jpg",
    //               "width": 120,
    //               "height": 90
    //             },
    //             "medium": {
    //               "url": "https://i.ytimg.com/vi/30SEm4Y11UA/mqdefault.jpg",
    //               "width": 320,
    //               "height": 180
    //             },
    //             "high": {
    //               "url": "https://i.ytimg.com/vi/30SEm4Y11UA/hqdefault.jpg",
    //               "width": 480,
    //               "height": 360
    //             }
    //           },
    //           "channelTitle": "10X INCOME",
    //           "liveBroadcastContent": "none",
    //           "publishTime": "2023-11-05T15:18:21Z"
    //         }
    //       }
    //     }
    //   ],
    //   "uploadedVideos": []
    // }

    // Summarize the YouTube data and save it to the account

    const summarizedData = await summarizeContent(youtubeData, rows[0].email);

    if (summarizedData) {
      summarizedData.timestamp = new Date().toISOString();
      await sql`UPDATE secondaryaccounts SET youtube_data = ${JSON.stringify(
        summarizedData
      )} WHERE account_id = ${rows[0].account_id}`;
      console.log("++++SAVED++++");
    }

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
