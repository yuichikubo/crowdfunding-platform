import type { Campaign } from "@/lib/db"

interface Props {
  campaign: Campaign
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="text-foreground/80 ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-foreground/80 leading-relaxed mb-4">')
    .replace(/^(?!<[hlp])(.+)/gm, '<p class="text-foreground/80 leading-relaxed mb-4">$1</p>')
}

export default function CampaignDescription({ campaign }: Props) {
  const html = parseMarkdown(campaign.description)

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <h2 className="text-xl font-bold text-foreground mb-5 pb-4 border-b border-border">
        プロジェクト詳細
      </h2>
      <div
        className="prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Funding usage visual */}
      <div className="mt-8 p-5 bg-ireland-light rounded-xl border border-border">
        <h3 className="font-bold text-foreground mb-4">資金の使い道</h3>
        <div className="space-y-3">
          {[
            { label: "アーティスト招聘費用・出演料", percent: 40, color: "bg-ireland-green" },
            { label: "会場費・設備費", percent: 25, color: "bg-ireland-gold" },
            { label: "広報・マーケティング", percent: 15, color: "bg-primary/70" },
            { label: "食材・飲料仕入れ", percent: 15, color: "bg-secondary/70" },
            { label: "運営費・その他", percent: 5, color: "bg-muted-foreground/50" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground/80">{item.label}</span>
                <span className="font-bold text-foreground">{item.percent}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event overview */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "開催日時", value: "2025年3月17日〜18日" },
          { label: "会場", value: "東京・お台場特設会場" },
          { label: "来場予定者数", value: "5,000人" },
        ].map((item) => (
          <div key={item.label} className="p-4 bg-muted rounded-xl text-center">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="font-bold text-sm text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
