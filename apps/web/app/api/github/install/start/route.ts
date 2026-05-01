import { type NextRequest, NextResponse } from "next/server";
import { db, githubAppConfig } from "@trst/db";
import { createInstallStateJwt } from "@/lib/install-state";

export async function GET(req: NextRequest) {
  const [config] = await db
    .select({ appName: githubAppConfig.appName })
    .from(githubAppConfig)
    .limit(1);

  if (!config?.appName) {
    return NextResponse.redirect(new URL("/admin/github", req.url));
  }

  const token = createInstallStateJwt();
  const installUrl = new URL(`https://github.com/apps/${config.appName}/installations/new`);
  installUrl.searchParams.set("state", token);

  const res = NextResponse.redirect(installUrl);
  res.cookies.set("install_state", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/github/install",
  });
  return res;
}
