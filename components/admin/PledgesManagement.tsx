"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Truck, MapPin, Package, Search } from "lucide-react"
import { formatYen } from "@/lib/utils"

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "完了", className: "bg-green-100 text-green-800 border-green-200" },
  pending:   { label: "保留中", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  failed:    { label: "失敗", className: "bg-red-100 text-red-800 border-red-200" },
  refunded:  { label: "返金済", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

const shippingStatusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  waiting:  { label: "発送待ち", className: "bg-orange-100 text-orange-800 border-orange-200", icon: <Package className="w-3 h-3" /> },
  shipped:  { label: "発送済み", className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Truck className="w-3 h-3" /> },
  delivered:{ label: "配達完了", className: "bg-green-100 text-green-800 border-green-200", icon: <MapPin className="w-3 h-3" /> },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface Pledge {
  id: number
  supporter_name: string | null
  supporter_email: string | null
  is_anonymous: boolean
  amount: number
  payment_status: string
  reward_title: string | null
  requires_shipping: boolean
  shipping_status: string | null
  shipping_name: string | null
  shipping_postal_code: string | null
  shipping_address: string | null
  shipping_phone: string | null
  created_at: string
}

interface Props {
  pledges: Pledge[]
  stats: { total_completed: number; count_completed: number; count_pending: number; count_shipping: number }
}

export default function PledgesManagement({ pledges: initialPledges, stats }: Props) {
  const [pledges, setPledges] = useState(initialPledges)
  const [search, setSearch] = useState("")
  const [editPledge, setEditPledge] = useState<Pledge | null>(null)
  const [shippingPledge, setShippingPledge] = useState<Pledge | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // edit form state
  const [editPaymentStatus, setEditPaymentStatus] = useState("")
  const [editShippingStatus, setEditShippingStatus] = useState("")

  // shipping form state
  const [shipName, setShipName] = useState("")
  const [shipPostal, setShipPostal] = useState("")
  const [shipAddress, setShipAddress] = useState("")
  const [shipPhone, setShipPhone] = useState("")

  const filtered = pledges.filter(p => {
    const q = search.toLowerCase()
    return (
      !q ||
      (p.supporter_name ?? "").toLowerCase().includes(q) ||
      (p.supporter_email ?? "").toLowerCase().includes(q) ||
      (p.reward_title ?? "").toLowerCase().includes(q) ||
      String(p.id).includes(q)
    )
  })

  const openEdit = (p: Pledge) => {
    setEditPledge(p)
    setEditPaymentStatus(p.payment_status)
    setEditShippingStatus(p.shipping_status ?? "")
  }

  const openShipping = (p: Pledge) => {
    setShippingPledge(p)
    setShipName(p.shipping_name ?? "")
    setShipPostal(p.shipping_postal_code ?? "")
    setShipAddress(p.shipping_address ?? "")
    setShipPhone(p.shipping_phone ?? "")
  }

  const handleUpdate = async () => {
    if (!editPledge) return
    setLoading(true)
    try {
      const body: Record<string, string> = { payment_status: editPaymentStatus }
      if (editShippingStatus) body.shipping_status = editShippingStatus
      const res = await fetch(`/api/admin/pledges/${editPledge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("更新失敗")
      setPledges(prev => prev.map(p =>
        p.id === editPledge.id
          ? { ...p, payment_status: editPaymentStatus, shipping_status: editShippingStatus || p.shipping_status }
          : p
      ))
      setEditPledge(null)
    } finally {
      setLoading(false)
    }
  }

  const handleShippingSave = async () => {
    if (!shippingPledge) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pledges/${shippingPledge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_name: shipName,
          shipping_postal_code: shipPostal,
          shipping_address: shipAddress,
          shipping_phone: shipPhone,
        }),
      })
      if (!res.ok) throw new Error("更新失敗")
      setPledges(prev => prev.map(p =>
        p.id === shippingPledge.id
          ? { ...p, shipping_name: shipName, shipping_postal_code: shipPostal, shipping_address: shipAddress, shipping_phone: shipPhone }
          : p
      ))
      setShippingPledge(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pledges/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("削除失敗")
      setPledges(prev => prev.filter(p => p.id !== deleteId))
      setDeleteId(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-2xl font-black text-ireland-green">{formatYen(Number(stats.total_completed))}</p>
          <p className="text-xs text-muted-foreground mt-1">完了済み総額</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-2xl font-black text-foreground">{stats.count_completed}件</p>
          <p className="text-xs text-muted-foreground mt-1">完了件数</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-2xl font-black text-yellow-600">{stats.count_pending}件</p>
          <p className="text-xs text-muted-foreground mt-1">保留中</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-2xl font-black text-orange-600">{stats.count_shipping}件</p>
          <p className="text-xs text-muted-foreground mt-1">発送待ち</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="名前・メール・リターン名・IDで検索..."
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">支援者</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">リターン</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">金額</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">決済</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">発送</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">日時</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pledge => {
                const ps = paymentStatusConfig[pledge.payment_status] ?? { label: pledge.payment_status, className: "bg-gray-100 text-gray-700" }
                const ss = pledge.shipping_status ? shippingStatusConfig[pledge.shipping_status] : null
                return (
                  <tr key={pledge.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">#{pledge.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground truncate max-w-[120px]">
                        {pledge.is_anonymous ? "匿名" : (pledge.supporter_name || "未設定")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{pledge.supporter_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{pledge.reward_title ?? "応援支援"}</p>
                      {pledge.requires_shipping && pledge.shipping_name && (
                        <p className="text-xs text-blue-600 truncate max-w-[140px]">
                          {pledge.shipping_postal_code} {pledge.shipping_address}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-ireland-green">{formatYen(pledge.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={`text-xs border ${ps.className}`}>{ps.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {pledge.requires_shipping ? (
                        ss ? (
                          <Badge className={`text-xs border flex items-center gap-1 w-fit mx-auto ${ss.className}`}>
                            {ss.icon}{ss.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">未登録</span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(pledge.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-lg"
                          onClick={() => openEdit(pledge)}
                          title="ステータス編集"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {pledge.requires_shipping && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openShipping(pledge)}
                            title="発送先編集"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(pledge.id)}
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-muted-foreground">該当する支援データがありません。</p>
          )}
        </div>
      </div>

      {/* Edit status dialog */}
      <Dialog open={!!editPledge} onOpenChange={v => !v && setEditPledge(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>支援 #{editPledge?.id} を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">決済ステータス</Label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">保留中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="failed">失敗</SelectItem>
                  <SelectItem value="refunded">返金済</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editPledge?.requires_shipping && (
              <div>
                <Label className="text-sm font-medium">発送ステータス</Label>
                <Select value={editShippingStatus} onValueChange={setEditShippingStatus}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting">発送待ち</SelectItem>
                    <SelectItem value="shipped">発送済み</SelectItem>
                    <SelectItem value="delivered">配達完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPledge(null)} className="rounded-xl">キャンセル</Button>
            <Button onClick={handleUpdate} disabled={loading} className="rounded-xl bg-ireland-green hover:bg-ireland-green/90 text-white">
              保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping address dialog */}
      <Dialog open={!!shippingPledge} onOpenChange={v => !v && setShippingPledge(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>発送先情報 — 支援 #{shippingPledge?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">お名前</Label>
              <Input value={shipName} onChange={e => setShipName(e.target.value)} className="mt-1 rounded-xl" placeholder="山田 太郎" />
            </div>
            <div>
              <Label className="text-sm font-medium">郵便番号</Label>
              <Input value={shipPostal} onChange={e => setShipPostal(e.target.value)} className="mt-1 rounded-xl" placeholder="123-4567" />
            </div>
            <div>
              <Label className="text-sm font-medium">住所</Label>
              <Input value={shipAddress} onChange={e => setShipAddress(e.target.value)} className="mt-1 rounded-xl" placeholder="東京都渋谷区..." />
            </div>
            <div>
              <Label className="text-sm font-medium">電話番号</Label>
              <Input value={shipPhone} onChange={e => setShipPhone(e.target.value)} className="mt-1 rounded-xl" placeholder="090-1234-5678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingPledge(null)} className="rounded-xl">キャンセル</Button>
            <Button onClick={handleShippingSave} disabled={loading} className="rounded-xl bg-ireland-green hover:bg-ireland-green/90 text-white">
              保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>支援 #{deleteId} を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              削除すると、キャンペーンの集計金額・支援者数も自動的に差し引かれます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
