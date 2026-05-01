import { type NextRequest, NextResponse } from "next/server";
import { db, githubAppConfig } from "@trst/db";
import { verifyInstallStateJwt } from "@/lib/install-state";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");
  const state = searchParams.get("state");

  if (!installationId || setupAction !== "install") {
    return NextResponse.redirect(new URL("/admin/github", req.url));
  }

  const stateCookie = req.cookies.get("install_state")?.value;
  if (!state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(new URL("/admin/github?error=invalid-state", req.url));
  }

  try {
    verifyInstallStateJwt(stateCookie);
  } catch {
    return NextResponse.redirect(new URL("/admin/github?error=invalid-state", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin/github?installed=1", req.url));
  res.cookies.delete("install_state");

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

  return res;
}
