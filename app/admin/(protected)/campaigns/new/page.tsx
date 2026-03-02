import { redirect } from "next/navigation"
import sql from "@/lib/db"
import CampaignForm from "@/components/admin/CampaignForm"

export default function NewCampaignPage() {
  async function createCampaign(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const short_description = formData.get("short_description") as string
    const description = formData.get("description") as string
    const goal_amount = Number(formData.get("goal_amount"))
    const start_date = formData.get("start_date") as string
    const end_date = formData.get("end_date") as string
    const status = formData.get("status") as string
    const hero_image_url = formData.get("hero_image_url") as string

    await sql`
      INSERT INTO campaigns (title, short_description, description, goal_amount, start_date, end_date, status, hero_image_url)
      VALUES (${title}, ${short_description}, ${description}, ${goal_amount}, ${start_date}, ${end_date}, ${status}, ${hero_image_url})
    `
    redirect("/admin/campaigns")
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">新規キャンペーン作成</h1>
        <p className="text-muted-foreground mt-1">クラウドファンディングキャンペーンを新しく作成します。</p>
      </div>
      <CampaignForm action={createCampaign} />
    </div>
  )
}
