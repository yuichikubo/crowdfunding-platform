import Stripe from "stripe"
import "server-only"
import sql from "@/lib/db"

// モジュールレベルのデフォルトインスタンス（環境変数が設定されている場合）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder", {
  apiVersion: "2025-01-27.acacia",
})

// 環境変数 → DB の順でキーを解決して Stripe インスタンスを返す
export async function getStripe(): Promise<Stripe> {
  if (process.env.STRIPE_SECRET_KEY) return stripe
  const rows = await sql`SELECT value FROM site_settings WHERE key = 'stripe_secret_key' LIMIT 1`
  const key = rows[0]?.value
  if (!key) return stripe
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" })
}
