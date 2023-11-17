import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { google } from "googleapis";
import OpenAI from "openai";
import { sendMail } from "@/service/mailService";
import crypto from 'crypto';

const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export const preferredRegion = "iad1";

export const maxDuration = 300;


  // Function to decrypt the token
function decryptToken(hash) {
    const algorithm = 'aes-256-ctr';
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO;
    const key = crypto.scryptSync(secretKey, 'salt', 32); // derive a 32-byte key from the secret key
  
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
  
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  
    return decrpyted.toString();
  }

// This function fetches YouTube data using the provided authentication credentials
async function fetchYoutubeData(auth) {
  // Create an OAuth2 client with the client ID, client secret, and redirect URI
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_ID,
    process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );
  const encryptedAccessToken = JSON.parse(auth.access_token);
  const encryptedRefreshToken = JSON.parse(auth.refresh_token);
  
  const accessToken = decryptToken(encryptedAccessToken);
  const refreshToken = decryptToken(encryptedRefreshToken);
  // Set the credentials on the OAuth2 client
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
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
      maxResults: 5,
    })
    .catch((err) => console.error("Error retrieving liked videos: " + err));
  data.likedVideos = likedVideosResponse.data.items;
console.log("========likedVideosResponse========",likedVideosResponse)
  // Fetch the user's subscriptions
  const subscriptionsResponse = await service.subscriptions
    .list({
      auth: oauth2Client,
      part: "snippet",
      mine: true,
      maxResults: 5,
    })
    .catch((err) => console.error("Error retrieving subscriptions: " + err));
  data.subscriptions = subscriptionsResponse.data.items;
  console.log("========subscriptionsResponse========",subscriptionsResponse)

  // For each subscription, fetch the last uploaded video
  for (let i = 0; i < data.subscriptions.length; i++) {
    const channelId = data.subscriptions[i].snippet.resourceId.channelId;
    // Fetch the channel's uploads playlist ID
    const channelResponse = await service.channels.list({
      auth: oauth2Client,
      part: "contentDetails",
      id: channelId,
    });
    console.log("========channelResponse========",channelResponse)

    const uploadsId =
      channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch the most recent video from the uploads playlist
    const uploadsResponse = await service.playlistItems.list({
      auth: oauth2Client,
      part: "snippet",
      playlistId: uploadsId,
      maxResults: 1,
    });
    console.log("========likedVideosResponse========",likedVideosResponse)

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

  await sendMail(parsed.email_newsletter, email)
  // Return the summary in JSON format
  return parsed;
}

// This function handles POST requests
export async function POST(request) {
  try {
    const { secondary_row } = await request.json();
    console.log("=========secondary_row=========", secondary_row);

    const youtubeData = await fetchYoutubeData({
      access_token: secondary_row.access_token,
      refresh_token: secondary_row.refresh_token,
    });
    console.log("=========youtubeData=========", youtubeData);
    const summarizedData = await summarizeContent(
      youtubeData,
      secondary_row.email
    );
    console.log("=========summarizedData=========", summarizedData);

    if (summarizedData) {
      summarizedData.timestamp = new Date().toISOString();
      await sql`UPDATE secondaryaccounts SET youtube_data = ${JSON.stringify(
        summarizedData
      )} WHERE account_id = ${secondary_row.account_id}`;
      console.log("++++SAVED++++");
    }else{
        throw new Error("failed summarized data creation")
    }

    // Return a successful response with the name and secondary ID
    return NextResponse.json(
      { data: { name: secondary_row.name, secondaryId: account_id } },
      { status: 200 }
    );
  } catch (error) {
    // If an error occurs, log the error and return an error response
    console.error("Error in POST function:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
