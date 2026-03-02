"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Package, Loader2, MapPin, Search } from "lucide-react"
import { usePostalCode } from "@/hooks/use-postal-code"

interface Props {
  pledgeId: number
  rewardTitle: string
}

export default function ShippingForm({ pledgeId, rewardTitle }: Props) {
  const [name, setName] = useState("")
  const [postal, setPostal] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [town, setTown] = useState("")
  const [building, setBuilding] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

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
    setLoading(true)
    setError("")
    const fullAddress = `${prefecture}${city}${town}${building ? " " + building : ""}`
    try {
      const res = await fetch(`/api/pledges/${pledgeId}/shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_name: name,
          shipping_postal_code: postal,
          shipping_address: fullAddress,
          shipping_phone: phone,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "送信に失敗しました")
      }
      setSaved(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <p className="font-bold text-green-800">送付先を登録しました</p>
        <p className="text-sm text-green-700 mt-1">商品の準備ができ次第、発送いたします。</p>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-amber-700" />
        <p className="font-bold text-amber-800">引き換え品の送付先を入力してください</p>
      </div>
      <p className="text-sm text-amber-700 mb-5">
        選択されたリターン「<span className="font-semibold">{rewardTitle}</span>」は郵送が必要です。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* お名前 */}
        <div>
          <Label className="text-sm font-bold text-foreground">お名前 <span className="text-red-500">*</span></Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="山田 太郎" required className="mt-1 rounded-xl" />
        </div>

        {/* 郵便番号 */}
        <div>
          <Label className="text-sm font-bold text-foreground">郵便番号 <span className="text-red-500">*</span></Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            {isLooking
              ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              : <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            }
            <Input
              value={postal}
              onChange={handlePostalChange}
              placeholder="1234567（ハイフン不要）"
              required
              className="pl-9 pr-9 rounded-xl"
              maxLength={8}
            />
          </div>
          {lookupError && <p className="text-xs text-red-500 mt-1">{lookupError}</p>}
          <p className="text-xs text-muted-foreground mt-1">7桁入力で住所を自動補完します</p>
        </div>

        {/* 都道府県 */}
        <div>
          <Label className="text-sm font-bold text-foreground">都道府県 <span className="text-red-500">*</span></Label>
          <Input value={prefecture} onChange={e => setPrefecture(e.target.value)} placeholder="東京都" required className="mt-1 rounded-xl" />
        </div>

        {/* 市区町村 */}
        <div>
          <Label className="text-sm font-bold text-foreground">市区町村 <span className="text-red-500">*</span></Label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="渋谷区" required className="mt-1 rounded-xl" />
        </div>

        {/* 住所（町名以降） */}
        <div>
          <Label className="text-sm font-bold text-foreground">住所 <span className="text-red-500">*</span></Label>
          <Input value={town} onChange={e => setTown(e.target.value)} placeholder="道玄坂1丁目" required className="mt-1 rounded-xl" />
        </div>

        {/* 番地・建物名 */}
        <div>
          <Label className="text-sm font-bold text-foreground">番地・建物名</Label>
          <Input value={building} onChange={e => setBuilding(e.target.value)} placeholder="2-3 〇〇マンション101号室" className="mt-1 rounded-xl" />
        </div>

        {/* 電話番号 */}
        <div>
          <Label className="text-sm font-bold text-foreground">電話番号（任意）</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="090-1234-5678" className="mt-1 rounded-xl" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
          送付先を登録する
        </Button>
      </form>
    </div>
  )
}
