import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, message: "Stripe not configured." }, { status: 400 });
  }

  const signature = (await headers()).get("stripe-signature");
  const body = await request.text();
  if (!signature) {
    return NextResponse.json({ ok: false, message: "Missing signature." }, { status: 400 });
  }

  stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  return NextResponse.json({ ok: true });
}
