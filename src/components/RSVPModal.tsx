'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import RSVPWidget, { EventDetails, RSVPWidgetProps } from './RSVPWidget';

export interface RSVPModalProps extends Omit<RSVPWidgetProps, 'displayMode'> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Title override for modal header */
  modalTitle?: string;
  /** Disable clicking outside to close */
  disableBackdropClick?: boolean;
  /** Disable escape key to close */
  disableEscapeKey?: boolean;
  /** Custom modal width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Z-index override */
  zIndex?: number;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
};

export default function RSVPModal({
  isOpen,
  onClose,
  modalTitle,
  disableBackdropClick = false,
  disableEscapeKey = false,
  maxWidth = 'md',
  zIndex = 50,
  onSuccess,
  onError,
  ...rsvpWidgetProps
}: RSVPModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || disableEscapeKey) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, disableEscapeKey]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      const previouslyFocused = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Return focus when modal closes
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 200); // Match animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (disableBackdropClick) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    // Don't auto-close modal on success - let user see success message
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-200 z-${zIndex}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isOpen && !isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
          isOpen && !isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            {modalTitle || (rsvpWidgetProps.currentRSVP ? 'Actualizar Confirmación' : 'Confirmar Asistencia')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="bg-white rounded-b-2xl">
          <RSVPWidget
            {...rsvpWidgetProps}
            displayMode="inline"
            className="border-none shadow-none rounded-none"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

// Hook for easier modal state management
export function useRSVPModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}