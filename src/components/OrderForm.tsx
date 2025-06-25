'use client';

import { useState } from 'react';

interface OrderFormProps {
  productId: string;
  productName: string;
  price: number;
  isInStock: boolean;
  onClose: () => void;
}

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  quantity: number;
  size?: string;
  message: string;
  contactMethod: 'email' | 'whatsapp';
}

export default function OrderForm({ productId, productName, price, isInStock, onClose }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    size: '',
    message: '',
    contactMethod: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const needsSize = productName.toLowerCase().includes('camiseta') || 
                   productName.toLowerCase().includes('sudadera') ||
                   productName.toLowerCase().includes('polo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const orderData = {
        productId,
        productName,
        price,
        quantity: formData.quantity,
        totalPrice: price * formData.quantity,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          contactMethod: formData.contactMethod
        },
        orderDetails: {
          size: formData.size,
          message: formData.message
        },
        isPreOrder: !isInStock,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-800">
              {isInStock ? 'Realizar Pedido' : 'Pre-Reservar'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-green-800">{productName}</h4>
            <p className="text-sm text-gray-600">
              Precio: €{price} {!isInStock && '(Pre-reserva)'}
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-green-800">
              ¡{isInStock ? 'Pedido' : 'Pre-reserva'} enviado correctamente! Te contactaremos pronto.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
              Error al enviar el {isInStock ? 'pedido' : 'pre-reserva'}. Inténtalo de nuevo.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+44 o +34 número"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <select
                  id="quantity"
                  required
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {needsSize && (
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Talla *
                  </label>
                  <select
                    id="size"
                    required={needsSize}
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Contacto Preferido
                </legend>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      checked={formData.contactMethod === 'email'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="mr-2"
                    />
                    {' '}Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="whatsapp"
                      checked={formData.contactMethod === 'whatsapp'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="mr-2"
                    />
                    {' '}WhatsApp
                  </label>
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje Adicional
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Cualquier comentario o petición especial..."
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-green-800">
                  €{(price * formData.quantity).toFixed(2)}
                </span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-semibold ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } transition-colors`}
              >
                {isSubmitting 
                  ? 'Enviando...' 
                  : (() => {
                      if (isInStock) {
                        return 'Enviar Pedido';
                      }
                      return 'Enviar Pre-Reserva';
                    })()
                }
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500">
            <p>
              {isInStock 
                ? 'Te contactaremos para confirmar el pedido y coordinar la entrega/recogida.'
                : 'Te contactaremos cuando el producto esté disponible.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
