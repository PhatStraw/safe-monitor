import { NextResponse } from "next/server";
import stripePackage from "stripe";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
      const { customerId } = await req.json();

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}/dashboard/profile`,
      });
      
      return NextResponse.json({ url: session.url });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ error: err.message });
    }
  }