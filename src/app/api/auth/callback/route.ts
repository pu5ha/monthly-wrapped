import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, setSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }

  try {
    const session = await exchangeCode(code);
    await setSession(session);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
