'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Heart, Eye, Package, Truck } from 'lucide-react';
import MerchandiseCard from '@/components/MerchandiseCard';
import type { MerchandiseItem } from '@/types/community';

export default function TiendaPage() {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    fetchMerchandiseItems();
  }, []);

  const fetchMerchandiseItems = async () => {
    try {
      const response = await fetch('/api/merchandise');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todo', icon: '🛍️' },
    { id: 'clothing', name: 'Ropa', icon: '👕' },
    { id: 'accessories', name: 'Accesorios', icon: '🧢' },
    { id: 'collectibles', name: 'Coleccionables', icon: '🏆' }
  ];

  const filteredItems = items.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const featuredMatch = !showFeaturedOnly || item.featured;
    return categoryMatch && featuredMatch && item.inStock;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-betis-green to-green-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-black mb-4">
                Tienda Bética
              </h1>
              <p className="text-xl opacity-90">
                Productos oficiales de la Peña Bética Escocesa
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Package className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Productos Únicos</h3>
              <p className="text-sm opacity-90">Diseños exclusivos de la peña</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Heart className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Apoya la Peña</h3>
              <p className="text-sm opacity-90">Cada compra ayuda a los eventos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Truck className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Envío a UK</h3>
              <p className="text-sm opacity-90">Entrega en toda Escocia e Inglaterra</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-betis-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="h-5 w-5 text-betis-green border-gray-300 rounded focus:ring-betis-green"
              />
              <label htmlFor="featured" className="text-gray-700 font-medium flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Solo destacados
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-betis-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos disponibles</h3>
              <p className="text-gray-600">
                {selectedCategory !== 'all' || showFeaturedOnly
                  ? 'Prueba a cambiar los filtros o vuelve más tarde.'
                  : 'Estamos preparando nuestra tienda. ¡Vuelve pronto!'}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'} disponibles
                </h2>
                <p className="text-gray-600">
                  {selectedCategory !== 'all' && `Categoría: ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {showFeaturedOnly && ' • Solo productos destacados'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                  <MerchandiseCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Eye className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">¿No encuentras lo que buscas?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contáctanos y te ayudamos a encontrar el producto perfecto para mostrar tu pasión bética.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a
              href="/contacto"
              className="bg-white text-betis-green px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200"
            >
              📧 Formulario de Contacto
            </a>
            <a
              href="/galeria"
              className="border-2 border-white text-white hover:bg-white hover:text-betis-green px-6 py-3 rounded-lg font-bold transition-colors duration-200"
            >
              📸 Ver Fotos con Productos
            </a>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Información de Envío</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Envío gratuito en pedidos superiores a £30</li>
                <li>• Entrega en 3-5 días laborables en UK</li>
                <li>• Posibilidad de recogida en eventos de la peña</li>
                <li>• Seguimiento incluido en todos los envíos</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💚 Apoya la Peña</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Parte de las ventas se destina a eventos</li>
                <li>• Ayuda a mantener la actividad de la peña</li>
                <li>• Productos de calidad con diseños únicos</li>
                <li>• Muestra tu orgullo bético en Escocia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
