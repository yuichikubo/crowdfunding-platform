import { redirect } from "next/navigation"
import sql from "@/lib/db"
import ProductForm from "@/components/admin/ProductForm"

export default function NewProductPage() {
  async function createProduct(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number(formData.get("price"))
    const stock_count = formData.get("stock_count") ? Number(formData.get("stock_count")) : null
    const image_url = formData.get("image_url") as string
    const category = formData.get("category") as string
    const is_active = formData.get("is_active") === "on"

    await sql`
      INSERT INTO products (name, description, price, stock_count, image_url, category, is_active)
      VALUES (${name}, ${description || null}, ${price}, ${stock_count}, ${image_url || null}, ${category || null}, ${is_active})
    `
    redirect("/admin/products")
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">新規商品登録</h1>
        <p className="text-muted-foreground mt-1">フェスティバルグッズや商品を新しく登録します。</p>
      </div>
      <ProductForm action={createProduct} />
    </div>
  )
}
