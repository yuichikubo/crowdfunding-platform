"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUploader from "@/components/admin/ImageUploader"
import { Check, Save } from "lucide-react"
import Image from "next/image"

interface Props {
  initial: {
    site_title?: string
    site_subtitle?: string
    logo_url?: string
  }
}

export default function SiteSettingsForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState(initial.site_title ?? "")
  const [subtitle, setSubtitle] = useState(initial.site_subtitle ?? "")
  const [logoUrl, setLogoUrl] = useState(initial.logo_url ?? "")

  const handleSave = () => {
    startTransition(async () => {
      await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_title: title, site_subtitle: subtitle, logo_url: logoUrl }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* ロゴ */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-foreground">ロゴ画像</h2>
        {logoUrl && (
          <div className="relative w-32 h-16 rounded-xl overflow-hidden border border-border bg-muted">
            <Image src={logoUrl} alt="ロゴプレビュー" fill className="object-contain p-2" unoptimized />
          </div>
        )}
        <ImageUploader
          name="logo_url"
          label="ロゴ画像をアップロード"
          defaultValue={logoUrl}
          onUrlChange={setLogoUrl}
        />
        <p className="text-xs text-muted-foreground">推奨サイズ: 横長・透過PNG（例: 400×100px）</p>
      </div>

      {/* サイト名・サブタイトル */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-foreground">サイト名・サブタイトル</h2>
        <div className="space-y-2">
          <Label htmlFor="site_title">サイトタイトル</Label>
          <Input
            id="site_title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Green Ireland Festival"
          />
          <p className="text-xs text-muted-foreground">ブラウザタブ・ヘッダーに表示されます</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="site_subtitle">サブタイトル / キャッチコピー</Label>
          <Textarea
            id="site_subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="日本×アイルランドの文化融合フェスティバル"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">ヘッダーやOGPに表示されます</p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="bg-ireland-green hover:bg-ireland-green/90 text-white gap-2"
      >
        {saved ? (
          <><Check className="w-4 h-4" />保存しました</>
        ) : (
          <><Save className="w-4 h-4" />{isPending ? "保存中..." : "設定を保存"}</>
        )}
      </Button>
    </div>
  )
}
