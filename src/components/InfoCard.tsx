import { ReactNode } from "react";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  hoverColor?: "betis-verde" | "betis-oro";
  iconBgColor?: string;
  patternClass?: string;
}

export default function InfoCard({
  icon,
  title,
  children,
  hoverColor = "betis-verde",
  iconBgColor = "bg-betis-verde",
  patternClass = "pattern-verdiblanco-diagonal-subtle",
}: InfoCardProps) {
  return (
    <div
      className={`group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-${hoverColor} transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden`}
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 ${patternClass} opacity-20`}
      />
      <div className="relative">
        <div
          className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
          {title}
        </h2>
        <div className="space-y-4 font-body text-gray-700">{children}</div>
      </div>
    </div>
  );
}
