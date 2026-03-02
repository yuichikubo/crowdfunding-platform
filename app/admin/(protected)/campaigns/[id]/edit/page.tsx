import { redirect, notFound } from "next/navigation"
import sql from "@/lib/db"
import type { Campaign } from "@/lib/db"
import CampaignForm from "@/components/admin/CampaignForm"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql<Campaign[]>`SELECT * FROM campaigns WHERE id = ${Number(id)} LIMIT 1`
  const campaign = rows[0]
  if (!campaign) notFound()

  async function updateCampaign(formData: FormData) {
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
      UPDATE campaigns SET
        title = ${title},
        short_description = ${short_description},
        description = ${description},
        goal_amount = ${goal_amount},
        start_date = ${start_date},
        end_date = ${end_date},
        status = ${status},
        hero_image_url = ${hero_image_url},
        updated_at = NOW()
      WHERE id = ${campaign.id}
    `
    redirect("/admin/campaigns")
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">キャンペーン編集</h1>
        <p className="text-muted-foreground mt-1 line-clamp-1">{campaign.title}</p>
      </div>
      <CampaignForm action={updateCampaign} defaultValues={campaign} />
    </div>
  )
}
