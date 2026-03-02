import sql from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  await sql`
    UPDATE performers SET
      name = COALESCE(${body.name ?? null}, name),
      role = COALESCE(${body.role ?? null}, role),
      bio = COALESCE(${body.bio ?? null}, bio),
      image_url = CASE WHEN ${body.image_url !== undefined} THEN ${body.image_url || null} ELSE image_url END,
      is_active = COALESCE(${body.is_active ?? null}, is_active),
      updated_at = NOW()
    WHERE id = ${Number(id)}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await sql`DELETE FROM performers WHERE id = ${Number(id)}`
  return NextResponse.json({ success: true })
}
