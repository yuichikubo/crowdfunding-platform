"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Truck, Loader2, MapPin } from "lucide-react"

interface Props {
  orderId: number
}

export default function ShopSuccessShippingForm({ orderId }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_postal_code: "",
    shipping_address: "",
    shipping_phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.shipping_name || !form.shipping_postal_code || !form.shipping_address) {
      setError("お名前・郵便番号・住所は必須です")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/shop/orders/${orderId}/shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("送信に失敗しました")
      setSubmitted(true)
    } catch {
      setError("送信に失敗しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="w-14 h-14 rounded-full bg-ireland-green/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-ireland-green" />
        </div>
        <p className="font-bold text-foreground">発送先を受け付けました</p>
        <p className="text-sm text-muted-foreground">ご入力いただいた住所に商品をお届けします。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Truck className="w-5 h-5 text-ireland-green shrink-0" />
        <span className="font-bold text-sm">発送先住所を入力してください</span>
      </div>
      <p className="text-xs text-muted-foreground">
        この商品はお手元へのお届けが必要です。発送先をご入力ください。
      </p>

      <div>
        <Label htmlFor="shipping_name" className="text-xs font-bold">
          お名前 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="shipping_name"
          name="shipping_name"
          value={form.shipping_name}
          onChange={handleChange}
          placeholder="山田 太郎"
          className="mt-1 rounded-xl"
          required
        />
      </div>

      <div>
        <Label htmlFor="shipping_postal_code" className="text-xs font-bold">
          郵便番号 <span className="text-destructive">*</span>
        </Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="shipping_postal_code"
            name="shipping_postal_code"
            value={form.shipping_postal_code}
            onChange={handleChange}
            placeholder="123-4567"
            className="pl-9 rounded-xl"
            maxLength={8}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="shipping_address" className="text-xs font-bold">
          住所 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="shipping_address"
          name="shipping_address"
          value={form.shipping_address}
          onChange={handleChange}
          placeholder="東京都渋谷区〇〇1-2-3 △△マンション101"
          className="mt-1 rounded-xl"
          required
        />
      </div>

      <div>
        <Label htmlFor="shipping_phone" className="text-xs font-bold">電話番号（任意）</Label>
        <Input
          id="shipping_phone"
          name="shipping_phone"
          value={form.shipping_phone}
          onChange={handleChange}
          placeholder="090-1234-5678"
          className="mt-1 rounded-xl"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-ireland-green hover:bg-ireland-green/90 text-white font-bold rounded-xl"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />送信中...</>
          : <><Truck className="w-4 h-4 mr-2" />発送先を登録する</>
        }
      </Button>
    </form>
  )
}
