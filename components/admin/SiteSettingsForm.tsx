"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUploader from "@/components/admin/ImageUploader"
import { Check, Save, CreditCard, Mail, Globe, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface Props {
  initial: Record<string, string>
}

export default function SiteSettingsForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  // サイト情報
  const [title, setTitle] = useState(initial.site_title ?? "")
  const [subtitle, setSubtitle] = useState(initial.site_subtitle ?? "")
  const [logoUrl, setLogoUrl] = useState(initial.logo_url ?? "")

  // Stripe — 設定済みなら masked 値を初期表示
  const MASKED = "••••••••••••••••"

  const stripeKeySaved = !!initial.stripe_secret_key
  const [stripeKey, setStripeKey] = useState(stripeKeySaved ? MASKED : "")
  const [showStripeKey, setShowStripeKey] = useState(false)
  const [stripeKeyEditing, setStripeKeyEditing] = useState(false)

  const stripePubKeySaved = !!initial.stripe_publishable_key
  const [stripePubKey, setStripePubKey] = useState(initial.stripe_publishable_key ?? "")

  const stripeWebhookSaved = !!initial.stripe_webhook_secret
  const [stripeWebhook, setStripeWebhook] = useState(stripeWebhookSaved ? MASKED : "")
  const [showStripeWebhook, setShowStripeWebhook] = useState(false)
  const [stripeWebhookEditing, setStripeWebhookEditing] = useState(false)

  // Gmail
  const gmailPassSaved = !!initial.gmail_app_password
  const [gmailUser, setGmailUser] = useState(initial.gmail_user ?? "")
  const [gmailPass, setGmailPass] = useState(gmailPassSaved ? MASKED : "")
  const [showGmailPass, setShowGmailPass] = useState(false)
  const [gmailPassEditing, setGmailPassEditing] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      const payload: Record<string, string> = {
        site_title: title,
        site_subtitle: subtitle,
        logo_url: logoUrl,
        gmail_user: gmailUser,
        stripe_publishable_key: stripePubKey,
      }
      // masked 値・空欄の場合は上書きしない（既存値を保持）
      if (stripeKey && stripeKey !== MASKED) payload.stripe_secret_key = stripeKey
      if (stripeWebhook && stripeWebhook !== MASKED) payload.stripe_webhook_secret = stripeWebhook
      if (gmailPass && gmailPass !== MASKED) payload.gmail_app_password = gmailPass

      await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setSaved(true)
      // 保存後は masked 表示に戻す
      if (stripeKey && stripeKey !== MASKED) { setStripeKey(MASKED); setStripeKeyEditing(false) }
      if (stripeWebhook && stripeWebhook !== MASKED) { setStripeWebhook(MASKED); setStripeWebhookEditing(false) }
      if (gmailPass && gmailPass !== MASKED) { setGmailPass(MASKED); setGmailPassEditing(false) }
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ロゴ */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-ireland-green" />
          <h2 className="font-bold text-foreground">ロゴ画像</h2>
        </div>
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
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-ireland-green" />
          <h2 className="font-bold text-foreground">サイト名・サブタイトル</h2>
        </div>
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

      {/* Stripe */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-ireland-green" />
          <h2 className="font-bold text-foreground">Stripe 決済設定</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="stripe_secret_key">
              Stripe シークレットキー
              {stripeKeySaved && (
                <span className="ml-2 text-xs text-ireland-green font-normal">設定済み</span>
              )}
            </Label>
            {stripeKeySaved && !stripeKeyEditing && (
              <button
                type="button"
                onClick={() => { setStripeKey(""); setStripeKeyEditing(true) }}
                className="text-xs text-ireland-green underline underline-offset-2"
              >
                変更する
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="stripe_secret_key"
              type={showStripeKey ? "text" : "password"}
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              readOnly={stripeKeySaved && !stripeKeyEditing}
              placeholder="sk_live_xxxxxxxxxxxx"
              className={`pr-10 font-mono text-sm ${stripeKeySaved && !stripeKeyEditing ? "bg-muted cursor-default select-none" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowStripeKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showStripeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Stripe ダッシュボード → 開発者 → APIキー から取得できます。本番環境では <code className="font-mono bg-muted px-1 rounded">sk_live_</code> で始まるキーを使用してください。
          </p>
        </div>

        {/* 公開キー */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="stripe_publishable_key">
              Stripe 公開キー（Publishable Key）
              {stripePubKeySaved && (
                <span className="ml-2 text-xs text-ireland-green font-normal">設定済み</span>
              )}
            </Label>
          </div>
          <Input
            id="stripe_publishable_key"
            type="text"
            value={stripePubKey}
            onChange={(e) => setStripePubKey(e.target.value)}
            placeholder="pk_live_xxxxxxxxxxxx"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            本番環境では <code className="font-mono bg-muted px-1 rounded">pk_live_</code> で始まるキーを使用してください。
          </p>
        </div>

        {/* Webhook シークレット */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="stripe_webhook_secret">
              Stripe Webhook シークレット
              {stripeWebhookSaved && (
                <span className="ml-2 text-xs text-ireland-green font-normal">設定済み</span>
              )}
            </Label>
            {stripeWebhookSaved && !stripeWebhookEditing && (
              <button
                type="button"
                onClick={() => { setStripeWebhook(""); setStripeWebhookEditing(true) }}
                className="text-xs text-ireland-green underline underline-offset-2"
              >
                変更する
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="stripe_webhook_secret"
              type={showStripeWebhook ? "text" : "password"}
              value={stripeWebhook}
              onChange={(e) => setStripeWebhook(e.target.value)}
              readOnly={stripeWebhookSaved && !stripeWebhookEditing}
              placeholder="whsec_xxxxxxxxxxxx"
              className={`pr-10 font-mono text-sm ${stripeWebhookSaved && !stripeWebhookEditing ? "bg-muted cursor-default select-none" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowStripeWebhook((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showStripeWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Stripe ダッシュボード → 開発者 → Webhook → エンドポイント → 署名シークレット から取得できます。
          </p>
        </div>
      </div>

      {/* Gmail */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-ireland-green" />
          <h2 className="font-bold text-foreground">メール送信設定（Gmail）</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          送信元・返信先アドレス: <code className="font-mono bg-muted px-1 rounded">greenirelandfes@iris-corp.co.jp</code>
        </p>
        <div className="space-y-2">
          <Label htmlFor="gmail_user">Gmail アカウント（GMAIL_USER）</Label>
          <Input
            id="gmail_user"
            type="email"
            value={gmailUser}
            onChange={(e) => setGmailUser(e.target.value)}
            placeholder="your-account@gmail.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">送信に使用する Gmail アドレスを入力してください</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gmail_app_password">
              Gmail アプリパスワード
              {gmailPassSaved && (
                <span className="ml-2 text-xs text-ireland-green font-normal">設定済み</span>
              )}
            </Label>
            {gmailPassSaved && !gmailPassEditing && (
              <button
                type="button"
                onClick={() => { setGmailPass(""); setGmailPassEditing(true) }}
                className="text-xs text-ireland-green underline underline-offset-2"
              >
                変更する
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="gmail_app_password"
              type={showGmailPass ? "text" : "password"}
              value={gmailPass}
              onChange={(e) => setGmailPass(e.target.value)}
              readOnly={gmailPassSaved && !gmailPassEditing}
              placeholder="xxxx xxxx xxxx xxxx"
              className={`pr-10 font-mono text-sm ${gmailPassSaved && !gmailPassEditing ? "bg-muted cursor-default select-none" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowGmailPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showGmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Google アカウント → セキュリティ → 2段階認証 → アプリパスワード から16桁のパスワードを取得してください
          </p>
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
