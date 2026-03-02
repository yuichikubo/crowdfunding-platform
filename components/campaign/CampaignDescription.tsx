"use client"

import Image from "next/image"
import { useState } from "react"
import type { Campaign } from "@/lib/db"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryPhoto {
  id: number
  image_url: string
  caption: string
  sort_order: number
}

interface Performer {
  id: number
  name: string
  role: string
  bio: string
  image_url: string | null
  sort_order: number
}

interface Props {
  campaign: Campaign
  gallery: GalleryPhoto[]
  performers: Performer[]
}

export default function CampaignDescription({ campaign, gallery, performers }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length))
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % gallery.length))

  return (
    <div className="space-y-6 mb-6">

      {/* ─── イントロ ─── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="relative w-full h-56 md:h-72">
          <Image
            src={campaign.hero_image_url || "/images/hero-irish-bon-odori.jpg"}
            alt="メインビジュアル"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ireland-dark/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-ireland-gold text-xs font-bold uppercase tracking-widest mb-1">About This Project</p>
            <h2 className="text-white text-xl font-black text-balance leading-tight">
              日本×アイルランド、踊りで世界を繋ぐ
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            このプロジェクトは<strong className="text-foreground">「アイリッシュ盆踊り」</strong>を軸に、日本とアイルランドの文化を融合させた<strong className="text-foreground">グリーン アイルランド フェスティバル 2026</strong>の開催を実現するためのクラウドファンディングです。
          </p>
          <p>
            アイリッシュ盆踊りとは、アイルランドの伝統音楽・ダンスと日本の盆踊りを融合した新しい文化表現です。SNSで<strong className="text-ireland-green">累計1,000万再生</strong>を超え、日本中・世界で話題となっています。
          </p>
          <p>
            2026年3月15日（日）に東京で開催するフェスティバルでは、アイリッシュ盆踊りのステージパフォーマンスをはじめ、アイルランドの伝統音楽・ダンス・食文化を体感できるイベントを予定しています。
          </p>
        </div>
      </div>

      {/* ─── フォトギャラリー ─── */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-ireland-green inline-block" />
          フォトギャラリー
        </h2>
        {gallery.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">写真が登録されていません</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(i)}
                className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-ireland-green"
              >
                <Image
                  src={img.image_url}
                  alt={img.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ireland-dark/0 group-hover:bg-ireland-dark/40 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center leading-tight">
                    {img.caption}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── 出演者紹介 ─── */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-ireland-gold inline-block" />
          出演者紹介
        </h2>
        {performers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">出演者が登録されていません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {performers.map((p) => (
              <div key={p.id} className="rounded-xl overflow-hidden border border-border bg-muted/30">
                <div className="relative w-full h-52">
                  <Image
                    src={p.image_url || "/images/performer-ukon.jpg"}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ireland-dark/90 via-ireland-dark/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-ireland-gold text-xs font-bold uppercase tracking-wider mb-0.5">{p.role}</p>
                    <p className="text-white text-lg font-black">{p.name}</p>
                  </div>
                </div>
                {p.bio && (
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.bio}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 資金の使い道 ─── */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-ireland-green inline-block" />
          資金の使い道
        </h2>
        <div className="space-y-3">
          {[
            { label: "アーティスト出演費・招聘費用", percent: 40, color: "bg-ireland-green" },
            { label: "会場費・設備費", percent: 25, color: "bg-ireland-gold" },
            { label: "広報・マーケティング費", percent: 15, color: "bg-primary/60" },
            { label: "リターン製作・送料", percent: 15, color: "bg-secondary/70" },
            { label: "手数料・その他運営費", percent: 5, color: "bg-muted-foreground/40" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-foreground/80">{item.label}</span>
                <span className="font-bold text-foreground">{item.percent}%</span>
              </div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── イベント概要 ─── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="relative w-full h-44">
          <Image src="/images/festival-crowd.jpg" alt="フェスティバルの様子" fill className="object-cover" />
          <div className="absolute inset-0 bg-ireland-dark/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-xl font-black tracking-wide">イベント概要</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { label: "開催日", value: (campaign as any).event_date || "2026年3月15日（日）" },
            { label: "会場", value: (campaign as any).event_venue || "東京（詳細は支援者にご連絡）" },
            { label: "支援締切", value: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "詳細後日公開" },
          ].map((item) => (
            <div key={item.label} className="p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="font-bold text-sm text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Lightbox ─── */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="閉じる"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-black/40 rounded-full p-2"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="前へ"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            className="relative w-full max-w-3xl max-h-[80vh] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[lightbox].image_url}
              alt={gallery[lightbox].caption}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[75vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 text-center">
              <p className="text-white text-sm">{gallery[lightbox].caption}</p>
              <p className="text-white/50 text-xs mt-0.5">{lightbox + 1} / {gallery.length}</p>
            </div>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-black/40 rounded-full p-2"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="次へ"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
