import { NextResponse } from 'next/server';
import { headers } from 'next/headers'
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const bodyParser = false;

export async function POST(request) {
  const payload = await request.text();
  const headerList = headers();
  const sig = headerList.get('Stripe-Signature')

  let event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.NEXT_PUBLIC_SIGNING_SECRET);
  } catch (err) {
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted' || event.type === 'invoice.paid') {
    const subscription = event.data.object;

    // Get the user by their stripeCustomerId
    const user = await sql`SELECT * FROM users WHERE stripe_id = ${subscription.customer}`;

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update the user's is_subscribed field based on the status of the subscription
    const is_subscribed = subscription.status === 'active' || event.type === 'invoice.paid';
    await sql`UPDATE users SET is_subscribed = ${is_subscribed} WHERE stripe_id = ${subscription.customer}`;

    return NextResponse.json({ message: 'Subscription status updated' }, { status: 200 });
  }

  return NextResponse.json({ message: 'Unhandled event type' }, { status: 400 });
}