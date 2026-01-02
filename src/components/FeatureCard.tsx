import { LucideIcon } from "lucide-react";

/**
 * Icon background color options from the design system
 */
type IconBgColor =
  | "bg-betis-verde"
  | "bg-betis-verde-dark"
  | "bg-betis-oro"
  | "bg-scotland-navy"
  | "bg-scotland-blue";

const iconBgColorClasses: Record<IconBgColor, string> = {
  "bg-betis-verde": "bg-betis-verde",
  "bg-betis-verde-dark": "bg-betis-verde-dark",
  "bg-betis-oro": "bg-betis-oro",
  "bg-scotland-navy": "bg-scotland-navy",
  "bg-scotland-blue": "bg-scotland-blue",
};

interface FeatureCardProps {
  icon: LucideIcon;
  /**
   * Background color for the icon circle.
   * Constrained to design system colors to ensure Tailwind JIT compilation.
   */
  iconBgColor?: IconBgColor;
  title: string;
  description: string;
}

/**
 * FeatureCard - Display a feature with icon, title, and description
 *
 * Features modern card styling with:
 * - Customizable icon with branded background colors
 * - Hover effects with border color change and scale animation
 * - Pattern overlay accent
 * - Responsive text sizing
 *
 * @example
 * <FeatureCard
 *   icon={Users}
 *   title="Reservamos Mesa"
 *   description="Con tu confirmación..."
 * />
 */
export default function FeatureCard({
  icon: Icon,
  iconBgColor = "bg-betis-verde",
  title,
  description,
}: FeatureCardProps) {
  const bgColorClass = iconBgColorClasses[iconBgColor];

  return (
    <div className="group relative bg-white rounded-2xl p-8 text-center shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
      <div className="relative">
        <div
          className={`w-16 h-16 ${bgColorClass} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-4 text-scotland-navy uppercase tracking-wide">
          {title}
        </h3>
        <p className="font-body text-gray-700">{description}</p>
      </div>
    </div>
  );
}
