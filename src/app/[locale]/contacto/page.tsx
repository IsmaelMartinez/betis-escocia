"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Send, Camera, MessageCircle, HelpCircle } from "lucide-react";
import {
  FormSuccessMessage,
  FormErrorMessage,
  FormLoadingMessage,
} from "@/components/MessageComponent";
import { useUser } from "@clerk/nextjs";
import LoadingSpinner from "@/components/LoadingSpinner";
import CulturalFusionHero from "@/components/hero/CulturalFusionHero";

import { FORM_TYPES as formTypes } from "@/lib/constants/contact";
import type { ContactFormType } from "@/lib/constants/contact";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  type: ContactFormType["id"];
  subject: string;
  message: string;
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const { user } = useUser();
  const formRef = useRef<HTMLDivElement>(null);
  const [isContactFeatureEnabled] = useState(true);
  const [loadingFeatureFlag] = useState(false);
  const [highlightFeatures] = useState<Record<string, boolean>>({
    general: true,
    rsvp: true,
    photo: true,
    whatsapp: true,
    feedback: true,
  });

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    type: "general",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const getTypeName = (id: string) => {
    const key = `type${id.charAt(0).toUpperCase() + id.slice(1)}` as any;
    return t(key);
  };
  const getTypeDesc = (id: string) => {
    const key = `type${id.charAt(0).toUpperCase() + id.slice(1)}Desc` as any;
    return t(key);
  };

  const getTranslatedDefaultSubject = (
    type: ContactFormData["type"],
  ): string => {
    switch (type) {
      case "rsvp":
        return t("defaultSubjectRsvp");
      case "photo":
        return t("defaultSubjectPhoto");
      case "whatsapp":
        return t("defaultSubjectWhatsapp");
      case "feedback":
        return t("defaultSubjectFeedback");
      default:
        return "";
    }
  };

  // Feature always enabled; no flag checks needed

  // Pre-populate form with user data when authenticated
  useEffect(() => {
    if (user) {
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || "";
      const userEmail = user.emailAddresses[0]?.emailAddress || "";

      setFormData((prev) => ({
        ...prev,
        name: prev.name || userName,
        email: prev.email || userEmail,
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type: ContactFormData["type"]) => {
    setFormData((prev) => ({
      ...prev,
      type,
      subject: getTranslatedDefaultSubject(type),
    }));
    // Scroll to form when type changes
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setFormData((prev) => ({
          ...prev,
          phone: "",
          type: "general",
          subject: "",
          message: "",
        }));
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error ?? t("errorMessage"));
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitStatus("error");
      setErrorMessage(t("connectionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = formTypes.find((type) => type.id === formData.type);

  const visibleFormTypes = formTypes.filter(
    (type) => !type.feature || highlightFeatures[type.id],
  );

  if (loadingFeatureFlag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label={t("loadingPage")} />
      </div>
    );
  }

  if (!isContactFeatureEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("pageUnavailable")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("pageDisabled")}
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">{t("tryLater")}</p>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-betis-verde hover:bg-betis-verde-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-betis-verde"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cultural Fusion Design */}
      <CulturalFusionHero containerClassName="max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <Send size={20} className="text-oro-bright" />
          <span className="text-white font-heading font-medium text-sm tracking-wide">
            {t("badge")}
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          {t("title")}
        </h1>

        <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
          {t("subtitle")}
        </p>
      </CulturalFusionHero>

      {/* Quick Contact Options */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-black text-center mb-12 text-scotland-navy uppercase tracking-tight">
            {t("whatDoYouNeed")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {formTypes.map((type) => {
              const Icon = type.icon;
              // Conditionally render based on feature flag
              if (type.feature && !highlightFeatures[type.id]) {
                return null;
              }
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`group relative bg-white rounded-2xl p-8 shadow-xl border transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden ${
                    formData.type === type.id
                      ? "border-betis-verde shadow-2xl"
                      : "border-gray-100 hover:border-betis-verde/50 hover:shadow-2xl"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
                  <div className="relative">
                    <div
                      className={`${type.color} w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2 text-scotland-navy uppercase tracking-wide">
                      {getTypeName(type.id)}
                    </h3>
                    <p className="font-body text-gray-700 text-sm">
                      {getTypeDesc(type.id)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section ref={formRef} className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              {selectedType && (
                <div
                  className={`${selectedType.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <selectedType.icon className="h-8 w-8 text-white" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedType ? getTypeName(selectedType.id) : t("formTitle")}
              </h3>
              <p className="text-gray-600">
                {selectedType
                  ? getTypeDesc(selectedType.id)
                  : t("formDescription")}
              </p>
            </div>

            {submitStatus === "success" && (
              <FormSuccessMessage
                title={t("successTitle")}
                message={t("successMessage")}
                className="mb-6"
              />
            )}

            {submitStatus === "error" && (
              <FormErrorMessage
                message={errorMessage || t("errorMessage")}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user && (
                  <div className="text-center mt-4 p-3 bg-betis-verde-light border border-betis-verde/20 rounded-lg col-span-full">
                    <p className="text-sm text-betis-verde-dark">
                      {t("connectedAs")} {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-betis-verde mt-1">
                      {t("autoFilled")}
                    </p>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                    placeholder={t("namePlaceholder")}
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                    placeholder={t("emailPlaceholder")}
                    data-testid="contact-email"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("phoneLabel")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                  placeholder={t("phonePlaceholder")}
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("subjectLabel")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                  placeholder={t("subjectPlaceholder")}
                  data-testid="contact-subject"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("messageLabel")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                  placeholder={t("messagePlaceholder")}
                  data-testid="contact-message"
                />
              </div>

              {/* Special instructions based on type */}
              {formData.type === "whatsapp" && (
                <div className="bg-betis-verde-light border border-betis-verde/20 rounded-lg p-4">
                  <p
                    className="text-betis-verde-dark text-sm"
                    dangerouslySetInnerHTML={{
                      __html: t.raw("whatsappNote"),
                    }}
                  />
                </div>
              )}

              {formData.type === "photo" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p
                    className="text-blue-800 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: t.raw("photoNote"),
                    }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-betis-verde hover:bg-betis-verde-dark disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 disabled:cursor-not-allowed"
                data-testid="submit-contact"
              >
                {isSubmitting ? (
                  <FormLoadingMessage
                    message={t("sending")}
                    className="text-white"
                  />
                ) : (
                  <>
                    <Send className="h-5 w-5 inline mr-2" />
                    {t("sendButton")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-black text-center mb-12 text-scotland-navy uppercase tracking-tight">
            {t("faqTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold mb-3 text-betis-verde-dark">
                  {t("faq1Question")}
                </h3>
                <p className="font-body text-gray-700">{t("faq1Answer")}</p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-3 text-betis-verde-dark">
                  {t("faq2Question")}
                </h3>
                <p className="font-body text-gray-700">{t("faq2Answer")}</p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-3 text-betis-verde-dark">
                  {t("faq3Question")}
                </h3>
                <p className="font-body text-gray-700">{t("faq3Answer")}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold mb-3 text-betis-verde-dark">
                  {t("faq4Question")}
                </h3>
                <p className="font-body text-gray-700">{t("faq4Answer")}</p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-3 text-betis-verde-dark">
                  {t("faq5Question")}
                </h3>
                <p className="font-body text-gray-700">{t("faq5Answer")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde" />
        <div className="absolute inset-0 pattern-verdiblanco-subtle opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-black mb-12 text-white uppercase tracking-tight">
            {t("otherContactTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <MessageCircle className="h-14 w-14 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-3 text-white uppercase tracking-wide">
                Facebook
              </h3>
              <p className="font-body mb-6 text-white/90">
                {t("facebookGroup")}
              </p>
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-betis-verde px-6 py-3 rounded-xl font-heading font-bold hover:bg-oro-bright hover:text-scotland-navy transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                {t("goToGroup")}
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Camera className="h-14 w-14 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-3 text-white uppercase tracking-wide">
                Instagram
              </h3>
              <p className="font-body mb-6 text-white/90">
                {t("instagramFollow")}
              </p>
              <a
                href="https://www.instagram.com/rbetisescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-betis-verde px-6 py-3 rounded-xl font-heading font-bold hover:bg-oro-bright hover:text-scotland-navy transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                {t("follow")}
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <HelpCircle className="h-14 w-14 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-3 text-white uppercase tracking-wide">
                {t("inPerson")}
              </h3>
              <p className="font-body mb-6 text-white/90">
                {t("inPersonLocation")}
              </p>
              <a
                href="https://maps.google.com/maps?q=The+Polwarth+Tavern+Edinburgh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-betis-verde px-6 py-3 rounded-xl font-heading font-bold hover:bg-oro-bright hover:text-scotland-navy transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                {t("viewMap")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
