import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    console.error("REVALIDATE_SECRET env var is not set");
    return NextResponse.json(
      { error: "Revalidation is not configured" },
      { status: 503 }
    );
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    revalidatePath("/");
    revalidatePath("/frameworks/[id]", "page");

    console.log(`[revalidate] paths revalidated at ${new Date().toISOString()}`);

    return NextResponse.json({
      revalidated: true,
      paths: ["/", "/frameworks/[id]"],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[revalidate] error:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
