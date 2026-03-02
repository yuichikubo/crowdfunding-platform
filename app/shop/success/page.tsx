import Link from "next/link"
import { CheckCircle2, Leaf } from "lucide-react"

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  await searchParams

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-ireland-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-ireland-green" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 bg-ireland-gold rounded-lg flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-ireland-dark" />
          </div>
          <span className="font-black text-foreground text-sm">Green Ireland Festival Shop</span>
        </div>

        <h1 className="text-2xl font-black text-foreground mb-3">ご購入ありがとうございます！</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          ご購入が完了しました。確認メールをお送りしましたのでご確認ください。
          発送準備が整い次第、改めてご連絡いたします。
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="w-full bg-ireland-green text-white font-bold py-3 rounded-xl text-sm hover:bg-ireland-green/90 transition-colors"
          >
            ショップに戻る
          </Link>
          <Link
            href="/"
            className="w-full bg-card border border-border text-foreground font-bold py-3 rounded-xl text-sm hover:bg-muted transition-colors"
          >
            クラウドファンディングページへ
          </Link>
        </div>
      </div>
    </div>
  )
}
