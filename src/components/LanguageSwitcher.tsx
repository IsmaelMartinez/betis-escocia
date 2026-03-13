"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: "es" | "en") => {
    router.replace(pathname as any, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale("es")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "es"
            ? "bg-betis-oro text-scotland-navy font-bold"
            : "text-white/70 hover:text-white"
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-white/30">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "en"
            ? "bg-betis-oro text-scotland-navy font-bold"
            : "text-white/70 hover:text-white"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
