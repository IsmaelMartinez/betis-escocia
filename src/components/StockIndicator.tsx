'use client';

import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StockIndicatorProps {
  stock: number;
  maxStock?: number;
  showQuantity?: boolean;
  className?: string;
}

export default function StockIndicator({ 
  stock, 
  maxStock = 50, 
  showQuantity = true,
  className = '' 
}: StockIndicatorProps) {
  const getStockStatus = () => {
    if (stock === 0) return 'out';
    if (stock <= maxStock * 0.1) return 'low';
    if (stock <= maxStock * 0.3) return 'medium';
    return 'high';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-betis-verde bg-betis-verde-pale border-betis-verde/20';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'out': return <XCircle className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Package className="h-4 w-4" />;
      case 'high': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStockText = (status: string) => {
    switch (status) {
      case 'out': return 'Agotado';
      case 'low': return 'Pocas unidades';
      case 'medium': return 'Stock limitado';
      case 'high': return 'Disponible';
      default: return 'Sin información';
    }
  };

  const status = getStockStatus();
  const colorClass = getStockColor(status);
  const icon = getStockIcon(status);
  const text = getStockText(status);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${colorClass} ${className}`}>
      {icon}
      <span>{text}</span>
      {showQuantity && stock > 0 && (
        <span className="ml-1 font-bold">({stock})</span>
      )}
    </div>
  );
}
