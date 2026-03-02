import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import sql from "@/lib/db"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const {
      campaign_id,
      reward_tier_id,
      is_anonymous,
    } = session.metadata ?? {}

    const amount = session.amount_total ?? 0
    const campaignId = parseInt(campaign_id ?? "0")
    const rewardTierId = reward_tier_id ? parseInt(reward_tier_id) : null

    try {
      // Update pledge to completed
      await sql`
        UPDATE pledges
        SET
          payment_status = 'completed',
          stripe_payment_intent_id = ${session.payment_intent as string ?? null},
          updated_at = NOW()
        WHERE stripe_session_id = ${session.id}
      `

      // Update campaign totals
      await sql`
        UPDATE campaigns
        SET
          current_amount = current_amount + ${amount},
          supporter_count = supporter_count + 1,
          updated_at = NOW()
        WHERE id = ${campaignId}
      `

      // Update reward tier claimed count if applicable
      if (rewardTierId) {
        await sql`
          UPDATE reward_tiers
          SET claimed_count = claimed_count + 1, updated_at = NOW()
          WHERE id = ${rewardTierId}
        `
      }
    } catch (dbErr) {
      console.error("[webhook] DB update failed:", dbErr)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session
    await sql`
      UPDATE pledges SET payment_status = 'failed', updated_at = NOW()
      WHERE stripe_session_id = ${session.id} AND payment_status = 'pending'
    `
  }

  return NextResponse.json({ received: true })
}
