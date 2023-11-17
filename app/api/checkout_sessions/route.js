import { NextResponse } from "next/server";
import stripePackage from "stripe";
import { sql } from "@vercel/postgres";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

async function createSession() {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: process.env.NEXT_PUBLIC_PRICE,
            quantity: 1,
          },
        ],
        mode: "subscription",
        return_url: `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}/return?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: { enabled: true },
      });

      return session
}

async function retrieveSession(sessionId, userEmail) {
  const session = await stripe.checkout.sessions.retrieve(
    sessionId
  );

  await sql`
    UPDATE Users
    SET is_subscribed = true,
        stripe_id = ${session.customer}
    WHERE email = ${userEmail}
  `;
  return session
}

async function POST(req) {
  try {
    const session = await createSession();

    return NextResponse.json(
      { clientSecret: session.client_secret },
      { status: 200 }
    );
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const user_email = searchParams.get('user_email');

  try {
    const session = await retrieveSession(sessionId, user_email);

    return NextResponse.json(
      {
        customer_email: session.customer_details.email,
        customer_id: session.customer,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: err.statusCode || 500,
      }
    );
  }
}

export { GET as GET, POST as POST };
