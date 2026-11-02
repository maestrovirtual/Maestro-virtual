import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getStaffUser, requireStaffApi } from "@/lib/auth/dal";
import { gmailConfig, GMAIL_SCOPES } from "@/lib/mail/gmail";

export async function GET() {
  const denied = await requireStaffApi();
  if (denied) return denied;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const config = gmailConfig();
  if (!config.clientId || !config.clientSecret || !config.redirectUri || !config.account) return NextResponse.json({ error: "Configura GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_ACCOUNT_EMAIL y GMAIL_OAUTH_REDIRECT_URI antes de conectar." }, { status: 503 });
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: "code", scope: GMAIL_SCOPES.join(" "), access_type: "offline", prompt: "consent", login_hint: config.account, state, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" });
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${search}`);
  response.cookies.set("mv_gmail_oauth", JSON.stringify({ state, verifier, staffId: staff.id, at: Date.now() }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/admin/mailbox/gmail/callback", maxAge: 600 });
  return response;
}
