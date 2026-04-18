"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Shield, Mail } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";

export default function GDPRPage() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("Gdpr");

  if (isSignedIn === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-betis-green/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-betis-green" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-betis-black mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("pageDescription")}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Card>
            <CardBody>
              <div className="flex justify-center mb-4">
                <Mail className="h-6 w-6 text-betis-green" />
              </div>
              <h3 className="font-semibold text-betis-black mb-2">
                {t("cardHeading")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{t("cardBody")}</p>
              <p className="text-xs text-gray-500 mb-4">
                {t("retentionNote")}
              </p>
              <a
                href="/contacto"
                className="text-betis-green hover:text-betis-green-dark font-medium"
              >
                {t("contactLink")}
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
