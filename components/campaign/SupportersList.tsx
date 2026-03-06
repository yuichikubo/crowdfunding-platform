"use client"

import { formatYen } from "@/lib/utils"
import { Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Locale } from "date-fns"
import { ja, enUS, ko, zhCN } from "date-fns/locale"
import { useLanguage } from "@/components/LanguageProvider"
import { useEffect, useState } from "react"

interface Supporter {
  supporter_name: string | null
  amount: number
  message: string | null
  is_anonymous: boolean
  created_at: string
}

interface Props {
  supporters: Supporter[]
}

const dateLocales: Record<string, Locale> = { ja, en: enUS, ko, zh: zhCN }

function RelativeTime({ dateStr, locale }: { dateStr: string; locale: string }) {
  const [label, setLabel] = useState<string | null>(null)
  const dateLocale = dateLocales[locale] ?? ja

  useEffect(() => {
    setLabel(formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateLocale }))
    // 1分ごとに更新
    const id = setInterval(() => {
      setLabel(formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateLocale }))
    }, 60_000)
    return () => clearInterval(id)
  }, [dateStr, dateLocale])

  // SSR / ハイドレーション前は静的な日付を表示（ミスマッチ防止）
  if (label === null) {
    const d = new Date(dateStr)
    const formatted = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
    return <span className="text-xs text-muted-foreground">{formatted}</span>
  }

  return <span className="text-xs text-muted-foreground">{label}</span>
}

export default function SupportersList({ supporters }: Props) {
  const { t, locale } = useLanguage()

  if (supporters.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">{t("noSupporters")}</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-5 pb-4 border-b border-border flex items-center gap-2">
        <Heart className="w-5 h-5 text-ireland-gold fill-ireland-gold" />
        {t("supportersTitle")}
      </h2>
      <div className="space-y-4">
        {supporters.map((s, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${s.is_anonymous ? "bg-muted text-muted-foreground" : "bg-ireland-green/20 text-ireland-green"}`}>
              {s.is_anonymous ? "?" : (s.supporter_name?.charAt(0) ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className={`font-bold text-sm ${s.is_anonymous ? "text-muted-foreground italic" : "text-foreground"}`}>
                  {s.is_anonymous ? t("anonymous") : (s.supporter_name ?? t("anonymous"))}
                </span>
                <RelativeTime dateStr={s.created_at} locale={locale} />
              </div>
              <span className="text-ireland-green font-bold text-sm">{formatYen(s.amount)}</span>
              {s.message && (
                <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{s.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
