'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, Phone, ChevronDown, ChevronUp } from 'lucide-react';

export default function CollectionPointsGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const collectionPoints = [
    {
      name: "Polwarth Tavern",
      icon: "🍺",
      address: "35 Polwarth Cres, Edinburgh EH11 1HR",
      description: "Nuestro hogar bético en Edimburgo",
      times: [
        { day: "Días de partido", time: "Desde 2 horas antes del kick-off" },
        { day: "Domingos regulares", time: "12:00 - 22:00" }
      ],
      contact: "Pregunta por José Mari o cualquier miembro de la peña",
      features: [
        "Ambiente familiar",
        "Todos los partidos del Betis",
        "Miembros siempre disponibles",
        "Fácil acceso en transporte público"
      ],
      mapUrl: "https://maps.google.com/?q=Polwarth+Tavern+Edinburgh",
      isPrimary: true
    },
    {
      name: "Estadio Benito Villamarín",
      icon: "🏟️",
      address: "Av. de la Palmera, s/n, 41012 Sevilla",
      description: "Cuando Juan va a los partidos en Sevilla",
      times: [
        { day: "Días de partido", time: "Antes del partido, según disponibilidad" }
      ],
      contact: "Coordinar previamente por WhatsApp si Juan va al partido",
      features: [
        "Depende de la asistencia de Juan",
        "Solo para partidos en casa del Betis",
        "Coordinación previa necesaria"
      ],
      mapUrl: "https://maps.google.com/?q=Estadio+Benito+Villamarin+Sevilla",
      isPrimary: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-left hover:from-green-700 hover:to-green-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <MapPin className="h-6 w-6" />
              Puntos de Recogida
            </h2>
            <p className="text-green-100">¿Dónde puedes recoger tus coleccionables?</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 text-green-100" />
          ) : (
            <ChevronDown className="h-6 w-6 text-green-100" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {collectionPoints.map((point) => (
            <div
              key={point.name}
              className={`rounded-lg border-2 p-6 transition-all hover:shadow-md ${
                point.isPrimary
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{point.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{point.name}</h3>
                    {point.isPrimary && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{point.description}</p>
                  <div className="text-sm text-gray-700 mb-4">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {point.address}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horarios
                      </h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        {point.times.map((time, timeIndex) => (
                          <div key={`${point.name}-time-${timeIndex}`} className="flex justify-between">
                            <span className="font-medium">{time.day}:</span>
                            <span>{time.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Características
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {point.features.slice(0, 3).map((feature, featureIndex) => (
                          <li key={`${point.name}-feature-${featureIndex}`} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      ¿Cómo contactar?
                    </h4>
                    <p className="text-sm text-blue-800">{point.contact}</p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={point.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver en Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Consejo</h3>
              <p className="text-yellow-700 text-sm">
                Para una recogida más rápida, avísanos por WhatsApp cuando vengas a por tus coleccionables. 
                Así tendremos todo preparado y podrás disfrutar más del ambiente bético en el pub.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
