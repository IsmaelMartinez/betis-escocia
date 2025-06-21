'use client';

import { useState } from 'react';
import { Trophy, Clock, Users } from 'lucide-react';

interface PorraCardProps {
  readonly isActive: boolean;
  readonly opponent: string;
  readonly date: string;
  readonly prizePool: number;
  readonly totalEntries: number;
}

export default function PorraCard({ isActive, opponent, date, prizePool, totalEntries }: PorraCardProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prediction: '',
    scorer: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message (in real app, handle response)
    alert('¡Entrada registrada! Buena suerte.');
    setFormData({ name: '', email: '', prediction: '', scorer: '' });
    setIsSubmitting(false);
  };

  const penaShare = Math.round(prizePool * 0.5);
  const prizesShare = Math.round(prizePool * 0.5);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${isActive ? 'bg-betis-green' : 'bg-gray-500'}`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-bold">La Porra de Fran</h2>
            <p className="text-sm opacity-90">Real Betis vs {opponent}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-betis-gold text-betis-dark' : 'bg-gray-300 text-gray-600'
          }`}>
            {isActive ? '🔴 ACTIVA' : '⏸️ CERRADA'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Match info */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm">{new Date(date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-sm">{totalEntries} participantes</span>
          </div>
        </div>

        {/* Prize pool */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-betis-gold" />
              Bote Total
            </h3>
            <span className="text-2xl font-bold text-betis-green">€{prizePool}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Para la Peña</p>
              <p className="font-semibold text-betis-green">€{penaShare}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Para Premios</p>
              <p className="font-semibold text-betis-gold">€{prizesShare}</p>
            </div>
          </div>
        </div>

        {/* Entry form */}
        {isActive ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="prediction" className="block text-sm font-medium text-gray-700 mb-1">
                Resultado (ej: 2-1)
              </label>
              <input
                id="prediction"
                type="text"
                required
                pattern="[0-9]{1,2}-[0-9]{1,2}"
                value={formData.prediction}
                onChange={(e) => setFormData({...formData, prediction: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                placeholder="2-1"
              />
            </div>

            <div>
              <label htmlFor="scorer" className="block text-sm font-medium text-gray-700 mb-1">
                Primer Goleador del Betis
              </label>
              <input
                id="scorer"
                type="text"
                required
                value={formData.scorer}
                onChange={(e) => setFormData({...formData, scorer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                placeholder="Isco"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-betis-green text-white py-3 px-4 rounded-md font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : '🎲 Participar (€5)'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Porra cerrada</p>
            <p className="text-sm">Fran abrirá la próxima cuando esté disponible</p>
          </div>
        )}

        {/* Rules */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold mb-2 text-sm">📋 Reglas:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Entrada: €5 por participación</li>
            <li>• 50% para la peña, 50% para premios</li>
            <li>• Hay que acertar resultado exacto y primer goleador del Betis</li>
            <li>• Depende de la disponibilidad de Fran</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
