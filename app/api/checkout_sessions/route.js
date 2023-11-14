import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function POST(req) {
  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: "price_1OCUKaAlSphatrSruZzmGbqf",
          quantity: 1,
        },
      ],
      mode: "subscription",
      return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
    });

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
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    return NextResponse.json(
      {
        customer_email: session.customer_details.email,
      },
      {
        status: session.status,
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
