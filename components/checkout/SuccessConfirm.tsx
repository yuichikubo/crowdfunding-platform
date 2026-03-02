// Server component: confirms payment with Stripe and updates DB immediately on page load
import { stripe } from "@/lib/stripe"
import sql from "@/lib/db"

interface Props {
  sessionId: string
}

export default async function SuccessConfirm({ sessionId }: Props) {
  try {
    // Verify payment directly with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return null

    const { campaign_id, reward_tier_id } = session.metadata ?? {}
    const amount = session.amount_total ?? 0
    const campaignId = parseInt(campaign_id ?? "0")
    const rewardTierId = reward_tier_id ? parseInt(reward_tier_id) : null

    if (!campaignId) return null

    // Check if already processed (idempotency guard)
    const existing = await sql`
      SELECT payment_status FROM pledges
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `

    if (existing[0]?.payment_status !== "completed") {
      // Mark pledge as completed
      await sql`
        UPDATE pledges
        SET
          payment_status = 'completed',
          stripe_payment_intent_id = ${session.payment_intent as string | null},
          updated_at = NOW()
        WHERE stripe_session_id = ${sessionId}
          AND payment_status != 'completed'
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

      // Update reward tier claimed count
      if (rewardTierId) {
        await sql`
          UPDATE reward_tiers
          SET claimed_count = claimed_count + 1, updated_at = NOW()
          WHERE id = ${rewardTierId}
        `
      }
    }
  } catch (err) {
    // Silent fail — webhook will handle it as fallback
    console.error("[SuccessConfirm] Error:", err)
  }

  // Renders nothing — purely a side-effect server component
  return null
}
