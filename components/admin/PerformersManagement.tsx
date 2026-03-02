"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Plus, Trash2, Pencil, Eye, EyeOff, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUploader from "@/components/admin/ImageUploader"

interface Performer {
  id: number
  name: string
  role: string
  bio: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

interface Props {
  campaignId: number
  initialPerformers: Performer[]
}

const emptyForm = { name: "", role: "", bio: "", image_url: "" }

export default function PerformersManagement({ campaignId, initialPerformers }: Props) {
  const [performers, setPerformers] = useState<Performer[]>(initialPerformers)
  const [isPending, startTransition] = useTransition()
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  const reload = async () => {
    const res = await fetch(`/api/admin/performers?campaign_id=${campaignId}`)
    if (res.ok) setPerformers(await res.json())
  }

  const handleAdd = () => {
    if (!form.name) return
    startTransition(async () => {
      await fetch("/api/admin/performers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId, ...form, sort_order: performers.length }),
      })
      setForm(emptyForm)
      setAddMode(false)
      await reload()
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm("この出演者を削除しますか？")) return
    startTransition(async () => {
      await fetch(`/api/admin/performers/${id}`, { method: "DELETE" })
      await reload()
    })
  }

  const handleToggle = (id: number, current: boolean) => {
    startTransition(async () => {
      await fetch(`/api/admin/performers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      })
      await reload()
    })
  }

  const startEdit = (p: Performer) => {
    setEditingId(p.id)
    setEditForm({ name: p.name, role: p.role, bio: p.bio, image_url: p.image_url || "" })
  }

  const handleUpdate = (id: number) => {
    startTransition(async () => {
      await fetch(`/api/admin/performers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      setEditingId(null)
      await reload()
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">出演者管理</h1>
          <p className="text-sm text-muted-foreground mt-1">メインページの出演者紹介セクションを管理します</p>
        </div>
        <Button onClick={() => setAddMode(true)} disabled={addMode} className="bg-ireland-green hover:bg-ireland-green/90">
          <Plus className="w-4 h-4 mr-2" />
          出演者を追加
        </Button>
      </div>

      {/* 追加フォーム */}
      {addMode && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-bold text-foreground">新しい出演者を追加</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">名前 <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：孝藤右近" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">役割・肩書き</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="例：日本舞踊" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">プロフィール</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="出演者の紹介文を入力" className="mt-1.5" rows={3} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">プロフィール写真</Label>
            <ImageUploader name="image_url" label="プロフィール写真" currentUrl={form.image_url} onUrlChange={(url) => setForm({ ...form, image_url: url })} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} disabled={!form.name || isPending} className="bg-ireland-green hover:bg-ireland-green/90">追加する</Button>
            <Button variant="outline" onClick={() => { setAddMode(false); setForm(emptyForm) }}>キャンセル</Button>
          </div>
        </div>
      )}

      {/* 出演者一覧 */}
      {performers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
          <p className="font-medium">出演者が登録されていません</p>
          <p className="text-sm mt-1">「出演者を追加」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {performers.map((p) => (
            <div key={p.id} className={`bg-card border rounded-2xl overflow-hidden ${!p.is_active ? "opacity-50 border-border" : "border-border"}`}>
              {editingId === p.id ? (
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground">編集中</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">名前</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">役割</Label>
                      <Input value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">プロフィール</Label>
                    <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="mt-1.5" rows={3} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">写真</Label>
                    <ImageUploader name="image_url" label="プロフィール写真" currentUrl={editForm.image_url} onUrlChange={(url) => setEditForm({ ...editForm, image_url: url })} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => handleUpdate(p.id)} disabled={isPending} className="bg-ireland-green hover:bg-ireland-green/90">
                      <Check className="w-4 h-4 mr-1" /> 保存
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 mr-1" /> キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-black">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-ireland-gold font-bold uppercase tracking-wider">{p.role}</p>
                        <p className="font-black text-foreground text-lg">{p.name}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleToggle(p.id, p.is_active)} className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title={p.is_active ? "非表示" : "表示"}>
                          {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? "bg-ireland-green/10 text-ireland-green" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "表示中" : "非表示"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
