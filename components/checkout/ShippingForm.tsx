"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Package, Loader2, MapPin } from "lucide-react"

interface Props {
  pledgeId: number
  rewardTitle: string
}

export default function ShippingForm({ pledgeId, rewardTitle }: Props) {
  const [name, setName] = useState("")
  const [postal, setPostal] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/pledges/${pledgeId}/shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_name: name,
          shipping_postal_code: postal,
          shipping_address: address,
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
        <div>
          <Label className="text-sm font-medium text-foreground">お名前 <span className="text-red-500">*</span></Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="山田 太郎"
            required
            className="mt-1 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">郵便番号 <span className="text-red-500">*</span></Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={postal}
              onChange={e => setPostal(e.target.value.replace(/[^0-9-]/g, ""))}
              placeholder="123-4567"
              required
              className="pl-9 rounded-xl"
              maxLength={8}
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">住所 <span className="text-red-500">*</span></Label>
          <Input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="東京都渋谷区〇〇1-2-3 △△マンション101"
            required
            className="mt-1 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">電話番号（任意）</Label>
          <Input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="090-1234-5678"
            className="mt-1 rounded-xl"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
          送付先を登録する
        </Button>
      </form>
    </div>
  )
}
