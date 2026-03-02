import Link from "next/link"
import { CheckCircle2, Leaf } from "lucide-react"
import { stripe } from "@/lib/stripe"
import sql from "@/lib/db"
import ShopSuccessShippingForm from "@/components/checkout/ShopSuccessShippingForm"

async function confirmOrder(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return null

    const { product_id, buyer_name, buyer_email } = session.metadata ?? {}
    if (!product_id) return null

    const productRows = await sql`SELECT * FROM products WHERE id = ${Number(product_id)} LIMIT 1`
    const product = productRows[0]
    if (!product) return null

    // Idempotency: check if order already exists
    const existing = await sql`
      SELECT id, requires_shipping, shipping_name FROM shop_orders
      WHERE stripe_session_id = ${sessionId} LIMIT 1
    `

    let orderId: number
    if (existing.length > 0) {
      orderId = existing[0].id
    } else {
      const inserted = await sql`
        INSERT INTO shop_orders (
          stripe_session_id, stripe_payment_intent_id,
          product_id, product_name, product_price,
          buyer_name, buyer_email, payment_status,
          requires_shipping, shipping_status
        ) VALUES (
          ${sessionId}, ${session.payment_intent as string | null},
          ${product.id}, ${product.name}, ${product.price},
          ${buyer_name ?? null}, ${session.customer_email ?? buyer_email ?? null},
          'completed',
          ${product.requires_shipping ?? true},
          ${product.requires_shipping ? 'waiting' : 'not_required'}
        )
        RETURNING id
      `
      orderId = inserted[0].id

      // Decrement stock
      if (product.stock_count !== null && product.stock_count > 0) {
        await sql`UPDATE products SET stock_count = stock_count - 1 WHERE id = ${product.id} AND stock_count > 0`
      }
    }

    return {
      orderId,
      productName: product.name,
      requiresShipping: product.requires_shipping ?? true,
      shippingAlreadySaved: existing.length > 0 && !!existing[0].shipping_name,
    }
  } catch (err) {
    console.error("[shop/success] Error:", err)
    return null
  }
}

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  const order = sessionId ? await confirmOrder(sessionId) : null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
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
          {order && (
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{order.productName}</span> のご購入が完了しました。
            </p>
          )}
        </div>

        {/* Shipping form if required */}
        {order && order.requiresShipping && !order.shippingAlreadySaved && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <ShopSuccessShippingForm orderId={order.orderId} />
          </div>
        )}

        {order && order.requiresShipping && order.shippingAlreadySaved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-bold text-green-800 text-sm">発送先は登録済みです</p>
            <p className="text-xs text-green-700 mt-1">準備が整い次第お届けします</p>
          </div>
        )}

        {(!order || !order.requiresShipping) && (
          <p className="text-muted-foreground text-sm leading-relaxed text-center mb-8">
            確認メールをお送りしましたのでご確認ください。
          </p>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/shop"
            className="w-full bg-ireland-green text-white font-bold py-3 rounded-xl text-sm hover:bg-ireland-green/90 transition-colors text-center"
          >
            ショップに戻る
          </Link>
          <Link
            href="/"
            className="w-full bg-card border border-border text-foreground font-bold py-3 rounded-xl text-sm hover:bg-muted transition-colors text-center"
          >
            クラウドファンディングページへ
          </Link>
        </div>
      </div>
    </div>
  )
}
