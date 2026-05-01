import { type NextRequest, NextResponse } from "next/server";
import { db, githubAppConfig } from "@trst/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");

  if (!installationId || setupAction !== "install") {
    return NextResponse.redirect(new URL("/admin/github", req.url));
  }

  await db
    .insert(githubAppConfig)
    .values({
      id: "singleton",
      installationId,
      installedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: githubAppConfig.id,
      set: {
        installationId,
        installedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  return NextResponse.redirect(new URL("/admin/github?installed=1", req.url));
}
