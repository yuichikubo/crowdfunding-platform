import sql from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, Leaf } from "lucide-react"
import { formatYen } from "@/lib/utils"

async function getProducts() {
  return sql`SELECT * FROM products WHERE is_active = true ORDER BY id`
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ireland-dark border-b border-ireland-green/20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ireland-gold rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-ireland-dark" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">Green Ireland Festival</p>
              <p className="text-ireland-gold text-xs">オフィシャルショップ</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            クラファンページへ
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-ireland-green text-xs font-bold uppercase tracking-widest mb-2">Official Shop</p>
          <h1 className="text-3xl font-black text-foreground text-balance">グリーン アイルランド フェスティバル<br />オフィシャルグッズ</h1>
          <p className="text-muted-foreground text-sm mt-3">フェスティバルを盛り上げるオリジナルグッズをお届けします</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-foreground">現在販売中の商品はありません</p>
            <p className="text-sm text-muted-foreground mt-1">準備中です。しばらくお待ちください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="relative w-full aspect-square bg-muted">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  {product.stock_count !== null && product.stock_count <= 5 && product.stock_count > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      残り{product.stock_count}点
                    </div>
                  )}
                  {product.stock_count === 0 && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <span className="bg-muted-foreground text-white text-sm font-bold px-4 py-1.5 rounded-full">売り切れ</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-foreground line-clamp-2 leading-tight">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-black text-ireland-green">{formatYen(product.price)}</p>
                    {product.stock_count !== 0 && (
                      <Link
                        href={`/shop/checkout?product_id=${product.id}`}
                        className="text-xs bg-ireland-green text-white font-bold px-3 py-1.5 rounded-lg hover:bg-ireland-green/90 transition-colors"
                      >
                        購入する
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Green Ireland Festival. All rights reserved.</p>
        <Link href="/" className="text-ireland-green hover:underline mt-1 inline-block">クラウドファンディングページへ</Link>
      </footer>
    </div>
  )
}
