'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface PhotoUploadFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  preSelectedMerchandise?: string;
}

interface PhotoFormData {
  name: string;
  email: string;
  caption: string;
  merchandiseItems: string[];
  location: string;
  matchDate: string;
  agreedToTerms: boolean;
}

export default function PhotoUploadForm({ onSuccess, onClose, preSelectedMerchandise }: PhotoUploadFormProps) {
  const [formData, setFormData] = useState<PhotoFormData>({
    name: '',
    email: '',
    caption: '',
    merchandiseItems: preSelectedMerchandise ? [preSelectedMerchandise] : [],
    location: '',
    matchDate: '',
    agreedToTerms: false
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const merchandiseOptions = [
    'Bufanda Real Betis Escocia',
    'Llavero Escudo Bético',
    'Parche Bordado',
    'Camiseta Peña Bética',
    'Gorro de Invierno',
    'Pin Metálico',
    'Sudadera con Capucha',
    'Polo Peña Bética',
    'Bandera Escocesa-Bética',
    'Otro (especificar en descripción)'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      setSelectedFile(file);
      setErrorMessage('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMerchandiseToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      merchandiseItems: prev.merchandiseItems.includes(item)
        ? prev.merchandiseItems.filter(i => i !== item)
        : [...prev.merchandiseItems, item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('Por favor selecciona una imagen.');
      return;
    }

    if (formData.merchandiseItems.length === 0) {
      setErrorMessage('Por favor selecciona al menos un artículo de merchandising visible en la foto.');
      return;
    }

    if (!formData.agreedToTerms) {
      setErrorMessage('Debes aceptar los términos para continuar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('image', selectedFile);
      uploadData.append('name', formData.name);
      uploadData.append('email', formData.email);
      uploadData.append('caption', formData.caption);
      uploadData.append('merchandiseItems', JSON.stringify(formData.merchandiseItems));
      uploadData.append('location', formData.location);
      uploadData.append('matchDate', formData.matchDate);
      uploadData.append('timestamp', new Date().toISOString());

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        setSubmitStatus('success');
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Error al subir la foto.');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-betis-green flex items-center">
              <Camera className="h-6 w-6 mr-2" />
              Comparte tu Foto Bética
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              ¡Foto enviada correctamente! Aparecerá en la galería después de la moderación.
            </div>
          )}

          {(submitStatus === 'error' || errorMessage) && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {errorMessage || 'Error al enviar la foto.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto *
              </label>
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">
                      Haz clic para seleccionar una foto
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG o GIF (máx. 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Vista previa"
                    width={400}
                    height={256}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="photo-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu Nombre *
                </label>
                <input
                  id="photo-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label htmlFor="photo-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="photo-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Photo Details */}
            <div>
              <label htmlFor="photo-caption" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de la Foto
              </label>
              <textarea
                id="photo-caption"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                placeholder="Cuéntanos sobre la foto: dónde, cuándo, con quién..."
              />
            </div>

            {/* Merchandise Selection */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Merchandising Visible en la Foto *
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {merchandiseOptions.map((item) => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.merchandiseItems.includes(item)}
                        onChange={() => handleMerchandiseToggle(item)}
                        className="mr-2 h-4 w-4 text-betis-green focus:ring-betis-green border-gray-300 rounded"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Optional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="photo-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  id="photo-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                  placeholder="Ej: Polwarth Tavern, Estadio..."
                />
              </div>

              <div>
                <label htmlFor="photo-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Partido (opcional)
                </label>
                <input
                  id="photo-date"
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-betis-green"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                className="mr-3 h-4 w-4 text-betis-green focus:ring-betis-green border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Autorizo el uso de esta imagen en la galería de la Peña Bética Escocesa y acepto que la foto puede ser compartida en redes sociales del grupo. *
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-betis-green hover:bg-green-700'
              } transition-colors`}
            >
              {isSubmitting ? 'Subiendo Foto...' : 'Compartir Foto'}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-500">
            <p>Las fotos son revisadas antes de aparecer en la galería para asegurar contenido apropiado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
