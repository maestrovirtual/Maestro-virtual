"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { sessionCookieOptions, USER_SESSION_COOKIE } from "@/lib/auth/session";

export async function logoutAction(
  localeOrFormData?: string | FormData
): Promise<void> {
  const rawLocale =
    localeOrFormData instanceof FormData
      ? localeOrFormData.get("locale")
      : localeOrFormData;

  const safeLocale =
    typeof rawLocale === "string" &&
    (routing.locales as readonly string[]).includes(rawLocale)
      ? rawLocale
      : routing.defaultLocale;

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, "", sessionCookieOptions(0));

  revalidatePath("/", "layout");
  redirect(`/${safeLocale}/login`);
}

