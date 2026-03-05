import Stripe from "stripe"
import "server-only"
import sql from "@/lib/db"

const STRIPE_API_VERSION = "2025-01-27.acacia" as const

// DB → 環境変数 の順でキーを解決して Stripe インスタンスを返す
// DB に設定があれば必ず DB 値を優先（管理画面から本番キーに切り替え可能）
export async function getStripe(): Promise<Stripe> {
  // 1. DB の site_settings を最優先で確認
  try {
    const rows = await sql`SELECT value FROM site_settings WHERE key = 'stripe_secret_key' LIMIT 1`
    const dbKey = rows[0]?.value
    if (dbKey) {
      return new Stripe(dbKey, { apiVersion: STRIPE_API_VERSION })
    }
  } catch {
    // DB 接続失敗時は環境変数にフォールバック
  }
  // 2. 環境変数にフォールバック
  if (process.env.STRIPE_SECRET_KEY) {
    return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION })
  }
  // 3. どちらも未設定
  throw new Error("Stripe シークレットキーが設定されていません。共通設定または環境変数 STRIPE_SECRET_KEY を設定してください。")
}
