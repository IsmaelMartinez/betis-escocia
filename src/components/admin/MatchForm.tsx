'use client';

import { useState, useEffect } from 'react';
import { Match, MatchInsert, MatchUpdate } from '@/lib/supabase';
import { generateCSRFToken, sanitizeInput } from '@/lib/security';

// Note: This component should be wrapped with FeatureWrapper for 'showAdmin' flag
// when used in admin pages to ensure proper access control

interface MatchFormProps {
  match?: Match; // If provided, we're editing; if not, we're creating
  onSubmit: (data: MatchInsert | MatchUpdate) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onDelete?: () => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export default function MatchForm({ 
  match, 
  onSubmit, 
  onCancel, 
  onDelete, 
  isLoading = false 
}: MatchFormProps) {
  const isEditing = !!match;
  
  // Form state
  const [formData, setFormData] = useState({
    date_time: match?.date_time ? new Date(match.date_time).toISOString().slice(0, 16) : '',
    opponent: match?.opponent || '',
    competition: match?.competition || '',
    home_away: match?.home_away || 'home' as const,
    notes: match?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate CSRF token on mount
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  // Validation with security checks
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date_time) {
      newErrors.date_time = 'Fecha y hora son requeridas';
    }

    const sanitizedOpponent = sanitizeInput(formData.opponent);
    if (!sanitizedOpponent.trim()) {
      newErrors.opponent = 'Oponente es requerido';
    } else if (sanitizedOpponent.length > 100) {
      newErrors.opponent = 'Nombre del oponente demasiado largo';
    }

    const sanitizedCompetition = sanitizeInput(formData.competition);
    if (!sanitizedCompetition.trim()) {
      newErrors.competition = 'Competición es requerida';
    } else if (sanitizedCompetition.length > 100) {
      newErrors.competition = 'Nombre de competición demasiado largo';
    }

    const sanitizedNotes = sanitizeInput(formData.notes);
    if (sanitizedNotes.length > 500) {
      newErrors.notes = 'Notas demasiado largas (máximo 500 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        date_time: new Date(formData.date_time).toISOString(),
        opponent: sanitizeInput(formData.opponent).trim(),
        competition: sanitizeInput(formData.competition).trim(),
        home_away: formData.home_away,
        notes: sanitizeInput(formData.notes).trim() || undefined,
        csrfToken // Include CSRF token
      };

      const result = await onSubmit(submitData);
      
      if (!result.success) {
        setErrors({ submit: result.error || 'Error desconocido' });
      }
      // If successful, parent component should handle navigation/state updates
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al enviar el formulario' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete || !isEditing) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await onDelete();
      
      if (!result.success) {
        setErrors({ delete: result.error || 'Error al eliminar' });
      }
      // If successful, parent component should handle navigation/state updates
    } catch (error) {
      console.error('Error deleting match:', error);
      setErrors({ delete: 'Error al eliminar el partido' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-betis-green focus:border-betis-green";
  const errorClassName = "text-red-600 text-sm mt-1";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Partido' : 'Crear Nuevo Partido'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Modifica los detalles del partido' : 'Añade un nuevo partido al calendario'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CSRF Token */}
        <input type="hidden" name="csrfToken" value={csrfToken} />
        
        {/* Date and Time */}
        <div>
          <label htmlFor="date_time" className="block text-sm font-medium text-gray-700">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            id="date_time"
            name="date_time"
            value={formData.date_time}
            onChange={handleChange}
            className={inputClassName}
            required
          />
          {errors.date_time && <p className={errorClassName}>{errors.date_time}</p>}
        </div>

        {/* Opponent */}
        <div>
          <label htmlFor="opponent" className="block text-sm font-medium text-gray-700">
            Oponente *
          </label>
          <input
            type="text"
            id="opponent"
            name="opponent"
            value={formData.opponent}
            onChange={handleChange}
            placeholder="ej. Real Madrid, Valencia CF"
            className={inputClassName}
            required
          />
          {errors.opponent && <p className={errorClassName}>{errors.opponent}</p>}
        </div>


        {/* Competition */}
        <div>
          <label htmlFor="competition" className="block text-sm font-medium text-gray-700">
            Competición *
          </label>
          <input
            type="text"
            id="competition"
            name="competition"
            value={formData.competition}
            onChange={handleChange}
            placeholder="ej. LaLiga, Copa del Rey, UEFA Conference League"
            className={inputClassName}
            required
          />
          {errors.competition && <p className={errorClassName}>{errors.competition}</p>}
        </div>

        {/* Home/Away */}
        <div>
          <label htmlFor="home_away" className="block text-sm font-medium text-gray-700">
            Local/Visitante *
          </label>
          <select
            id="home_away"
            name="home_away"
            value={formData.home_away}
            onChange={handleChange}
            className={inputClassName}
            required
          >
            <option value="home">Local</option>
            <option value="away">Visitante</option>
          </select>
          {errors.home_away && <p className={errorClassName}>{errors.home_away}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notas adicionales sobre el partido..."
            rows={3}
            className={inputClassName}
          />
          {errors.notes && <p className={errorClassName}>{errors.notes}</p>}
        </div>

        {/* Error messages */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {errors.delete && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{errors.delete}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {/* Delete button (only show when editing) */}
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting || isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {/* Cancel button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting || isLoading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || isLoading}
              className="bg-betis-green hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting 
                ? (isEditing ? 'Guardando...' : 'Creando...') 
                : (isEditing ? 'Guardar Cambios' : 'Crear Partido')
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
