import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-black text-betis-green mb-4">404</h1>
          <h2 className="text-2xl font-bold text-betis-black mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 mb-8">{t("description")}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-betis-green/90 transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
