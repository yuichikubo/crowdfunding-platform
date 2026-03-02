"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Loader2, Lock } from "lucide-react"
import { formatYen } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  description?: string
  image_url?: string
}

export default function ShopCheckoutForm({ product }: { product: Product }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("メールアドレスを入力してください。"); return }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          buyer_name: name,
          buyer_email: email,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "エラーが発生しました。")

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
      <h2 className="font-bold text-foreground">購入者情報</h2>

      <div className="p-4 bg-ireland-green/10 rounded-xl border border-ireland-green/20">
        <p className="text-sm text-muted-foreground">購入商品</p>
        <p className="font-bold text-foreground">{product.name}</p>
        <p className="text-2xl font-black text-ireland-green mt-1">{formatYen(product.price)}</p>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          メールアドレス <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">購入完了のご連絡をお送りします。</p>
      </div>

      <div>
        <Label htmlFor="name" className="text-sm font-medium">お名前</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎"
          className="mt-1"
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-ireland-green hover:bg-ireland-green/90 text-white font-black text-lg py-6 rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />処理中...</>
          ) : (
            <><CreditCard className="w-5 h-5 mr-2" />Stripeで支払いに進む — {formatYen(product.price)}</>
          )}
        </Button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Stripeによる安全な決済処理</span>
        </div>
      </div>
    </form>
  )
}
