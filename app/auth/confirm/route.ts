import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const otpTypes: EmailOtpType[] = ["email", "invite", "magiclink", "recovery", "signup", "email_change"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next")?.startsWith("/") ? url.searchParams.get("next")! : "/";
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const supabase = await createClient();
  let error: Error | null = null;

  if (tokenHash && type && otpTypes.includes(type)) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else {
    error = new Error("The sign-in link is incomplete");
  }

  if (!error) return NextResponse.redirect(new URL(next, url.origin));
  console.error("[auth/confirm] sign-in confirmation failed", error.message);
  return NextResponse.redirect(new URL("/login?error=auth-confirmation-failed", url.origin));
}

