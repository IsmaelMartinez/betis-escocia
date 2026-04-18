"use client";

import { SignUp } from "@clerk/nextjs";
import { useLocale, useTranslations } from "next-intl";
import { hasFeature } from "@/lib/features/featureFlags";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function SignUpPage() {
  const isAuthEnabled = hasFeature("show-clerk-auth");
  const t = useTranslations("SignUp");
  const locale = useLocale();
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  if (!isAuthEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t("disabledTitle")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("disabledSubtitle")}
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <p className="text-gray-700 mb-4">{t("disabledContact")}</p>
              <p className="text-sm text-gray-500">{t("disabledHint")}</p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-betis-green hover:bg-betis-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-betis-green"
                >
                  {t("backHome")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("subtitle")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-betis-green hover:bg-betis-green/90 text-white",
                card: "shadow-none",
                headerTitle: "text-betis-black",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
                socialButtonsBlockButtonText: "text-gray-700",
                formFieldLabel: "text-betis-black",
                formFieldInput:
                  "border-gray-300 focus:border-betis-green focus:ring-betis-green",
                footerActionLink: "text-betis-green hover:text-betis-green/90",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500",
              },
              variables: {
                colorPrimary: "#00A651",
                colorText: "#1f2937",
                colorTextSecondary: "#6b7280",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#1f2937",
                borderRadius: "0.375rem",
              },
            }}
            fallbackRedirectUrl={`${prefix}/dashboard`}
          />
        </div>
      </div>
    </div>
  );
}
