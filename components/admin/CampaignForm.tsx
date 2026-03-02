"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUploader from "@/components/admin/ImageUploader"
import type { Campaign } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Campaign
}

export default function CampaignForm({ action, defaultValues }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [imageUrl, setImageUrl] = useState<string>(defaultValues?.hero_image_url ?? "")

  const toDateInput = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toISOString().slice(0, 10)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    // Ensure the latest image URL from state is included
    fd.set("hero_image_url", imageUrl)
    startTransition(() => action(fd))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        {/* 日本語 */}
        <div className="pb-5 border-b border-border space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">日本語</p>
          <div>
            <Label htmlFor="title" className="text-sm font-bold">タイトル <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required defaultValue={defaultValues?.title} placeholder="例：Green Ireland Festival 2026 クラウドファンディング" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="short_description" className="text-sm font-bold">短い説明文 <span className="text-destructive">*</span></Label>
            <Input id="short_description" name="short_description" required defaultValue={defaultValues?.short_description} placeholder="一覧ページやSNSで表示される短い説明" className="mt-1.5" />
          </div>
        </div>
        {/* English */}
        <div className="pb-5 border-b border-border space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">English</p>
          <div>
            <Label htmlFor="title_en" className="text-sm font-bold">Title</Label>
            <Input id="title_en" name="title_en" defaultValue={(defaultValues as any)?.title_en ?? ""} placeholder="e.g. Green Ireland Festival 2026 Crowdfunding" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="short_description_en" className="text-sm font-bold">Short Description</Label>
            <Input id="short_description_en" name="short_description_en" defaultValue={(defaultValues as any)?.short_description_en ?? ""} placeholder="Short description for listing pages" className="mt-1.5" />
          </div>
        </div>
        {/* 한국어 */}
        <div className="pb-5 border-b border-border space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">한국어</p>
          <div>
            <Label htmlFor="title_ko" className="text-sm font-bold">제목</Label>
            <Input id="title_ko" name="title_ko" defaultValue={(defaultValues as any)?.title_ko ?? ""} placeholder="예: 그린 아일랜드 페스티벌 2026 크라우드펀딩" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="short_description_ko" className="text-sm font-bold">짧은 설명</Label>
            <Input id="short_description_ko" name="short_description_ko" defaultValue={(defaultValues as any)?.short_description_ko ?? ""} placeholder="목록 페이지에 표시되는 짧은 설명" className="mt-1.5" />
          </div>
        </div>
        {/* 中文 */}
        <div className="pb-5 border-b border-border space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">中文</p>
          <div>
            <Label htmlFor="title_zh" className="text-sm font-bold">标题</Label>
            <Input id="title_zh" name="title_zh" defaultValue={(defaultValues as any)?.title_zh ?? ""} placeholder="例: 绿色爱尔兰节 2026 众筹" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="short_description_zh" className="text-sm font-bold">简短说明</Label>
            <Input id="short_description_zh" name="short_description_zh" defaultValue={(defaultValues as any)?.short_description_zh ?? ""} placeholder="列表页面显示的简短说明" className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-sm font-bold">詳細説明（日本語）</Label>
          <Textarea id="description" name="description" rows={6} defaultValue={defaultValues?.description} placeholder="プロジェクトの詳細な説明文..." className="mt-1.5 resize-none" />
        </div>
        <ImageUploader
          name="hero_image_url"
          label="ヒーロー画像"
          defaultValue={defaultValues?.hero_image_url}
          onUrlChange={setImageUrl}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div>
          <Label htmlFor="goal_amount" className="text-sm font-bold">目標金額（円） <span className="text-destructive">*</span></Label>
          <Input id="goal_amount" name="goal_amount" type="number" min={1} required defaultValue={defaultValues?.goal_amount} placeholder="1000000" className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" className="text-sm font-bold">開始日 <span className="text-destructive">*</span></Label>
            <Input id="start_date" name="start_date" type="date" required defaultValue={toDateInput(defaultValues?.start_date)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="end_date" className="text-sm font-bold">終了日 <span className="text-destructive">*</span></Label>
            <Input id="end_date" name="end_date" type="date" required defaultValue={toDateInput(defaultValues?.end_date)} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="event_date" className="text-sm font-bold">イベント開催日（表示テキスト）</Label>
          <Input id="event_date" name="event_date" defaultValue={(defaultValues as any)?.event_date ?? ""} placeholder="例：2026年3月15日（日）" className="mt-1.5" />
          <p className="text-xs text-muted-foreground mt-1">メインページのイベント概要に表示されます</p>
        </div>
        <div>
          <Label htmlFor="event_venue" className="text-sm font-bold">開催会場（表示テキスト）</Label>
          <Input id="event_venue" name="event_venue" defaultValue={(defaultValues as any)?.event_venue ?? ""} placeholder="例：東京（詳細は支援者にご連絡）" className="mt-1.5" />
          <p className="text-xs text-muted-foreground mt-1">メインページのイベント概要に表示されます</p>
        </div>
        <div>
          <Label htmlFor="status" className="text-sm font-bold">ステータス</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "draft"}
            className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="draft">下書き</option>
            <option value="active">実施中</option>
            <option value="completed">終了</option>
            <option value="cancelled">中止</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" className="rounded-xl" asChild>
          <Link href="/admin/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Link>
        </Button>
        <Button type="submit" disabled={isPending} className="bg-ireland-green hover:bg-ireland-green/90 text-white rounded-xl">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isPending ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  )
}
