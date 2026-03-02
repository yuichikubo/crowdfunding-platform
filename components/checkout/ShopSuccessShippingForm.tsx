"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Truck, Loader2, MapPin, Search } from "lucide-react"
import { usePostalCode } from "@/hooks/use-postal-code"

interface Props {
  orderId: number
}

export default function ShopSuccessShippingForm({ orderId }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [postal, setPostal] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [town, setTown] = useState("")
  const [building, setBuilding] = useState("")
  const [phone, setPhone] = useState("")

  const { lookupPostal, isLooking, lookupError } = usePostalCode((result) => {
    setPrefecture(result.prefecture)
    setCity(result.city)
    setTown(result.town)
  })

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9-]/g, "")
    setPostal(val)
    const digits = val.replace(/-/g, "")
    if (digits.length === 7) lookupPostal(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !postal || !prefecture || !city || !town) {
      setError("お名前・郵便番号・都道府県・市区町村・住所は必須です")
      return
    }
    setLoading(true)
    setError("")
    const fullAddress = `${prefecture}${city}${town}${building ? " " + building : ""}`
    try {
      const res = await fetch(`/api/shop/orders/${orderId}/shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_name: name,
          shipping_postal_code: postal,
          shipping_address: fullAddress,
          shipping_phone: phone,
        }),
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

      {/* お名前 */}
      <div>
        <Label htmlFor="s_name" className="text-xs font-bold">お名前 <span className="text-destructive">*</span></Label>
        <Input id="s_name" value={name} onChange={e => setName(e.target.value)} placeholder="山田 太郎" className="mt-1 rounded-xl" required />
      </div>

      {/* 郵便番号 */}
      <div>
        <Label htmlFor="s_postal" className="text-xs font-bold">郵便番号 <span className="text-destructive">*</span></Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          {isLooking
            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            : <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          }
          <Input
            id="s_postal"
            value={postal}
            onChange={handlePostalChange}
            placeholder="1234567（ハイフン不要）"
            className="pl-9 pr-9 rounded-xl"
            maxLength={8}
            required
          />
        </div>
        {lookupError && <p className="text-xs text-destructive mt-1">{lookupError}</p>}
        <p className="text-xs text-muted-foreground mt-1">7桁入力で住所を自動補完します</p>
      </div>

      {/* 都道府県 */}
      <div>
        <Label htmlFor="s_pref" className="text-xs font-bold">都道府県 <span className="text-destructive">*</span></Label>
        <Input id="s_pref" value={prefecture} onChange={e => setPrefecture(e.target.value)} placeholder="東京都" className="mt-1 rounded-xl" required />
      </div>

      {/* 市区町村 */}
      <div>
        <Label htmlFor="s_city" className="text-xs font-bold">市区町村 <span className="text-destructive">*</span></Label>
        <Input id="s_city" value={city} onChange={e => setCity(e.target.value)} placeholder="渋谷区" className="mt-1 rounded-xl" required />
      </div>

      {/* 住所（町名以降） */}
      <div>
        <Label htmlFor="s_town" className="text-xs font-bold">住所 <span className="text-destructive">*</span></Label>
        <Input id="s_town" value={town} onChange={e => setTown(e.target.value)} placeholder="道玄坂1丁目" className="mt-1 rounded-xl" required />
      </div>

      {/* 番地・建物名 */}
      <div>
        <Label htmlFor="s_building" className="text-xs font-bold">番地・建物名</Label>
        <Input id="s_building" value={building} onChange={e => setBuilding(e.target.value)} placeholder="2-3 〇〇マンション101号室" className="mt-1 rounded-xl" />
      </div>

      {/* 電話番号 */}
      <div>
        <Label htmlFor="s_phone" className="text-xs font-bold">電話番号（任意）</Label>
        <Input id="s_phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="090-1234-5678" className="mt-1 rounded-xl" />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-ireland-green hover:bg-ireland-green/90 text-white font-bold rounded-xl">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />送信中...</>
          : <><Truck className="w-4 h-4 mr-2" />発送先を登録する</>
        }
      </Button>
    </form>
  )
}
