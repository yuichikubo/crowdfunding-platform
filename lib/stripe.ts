import Stripe from "stripe"
import "server-only"
import sql from "@/lib/db"

const STRIPE_API_VERSION = "2025-01-27.acacia" as const

export type StripeMode = "test" | "live"

// 現在の決済モード（test/live）と対応するキーセットを返す
export async function getStripeConfig(): Promise<{
  stripe: Stripe
  mode: StripeMode
  publishableKey: string
  webhookSecret: string
}> {
  console.log("[v0] getStripeConfig: Starting...")
  try {
    console.log("[v0] getStripeConfig: Fetching settings from DB...")
    const rows = await sql`
      SELECT key, value FROM site_settings
      WHERE key IN (
        'stripe_mode',
        'stripe_secret_key', 'stripe_publishable_key', 'stripe_webhook_secret',
        'stripe_test_secret_key', 'stripe_test_publishable_key', 'stripe_test_webhook_secret'
      )
    `
    console.log("[v0] getStripeConfig: Got rows:", rows?.length || 0)
    const s: Record<string, string> = {}
    for (const r of rows) s[r.key] = r.value
    console.log("[v0] getStripeConfig: Settings keys:", Object.keys(s))

    const mode: StripeMode = (s.stripe_mode as StripeMode) ?? "live"
    console.log("[v0] getStripeConfig: Mode:", mode)

    const secretKey = mode === "test"
      ? (s.stripe_test_secret_key || process.env.STRIPE_TEST_SECRET_KEY || "")
      : (s.stripe_secret_key || process.env.STRIPE_SECRET_KEY || "")

    const publishableKey = mode === "test"
      ? (s.stripe_test_publishable_key || process.env.STRIPE_TEST_PUBLISHABLE_KEY || "")
      : (s.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || "")

    const webhookSecret = mode === "test"
      ? (s.stripe_test_webhook_secret || process.env.STRIPE_TEST_WEBHOOK_SECRET || "")
      : (s.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || "")

    console.log("[v0] getStripeConfig: secretKey exists:", !!secretKey, "length:", secretKey?.length || 0)
    if (!secretKey) {
      throw new Error(`Stripe ${mode === "test" ? "テスト" : "本番"}シークレットキーが設定されていません。`)
    }
    console.log("[v0] getStripeConfig: Creating Stripe instance...")

    return {
      stripe: new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION }),
      mode,
      publishableKey,
      webhookSecret,
    }
  } catch (e: any) {
    console.error("[v0] getStripeConfig ERROR:", e?.message || e)
    // DB 接続失敗時は環境変数にフォールバック
    if (e.message?.includes("シークレットキーが設定されていません")) throw e
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("Stripe シークレットキーが設定されていません。")
    return {
      stripe: new Stripe(key, { apiVersion: STRIPE_API_VERSION }),
      mode: "live",
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    }
  }
}

// 後方互換: stripe インスタンスのみ必要な場合
export async function getStripe(): Promise<Stripe> {
  const { stripe } = await getStripeConfig()
  return stripe
}
