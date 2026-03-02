import sql from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const campaign_id = searchParams.get("campaign_id")
  const rows = await sql`SELECT * FROM performers WHERE campaign_id = ${Number(campaign_id)} ORDER BY sort_order`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { campaign_id, name, role, bio, image_url, sort_order } = await request.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
  await sql`
    INSERT INTO performers (campaign_id, name, role, bio, image_url, sort_order, is_active)
    VALUES (${campaign_id}, ${name}, ${role || ""}, ${bio || ""}, ${image_url || null}, ${sort_order ?? 0}, true)
  `
  return NextResponse.json({ success: true })
}
