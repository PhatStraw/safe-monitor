import { google } from 'googleapis';

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/oauth_callback"
  );

  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // You'd normally want to save these tokens in your database
    console.log(tokens);

    res.redirect('/');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).json({ error: "Error retrieving access token" });
  }
}
