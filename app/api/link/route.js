import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const{code} = await request.json();
console.log(code)
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: "http://localhost:3000",
        grant_type: "authorization_code",
      });
  
      console.log('Request params:', params.toString()); // Log request params
  
      const tokenResponse = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
  
      console.log('Response status:', tokenResponse.status); // Log response status
  
      const data = await tokenResponse.json();
  
      console.log('Response data:', data); // Log response data
  
    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
