'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Search, Upload, Eye, Star, Calendar } from 'lucide-react';
import PhotoUploadForm from '@/components/PhotoUploadForm';

interface PhotoSubmission {
  id: string;
  name: string;
  email: string;
  caption: string;
  merchandiseItems: string[];
  location: string;
  matchDate: string;
  imageUrl: string;
  approved: boolean;
  featured: boolean;
  timestamp: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerchandise, setSelectedMerchandise] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSubmission | null>(null);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  // Filter photos when filters change
  useEffect(() => {
    let filtered = photos.filter(photo => photo.approved);

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMerchandise !== 'all') {
      filtered = filtered.filter(photo =>
        photo.merchandiseItems.includes(selectedMerchandise)
      );
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(photo => photo.featured);
    }

    setFilteredPhotos(filtered);
  }, [photos, searchTerm, selectedMerchandise, showFeaturedOnly]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchPhotos(); // Refresh photos after successful upload
  };

  const merchandiseOptions = [
    'Bufanda Real Betis Escocia',
    'Llavero Escudo Bético',
    'Parche Bordado',
    'Camiseta Peña Bética',
    'Gorro de Invierno',
    'Pin Conmemorativo',
    'Sudadera Peña',
    'Pulsera Verde y Blanca'
  ];

  const featuredPhotos = filteredPhotos.filter(photo => photo.featured);
  const regularPhotos = filteredPhotos.filter(photo => !photo.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Camera className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Galería Bética
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Fotos de nuestra familia bética en Escocia luciendo los colores verdes y blancos
          </p>
          
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-betis-gold hover:bg-betis-gold-dark text-betis-dark px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="h-5 w-5 inline mr-2" />
            Subir Foto
          </button>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fotos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
              />
            </div>

            {/* Merchandise Filter */}
            <select
              value={selectedMerchandise}
              onChange={(e) => setSelectedMerchandise(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
            >
              <option value="all">Todos los productos</option>
              {merchandiseOptions.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {/* Featured Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="h-5 w-5 text-betis-green border-gray-300 rounded focus:ring-betis-green"
              />
              <span className="text-gray-700 font-medium flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Solo destacadas
              </span>
            </label>
          </div>

          {/* Results count */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'foto' : 'fotos'}
              {searchTerm && ` encontradas para "${searchTerm}"`}
              {selectedMerchandise !== 'all' && ` con "${selectedMerchandise}"`}
              {showFeaturedOnly && ' destacadas'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Photos */}
      {featuredPhotos.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 flex items-center justify-center">
              <Star className="h-8 w-8 mr-3 text-yellow-500" />
              Fotos Destacadas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPhotos.map(photo => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => setSelectedPhoto(photo)}
                  featured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Photos */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showFeaturedOnly && featuredPhotos.length > 0 && (
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Todas las Fotos
            </h2>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-betis-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando fotos...</p>
            </div>
          ) : regularPhotos.length === 0 && featuredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay fotos disponibles</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedMerchandise !== 'all' || showFeaturedOnly
                  ? 'Prueba a cambiar los filtros o ser el primero en subir una foto.'
                  : 'Sé el primero en compartir una foto bética.'}
              </p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-betis-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                <Upload className="h-5 w-5 inline mr-2" />
                Subir Primera Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularPhotos.map(photo => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">📸 ¡Comparte tus Fotos Béticas!</h2>
          <p className="text-xl opacity-90 mb-8">
            Cada foto que compartes ayuda a que más béticos se unan a nuestra familia escocesa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-white text-betis-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              📸 Subir Foto
            </button>
            <a
              href="/redes-sociales"
              className="border-2 border-white text-white hover:bg-white hover:text-betis-green px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              📱 Guía de Redes Sociales
            </a>
          </div>
        </div>
      </section>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PhotoUploadForm
              onSuccess={handleUploadSuccess}
              onClose={() => setShowUploadForm(false)}
            />
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}

// Photo Card Component
interface PhotoCardProps {
  photo: PhotoSubmission;
  onClick: () => void;
  featured?: boolean;
}

function PhotoCard({ photo, onClick, featured = false }: PhotoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        featured ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={onClick}
    >
      {featured && (
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold text-center flex items-center justify-center">
          <Star className="h-4 w-4 mr-1" />
          Destacada
        </div>
      )}
      
      <div className="relative">
        <Image
          src={photo.imageUrl}
          alt={photo.caption || 'Foto bética'}
          width={400}
          height={256}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {photo.caption || 'Foto sin descripción'}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            <span>{photo.name}</span>
          </div>
          
          {photo.location && (
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>{photo.location}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(photo.timestamp)}</span>
          </div>
        </div>
        
        {photo.merchandiseItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-1">
              {photo.merchandiseItems.slice(0, 2).map((item, index) => (
                <span
                  key={index}
                  className="inline-block bg-betis-green/10 text-betis-green text-xs px-2 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
              {photo.merchandiseItems.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{photo.merchandiseItems.length - 2} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Photo Detail Modal Component
interface PhotoDetailModalProps {
  photo: PhotoSubmission;
  onClose: () => void;
}

function PhotoDetailModal({ photo, onClose }: PhotoDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalle de la Foto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Photo */}
            <div>
              {photo.featured && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold text-center flex items-center justify-center mb-4 rounded">
                  <Star className="h-4 w-4 mr-1" />
                  Foto Destacada
                </div>
              )}
              <Image
                src={photo.imageUrl}
                alt={photo.caption || 'Foto bética'}
                width={600}
                height={400}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            
            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {photo.caption || 'Foto sin descripción'}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Camera className="h-5 w-5 mr-3 text-betis-green" />
                  <span><strong>Autor:</strong> {photo.name}</span>
                </div>
                
                {photo.location && (
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3 text-betis-green">📍</span>
                    <span><strong>Ubicación:</strong> {photo.location}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-betis-green" />
                  <span><strong>Fecha:</strong> {formatDate(photo.timestamp)}</span>
                </div>
                
                {photo.matchDate && (
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3 text-betis-green">⚽</span>
                    <span><strong>Partido:</strong> {formatDate(photo.matchDate)}</span>
                  </div>
                )}
              </div>
              
              {photo.merchandiseItems.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Merchandising Visible:</h4>
                  <div className="flex flex-wrap gap-2">
                    {photo.merchandiseItems.map((item, index) => (
                      <span
                        key={index}
                        className="inline-block bg-betis-green text-white text-sm px-3 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-gray-200">
                <a
                  href="/tienda"
                  className="bg-betis-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  🛍️ Ver Productos en la Tienda
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
