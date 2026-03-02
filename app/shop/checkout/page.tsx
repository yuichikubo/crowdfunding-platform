import { Suspense } from "react"
import sql from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Leaf } from "lucide-react"
import { formatYen } from "@/lib/utils"
import ShopCheckoutForm from "@/components/checkout/ShopCheckoutForm"

async function getProduct(id: number) {
  const rows = await sql`SELECT * FROM products WHERE id = ${id} AND is_active = true LIMIT 1`
  return rows[0] ?? null
}

export default async function ShopCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product_id?: string }>
}) {
  const params = await searchParams
  const productId = params.product_id ? parseInt(params.product_id) : null

  if (!productId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">商品が指定されていません。</p>
          <Link href="/shop" className="text-ireland-green hover:underline text-sm">ショップに戻る</Link>
        </div>
      </div>
    )
  }

  const product = await getProduct(productId)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">商品が見つかりません。</p>
          <Link href="/shop" className="text-ireland-green hover:underline text-sm">ショップに戻る</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-ireland-dark border-b border-ireland-green/20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 bg-ireland-gold rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-ireland-dark" />
          </div>
          <div>
            <p className="font-black text-white text-sm leading-none">Green Ireland Festival</p>
            <p className="text-ireland-gold text-xs">オフィシャルショップ</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ショップに戻る
        </Link>

        <h1 className="text-2xl font-black text-foreground mb-6">購入手続き</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* 商品サマリー */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-4">
              <h2 className="font-bold text-foreground mb-4 text-sm">注文内容</h2>
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-muted">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">画像なし</div>
                )}
              </div>
              <p className="font-bold text-foreground text-sm mb-1">{product.name}</p>
              {product.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{product.description}</p>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">価格</span>
                  <span className="font-black text-ireland-green text-lg">{formatYen(product.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div className="md:col-span-3">
            <Suspense fallback={<div className="bg-card rounded-2xl border border-border p-6 animate-pulse h-64" />}>
              <ShopCheckoutForm product={product} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
