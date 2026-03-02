import { cookies } from "next/headers"
import sql from "./db"
import { AdminUser } from "./db"

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return null

  const result = await sql`
    SELECT au.id, au.email, au.name, au.role, au.created_at
    FROM admin_sessions s
    JOIN admin_users au ON au.id = s.admin_user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `
  return (result[0] as AdminUser) ?? null
}

export function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function calcProgress(current: number, goal: number): number {
  return Math.min(Math.round((current / goal) * 100), 100)
}

export function calcDaysLeft(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
