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
        <div>
          <Label htmlFor="title" className="text-sm font-bold">キャンペーンタイトル <span className="text-destructive">*</span></Label>
          <Input id="title" name="title" required defaultValue={defaultValues?.title} placeholder="例：Green Ireland Festival 2026 クラウドファンディング" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="short_description" className="text-sm font-bold">短い説明文 <span className="text-destructive">*</span></Label>
          <Input id="short_description" name="short_description" required defaultValue={defaultValues?.short_description} placeholder="一覧ページやSNSで表示される短い説明" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description" className="text-sm font-bold">詳細説明</Label>
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
