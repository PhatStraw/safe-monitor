import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

async function fetchYoutubeData(auth) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_ID,
    process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    "http://localhost:3000"
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

  // Get uploaded videos
  // const uploadedVideosResponse = await service.search.list({
  //   auth: oauth2Client,
  //   part: "snippet",
  //   forMine: true,
  //   type: 'video',
  //   maxResults: 50,
  // }).catch(err => console.error("Error retrieving uploaded videos: " + err));
  // data.uploadedVideos = uploadedVideosResponse.data.items;

  // const activities = await service.activities.list({
  //   'part': 'snippet,contentDetails',
  //   'mine': true,
  //   'maxResults': '10',
  //   'key': process.env.API_KEY
  // }).catch(err => console.error("Error retrieving uploaded videos: " + err));
  // console.log(activities)

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

      await sql`UPDATE secondaryaccounts SET youtube_data = ${JSON.stringify(
        summarizedData
      )} WHERE account_id = ${rows[0].account_id}`;

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
