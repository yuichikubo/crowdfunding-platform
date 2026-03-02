"use client"

import { Leaf } from "lucide-react"

export default function CampaignHeader() {
  return (
    <header className="bg-ireland-dark text-white py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ireland-gold rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-ireland-dark" />
          </div>
          <span className="font-bold text-lg tracking-tight">Green Ireland Festival</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/60">クラウドファンディング</span>
        </div>
      </div>
    </header>
  )
}
