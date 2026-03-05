import sql from "@/lib/db"

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
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

  // Use Resend if available, otherwise log only
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log(`[email] Would send to ${to}\nSubject: ${renderedSubject}\n${renderedBody}`)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "noreply@greenirelandfes.atouch.dev",
      to,
      subject: renderedSubject,
      text: renderedBody,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[email] Resend error:", err)
  }
}
