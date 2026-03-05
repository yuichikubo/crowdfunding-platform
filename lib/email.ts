import nodemailer from "nodemailer"
import sql from "@/lib/db"

const FROM_ADDRESS = "greenirelandfes@iris-corp.co.jp"
const REPLY_TO_ADDRESS = "greenirelandfes@iris-corp.co.jp"

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
}

async function getGmailCredentials(): Promise<{ user: string; pass: string } | null> {
  // 環境変数 → DBの順でフォールバック
  const envUser = process.env.GMAIL_USER
  const envPass = process.env.GMAIL_APP_PASSWORD
  if (envUser && envPass) return { user: envUser, pass: envPass }

  const rows = await sql`SELECT key, value FROM site_settings WHERE key IN ('gmail_user', 'gmail_app_password')`
  const map: Record<string, string> = {}
  for (const row of rows) map[row.key] = row.value
  if (map.gmail_user && map.gmail_app_password) {
    return { user: map.gmail_user, pass: map.gmail_app_password }
  }
  return null
}

async function createTransporter() {
  const creds = await getGmailCredentials()
  if (!creds) return null

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: creds.user, pass: creds.pass },
  })
}

export async function sendTemplateEmail(
  slug: string,
  to: string,
  vars: Record<string, string>
): Promise<void> {
  const rows = await sql`
    SELECT subject, body FROM email_templates WHERE slug = ${slug} AND is_active = true LIMIT 1
  `
  if (!rows.length) return

  const { subject, body } = rows[0]
  const renderedSubject = renderTemplate(subject, vars)
  const renderedBody = renderTemplate(body, vars)

  const transporter = await createTransporter()

  if (!transporter) {
    console.log(`[email] Gmail credentials not set — skipping send.`)
    console.log(`[email] To: ${to} | Subject: ${renderedSubject}`)
    return
  }

  await transporter.sendMail({
    from: `"Green Ireland Festival" <${FROM_ADDRESS}>`,
    replyTo: REPLY_TO_ADDRESS,
    to,
    subject: renderedSubject,
    text: renderedBody,
  })
}

export async function sendRawEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<void> {
  const transporter = await createTransporter()

  if (!transporter) {
    console.log(`[email] Gmail credentials not set — skipping send.`)
    return
  }

  await transporter.sendMail({
    from: `"Green Ireland Festival" <${FROM_ADDRESS}>`,
    replyTo: REPLY_TO_ADDRESS,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  })
}
