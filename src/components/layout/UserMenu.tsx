"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { User, LogIn, LogOut, UserPlus, Calendar, Trophy } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Link } from "@/i18n/navigation";

interface UserMenuProps {
  readonly variant: "desktop" | "mobile";
  readonly onNavigate?: () => void;
}

export default function UserMenu({ variant, onNavigate }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations("Layout");

  if (!isLoaded) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    onNavigate?.();
  };

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (variant === "desktop") {
    return (
      <div className="flex items-center ml-4 pl-4 border-l border-white/20">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-2 text-white hover:text-betis-oro transition-colors rounded-lg hover:bg-white/10"
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-label={t("userMenuLabel")}
            >
              <User size={18} />
              <span className="font-heading font-medium text-sm">
                {user.firstName || t("defaultUserName")}
              </span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Trophy size={16} />
                    {t("adminLink")}
                  </Link>
                )}
                <Link
                  href="/trivia"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar size={16} />
                  {t("triviaLink")}
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  {t("signOut")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="flex items-center gap-1 px-3 py-2 text-white hover:text-betis-oro transition-colors font-heading font-medium text-sm"
            >
              <LogIn size={16} />
              <span className="hidden lg:inline">{t("signInShort")}</span>
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-1 bg-betis-oro text-scotland-navy px-4 py-2 rounded-lg hover:bg-oro-antique transition-colors font-heading font-bold text-sm"
            >
              <UserPlus size={16} />
              <span>{t("signUpShort")}</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      {user ? (
        <div className="space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
              onClick={onNavigate}
            >
              <Trophy size={20} />
              {t("adminLink")}
            </Link>
          )}
          <Link
            href="/trivia"
            className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
            onClick={onNavigate}
          >
            <Calendar size={20} />
            {t("triviaLink")}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-white hover:text-red-400 hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
          >
            <LogOut size={20} />
            {t("signOut")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Link
            href="/sign-in"
            className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
            onClick={onNavigate}
          >
            <LogIn size={20} />
            {t("signInLong")}
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-3 px-4 py-3 bg-betis-oro text-scotland-navy hover:bg-oro-antique rounded-xl transition-all font-heading font-bold"
            onClick={onNavigate}
          >
            <UserPlus size={20} />
            {t("signUpLong")}
          </Link>
        </div>
      )}
    </div>
  );
}
