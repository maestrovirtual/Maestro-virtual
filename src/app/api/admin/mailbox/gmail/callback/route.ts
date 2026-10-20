import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { getStaffUser, requireStaffApi } from "@/lib/auth/dal";
import { encryptGmailToken, gmailConfig, gmailRequest, googleToken, GMAIL_SCOPES } from "@/lib/mail/gmail";

export async function GET(request: Request) {
  const denied = await requireStaffApi();
  if (denied) return denied;
  const config = gmailConfig();
  if (!config.redirectUri) return NextResponse.json({ error: "Falta configurar GMAIL_OAUTH_REDIRECT_URI" }, { status: 503 });
  const finish = (result: string) => {
    const target = new URL("/es/admin/mensajes", config.redirectUri);
    target.searchParams.set("gmail", result);
    const response = NextResponse.redirect(target);
    response.cookies.set("mv_gmail_oauth", "", { path: "/api/admin/mailbox/gmail/callback", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    return response;
  };
  try {
    const staff = await getStaffUser();
    const cookie = (await cookies()).get("mv_gmail_oauth")?.value;
    const state = cookie ? JSON.parse(cookie) : null;
    const search = new URL(request.url).searchParams;
    const provided = search.get("state") || "";
    if (!staff || !state || state.staffId !== staff.id || typeof state.state !== "string" || typeof state.verifier !== "string" || !Number.isFinite(state.at) || Date.now() - state.at > 600000 || Date.now() < state.at || provided.length !== state.state.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(state.state))) return finish("invalid_state");
    if (search.has("error") || !search.get("code")) return finish("cancelled");
    const tokens = await googleToken({ grant_type: "authorization_code", code: search.get("code")!, redirect_uri: config.redirectUri, code_verifier: state.verifier });
    if (!tokens.refresh_token || !GMAIL_SCOPES.every(scope => (tokens.scope || "").split(" ").includes(scope))) return finish("missing_permissions");
    const profile = await gmailRequest<{ emailAddress: string; historyId: string }>(tokens.access_token, "/profile");
    if (profile.emailAddress.toLowerCase() !== config.account) return finish("wrong_account");
    await prisma.contactMailbox.upsert({ where: { id: "institution" }, create: { id: "institution", email: profile.emailAddress.toLowerCase(), connectedBy: staff.id, encryptedRefreshToken: encryptGmailToken(tokens.refresh_token, randomBytes(12)), historyId: null }, update: { email: profile.emailAddress.toLowerCase(), connectedBy: staff.id, encryptedRefreshToken: encryptGmailToken(tokens.refresh_token, randomBytes(12)), historyId: null, nextPageToken: null, recoveryCursor: null, recoveryHistoryId: null, lastError: null, leaseUntil: null } });
    return finish("connected");
  } catch (error) {
    console.error("No se pudo conectar Gmail:", error instanceof Error ? error.name : "Error");
    return finish("connection_failed");
  }
}
