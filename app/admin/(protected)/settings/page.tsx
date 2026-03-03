import sql from "@/lib/db"
import SiteSettingsForm from "@/components/admin/SiteSettingsForm"
import { Settings } from "lucide-react"

export default async function SiteSettingsPage() {
  const rows = await sql`SELECT key, value FROM site_settings`
  const settings: Record<string, string> = {}
  for (const row of rows) settings[row.key] = row.value

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-ireland-gold/20 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-ireland-gold" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">共通設定</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ロゴ・タイトルなどのサイト全体の設定</p>
        </div>
      </div>

      <SiteSettingsForm initial={settings} />
    </div>
  )
}
