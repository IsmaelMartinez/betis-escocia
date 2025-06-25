'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, Eye, Package } from 'lucide-react';
import type { MerchandiseItem } from '@/types/community';

interface MerchandiseCardProps {
  readonly item: MerchandiseItem;
}

export default function MerchandiseCard({ item }: MerchandiseCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(item.colors?.[0] || '');

  const handleOrderClick = () => {
    // In a real implementation, this would open an order form or add to cart
    alert(`Funcionalidad de pedido para "${item.name}" estará disponible pronto. Por ahora, usa el formulario de contacto.`);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'clothing': return '👕 Ropa';
      case 'accessories': return '🧢 Accesorios';
      case 'collectibles': return '🏆 Coleccionables';
      default: return '🛍️ Producto';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-square relative overflow-hidden">
          {item.images.length > 0 ? (
            <Image
              src={item.images[selectedImageIndex]}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Featured Badge */}
          {item.featured && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3 bg-betis-green text-white px-2 py-1 rounded-full text-xs font-bold">
            {getCategoryLabel(item.category)}
          </div>

          {/* Image Indicators */}
          {item.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {item.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-black text-betis-green">
            £{item.price.toFixed(2)}
          </span>
        </div>

        {/* Size Selection */}
        {item.sizes && item.sizes.length > 0 && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Talla:
            </label>
            <div className="flex flex-wrap gap-1">
              {item.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                    selectedSize === size
                      ? 'border-betis-green bg-betis-green text-white'
                      : 'border-gray-300 text-gray-700 hover:border-betis-green'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {item.colors && item.colors.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Color:
            </label>
            <div className="flex flex-wrap gap-1">
              {item.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                    selectedColor === color
                      ? 'border-betis-green bg-betis-green text-white'
                      : 'border-gray-300 text-gray-700 hover:border-betis-green'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleOrderClick}
            disabled={!item.inStock}
            className="flex-1 bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {item.inStock ? 'Pedir' : 'Agotado'}
          </button>
          
          <button
            onClick={() => setShowDetails(true)}
            className="px-3 py-2 border border-betis-green text-betis-green hover:bg-betis-green hover:text-white rounded-lg transition-colors duration-200"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Stock Status */}
        {!item.inStock && (
          <div className="mt-2 text-center">
            <span className="text-xs text-red-600 font-medium">
              📦 Producto temporalmente agotado
            </span>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDetails(false)}></div>
            
            <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 text-left">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {item.images.length > 0 && (
                    <Image
                      src={item.images[selectedImageIndex]}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="w-full h-auto rounded-lg"
                    />
                  )}
                </div>
                
                <div>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-gray-900">Precio: </span>
                      <span className="text-2xl font-black text-betis-green">£{item.price.toFixed(2)}</span>
                    </div>
                    
                    <div>
                      <span className="font-bold text-gray-900">Categoría: </span>
                      <span className="text-gray-700">{getCategoryLabel(item.category)}</span>
                    </div>
                    
                    {item.sizes && item.sizes.length > 0 && (
                      <div>
                        <span className="font-bold text-gray-900">Tallas disponibles: </span>
                        <span className="text-gray-700">{item.sizes.join(', ')}</span>
                      </div>
                    )}
                    
                    {item.colors && item.colors.length > 0 && (
                      <div>
                        <span className="font-bold text-gray-900">Colores disponibles: </span>
                        <span className="text-gray-700">{item.colors.join(', ')}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-bold text-gray-900">Disponibilidad: </span>
                      <span className={item.inStock ? 'text-green-600' : 'text-red-600'}>
                        {item.inStock ? '✅ En stock' : '❌ Agotado'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleOrderClick}
                    disabled={!item.inStock}
                    className="w-full mt-6 bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-bold transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2 inline" />
                    {item.inStock ? 'Realizar Pedido' : 'Producto Agotado'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
