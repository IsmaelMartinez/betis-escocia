import { ReactNode } from 'react';

interface SidebarCardProps {
  children: ReactNode;
  bgColor?: string;
  borderColor?: string;
  patternClass?: string;
}

export default function SidebarCard({
  children,
  bgColor = 'bg-white',
  borderColor = 'border-gray-100',
  patternClass = 'pattern-verdiblanco-diagonal-subtle',
}: SidebarCardProps) {
  return (
    <div className={`relative ${bgColor} rounded-2xl shadow-xl border ${borderColor} p-6 overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-20 h-20 ${patternClass} opacity-20`} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
