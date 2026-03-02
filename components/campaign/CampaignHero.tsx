import Image from "next/image"
import type { Campaign } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface Props {
  campaign: Campaign
}

export default function CampaignHero({ campaign }: Props) {
  return (
    <section className="relative">
      <div className="relative w-full h-72 md:h-96 lg:h-[480px] overflow-hidden">
        <Image
          src={campaign.hero_image_url || "/images/hero-festival.jpg"}
          alt={campaign.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ireland-dark/80 via-ireland-dark/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-3 bg-ireland-gold text-ireland-dark font-bold border-0">
              受付中
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black text-white text-balance leading-tight mb-3">
              {campaign.title}
            </h1>
            <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-2xl text-pretty">
              {campaign.short_description}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Calendar className="w-4 h-4 text-ireland-gold" />
                <span>2025年3月17日〜18日</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-4 h-4 text-ireland-gold" />
                <span>東京・お台場特設会場</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
