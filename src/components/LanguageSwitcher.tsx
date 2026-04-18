"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");

  return (
    <label className="flex items-center gap-1.5 text-white text-xs sm:text-sm cursor-pointer">
      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-betis-oro" aria-hidden />
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(event) =>
          router.replace(pathname, { locale: event.target.value })
        }
        className="bg-transparent border border-white/20 rounded px-2 py-0.5 text-white text-xs focus:outline-none focus:border-betis-oro cursor-pointer"
        aria-label={t("label")}
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur} className="bg-scotland-navy text-white">
            {t(cur)}
          </option>
        ))}
      </select>
    </label>
  );
}
