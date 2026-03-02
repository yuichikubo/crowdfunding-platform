"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Product
}

export default function ProductForm({ action, defaultValues }: Props) {
  return (
    <form action={action} className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div>
          <Label htmlFor="name" className="text-sm font-bold">商品名 <span className="text-destructive">*</span></Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} placeholder="例：Green Ireland Festival 2026 Tシャツ" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description" className="text-sm font-bold">商品説明</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ""} placeholder="商品の詳細説明..." className="mt-1.5 resize-none" />
        </div>
        <div>
          <Label htmlFor="image_url" className="text-sm font-bold">画像URL</Label>
          <Input id="image_url" name="image_url" defaultValue={defaultValues?.image_url ?? ""} placeholder="/images/product.jpg" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="category" className="text-sm font-bold">カテゴリ</Label>
          <Input id="category" name="category" defaultValue={defaultValues?.category ?? ""} placeholder="例：アパレル、グッズ、食品" className="mt-1.5" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-sm font-bold">価格（円） <span className="text-destructive">*</span></Label>
            <Input id="price" name="price" type="number" min={0} required defaultValue={defaultValues?.price} placeholder="5000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="stock_count" className="text-sm font-bold">在庫数（空白=無制限）</Label>
            <Input id="stock_count" name="stock_count" type="number" min={0} defaultValue={defaultValues?.stock_count ?? ""} placeholder="100" className="mt-1.5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            defaultChecked={defaultValues?.is_active ?? true}
            className="w-4 h-4 rounded border border-input accent-ireland-green"
          />
          <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">公開中（チェックを外すと非公開）</Label>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" className="rounded-xl" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Link>
        </Button>
        <Button type="submit" className="bg-ireland-green hover:bg-ireland-green/90 text-white rounded-xl">
          <Save className="w-4 h-4 mr-2" />
          保存する
        </Button>
      </div>
    </form>
  )
}
