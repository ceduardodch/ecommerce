export async function GET() {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"

  try {
    const response = await fetch(`${toolsUrl}/feeds/meta/catalog.csv`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) throw new Error("catalog feed unavailable")
    const csv = await response.text()
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
      },
    })
  } catch {
    return new Response(
      "id,title,description,availability,condition,price,link,image_link,brand\n",
      {
        headers: {
          "content-type": "text/csv; charset=utf-8",
        },
      }
    )
  }
}
