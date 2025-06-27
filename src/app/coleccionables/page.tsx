'use client';

import { useState, useEffect } from 'react';
import { Star, Package, MapPin, Vote, ShoppingBag, Calendar } from 'lucide-react';
import MerchandiseCard from '@/components/MerchandiseCard';
import OrderForm from '@/components/OrderForm';
import CollectionPointsGuide from '@/components/CollectionPointsGuide';
import type { MerchandiseItem } from '@/types/community';
import Image from 'next/image';

interface VotingOption {
  id: string;
  name: string;
  description: string;
  image: string;
  votes: number;
}

interface VotingData {
  voting: {
    active: boolean;
    totalVotes: number;
    endDate: string;
    options: VotingOption[];
  };
  preOrders: {
    active: boolean;
    totalOrders: number;
    endDate: string;
    minimumOrders: number;
    orders: unknown[];
  };
  stats: {
    lastUpdated: string;
    totalInteractions: number;
  };
}

export default function ColeccionablesPage() {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [votingData, setVotingData] = useState<VotingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [selectedPreOrderItem, setSelectedPreOrderItem] = useState<MerchandiseItem | null>(null);

  useEffect(() => {
    fetchColeccionables();
    fetchVotingData();
  }, []);

  useEffect(() => {
    if (votingData?.voting.active) {
      const interval = setInterval(() => {
        const end = new Date(votingData.voting.endDate).getTime();
        const now = Date.now();
        const diff = end - now;
        if (diff <= 0) {
          setTimeLeft('00:00:00');
          clearInterval(interval);
        } else {
          const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
          const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
          const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
          setTimeLeft(`${h}:${m}:${s}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [votingData]);

  const fetchColeccionables = async () => {
    try {
      const response = await fetch('/api/merchandise');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items ?? []);
      }
    } catch (error) {
      console.error('Error fetching coleccionables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingData = async () => {
    try {
      const response = await fetch('/api/camiseta-voting');
      if (response.ok) {
        const data = await response.json();
        setVotingData(data);
      }
    } catch (error) {
      console.error('Error fetching voting data:', error);
    }
  };

  const filteredItems = selectedType === 'all' 
    ? items 
    : items.filter(item => item.category === selectedType);

  const types = [
    { id: 'all', name: 'Todos', icon: ShoppingBag },
    { id: 'collectibles', name: 'Bufanda', icon: Star },
    { id: 'clothing', name: 'Camiseta', icon: Package },
    { id: 'accessories', name: 'Accesorios', icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">Cargando coleccionables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🟢⚪ Coleccionables de la Peña
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-6">
            Recuerdos únicos de la Peña Bética Escocesa
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Recogida en Polwarth</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>O en visitas al estadio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Collection Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            ¿Cómo recoger tus coleccionables?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-yellow-700">
            <div>
              <h3 className="font-semibold mb-2">🍺 En Polwarth Tavern</h3>
              <p>Durante cualquier partido del Betis. Pregunta por los organizadores de la peña.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🏟️ En el estadio</h3>
              <p>Cuando viajemos a Sevilla o a partidos fuera. Te avisaremos por WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Collection Points Guide */}
        <div className="mb-8">
          <CollectionPointsGuide />
        </div>

        {/* Type Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {types.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedType === type.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Camiseta Section */}
        {(selectedType === 'all' || selectedType === 'camiseta') && votingData?.voting.active && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center justify-center gap-2">
                <Vote className="w-6 h-6" />
                🗳️ ¡Vota por el diseño de la camiseta!
              </h2>
              {timeLeft && <p className="text-sm text-red-600 mb-1">Tiempo restante: {timeLeft}</p>}
              <p className="text-blue-600">
                Necesitamos al menos {votingData.preOrders.minimumOrders} pre-pedidos para producir las camisetas.
              </p>
              <p className="text-sm text-blue-500 mt-1">
                Pedidos actuales: {votingData.preOrders.totalOrders} | Votos totales: {votingData.voting.totalVotes}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {votingData.voting.options.map((option) => {
                const percent = votingData.voting.totalVotes
                  ? Math.round((option.votes / votingData.voting.totalVotes) * 100)
                  : 0;
                return (
                  <div key={option.id} className="bg-white rounded-lg p-4 text-center border border-gray-200">
                    <div className="relative w-full h-48 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={option.image}
                        alt={option.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="bg-blue-600 h-full" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{percent}% ({option.votes} votos)</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowVotingModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Vote className="w-4 h-4" />
                Votar por diseño
              </button>
              <button
                onClick={() => {
                  const camiseta = items.find((i) => i.type === 'camiseta');
                  if (camiseta) setSelectedPreOrderItem(camiseta);
                }}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Pre-pedir camiseta
              </button>
            </div>
          </div>
        )}

        {/* Collectibles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MerchandiseCard key={item.id} item={item} />
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay coleccionables disponibles
            </h3>
            <p className="text-gray-500">
              Prueba con otro filtro o vuelve más tarde.
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Recogida de Coleccionables</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Recogida gratuita en Polwarth Tavern</li>
                <li>• También disponible en visitas al estadio</li>
                <li>• Te avisamos por WhatsApp cuando esté listo</li>
                <li>• No realizamos envíos por correo</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💚 Apoya la Peña</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Productos exclusivos de la peña</li>
                <li>• Ayuda a mantener la actividad</li>
                <li>• Diseños únicos para béticos en Escocia</li>
                <li>• Muestra tu orgullo bético en Edimburgo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Voting and Pre-order Modals */}
      {showVotingModal && (
        <VotingModal
          onClose={() => setShowVotingModal(false)}
        />
      )}

      {selectedPreOrderItem && (
        <PreOrderModal
          item={selectedPreOrderItem}
          onClose={() => setSelectedPreOrderItem(null)}
        />
      )}
    </div>
  );
}

// Placeholder components
interface VotingModalProps {
  readonly onClose: () => void;
}

function VotingModal({ onClose }: VotingModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Votación de Camiseta</h3>
        <p className="text-gray-600 mb-4">Funcionalidad de votación en desarrollo...</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

interface PreOrderModalProps {
  item: MerchandiseItem;
  readonly onClose: () => void;
}

function PreOrderModal({ item, onClose }: Readonly<PreOrderModalProps>) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <OrderForm
        productId={item.id}
        productName={item.name}
        price={item.price}
        isInStock={item.inStock}
        onClose={onClose}
      />
    </div>
  );
}
