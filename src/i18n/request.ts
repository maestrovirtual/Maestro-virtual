import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  const locale =
    requestedLocale &&
    routing.locales.includes(
      requestedLocale as (typeof routing.locales)[number]
    )
      ? requestedLocale
      : routing.defaultLocale;


  return {
    locale: locale,
    messages: (
      await import(
        `./dictionaries/${locale}.json`
      )
    ).default,
  };
});