import { CheckCircle, Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CampaignHeader from "@/components/campaign/CampaignHeader"
import SuccessConfirm from "@/components/checkout/SuccessConfirm"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <CampaignHeader />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        {/* Trigger server-side confirm and show result */}
        {session_id && <SuccessConfirm sessionId={session_id} />}

        <div className="w-20 h-20 bg-ireland-green/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-ireland-green" />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-3">
          ご支援ありがとうございます！
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-2">
          あなたの支援でGreen Ireland Festival 2026の実現に近づきました。
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          確認メールをお送りしますので、しばらくお待ちください。
        </p>

        <div className="bg-ireland-green/10 border border-ireland-green/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-ireland-gold fill-ireland-gold" />
            <span className="font-bold text-foreground">フェスティバルを一緒に作りましょう！</span>
          </div>
          <p className="text-sm text-muted-foreground">
            SNSでシェアして、さらに多くの方に広めてください。
          </p>
        </div>

        <Button
          className="w-full bg-ireland-green hover:bg-ireland-green/90 text-white font-bold rounded-xl"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            プロジェクトに戻る（金額反映済み）
          </Link>
        </Button>
      </main>
    </div>
  )
}
