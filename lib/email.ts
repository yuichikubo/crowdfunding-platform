import nodemailer from "nodemailer"
import sql from "@/lib/db"

const FROM_ADDRESS = "greenirelandfes@iris-corp.co.jp"
const REPLY_TO_ADDRESS = "greenirelandfes@iris-corp.co.jp"

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
}

function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}

export async function sendTemplateEmail(
  slug: string,
  to: string,
  vars: Record<string, string>
): Promise<void> {
  const result = await sql`
    SELECT subject, body FROM email_templates WHERE slug = ${slug} AND is_active = true LIMIT 1
  `
  if (!result.rows.length) return

  const { subject, body } = result.rows[0]
  const renderedSubject = renderTemplate(subject, vars)
  const renderedBody = renderTemplate(body, vars)

  const transporter = createTransporter()

  if (!transporter) {
    console.log(`[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping send.`)
    console.log(`[email] To: ${to} | Subject: ${renderedSubject}`)
    console.log(`[email] Body:\n${renderedBody}`)
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
  const transporter = createTransporter()

  if (!transporter) {
    console.log(`[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping send.`)
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
