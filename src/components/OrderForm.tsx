'use client';

import { useState } from 'react';
import { FormSuccessMessage, FormErrorMessage, FormLoadingMessage } from '@/components/MessageComponent';
import Field, { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '@/components/Field';
import { useFormValidation, commonValidationRules } from '@/lib/formValidation';
import { User, Mail, Phone, MessageSquare, Package } from 'lucide-react';

interface OrderFormProps {
  readonly productId: string;
  readonly productName: string;
  readonly price: number;
  readonly isInStock: boolean;
  readonly onClose: () => void;
}

const orderValidationRules = {
  name: commonValidationRules.name,
  email: commonValidationRules.email,
  phone: { ...commonValidationRules.phone, required: true },
  quantity: { required: true },
  size: { required: false },
  message: { ...commonValidationRules.message, required: false }
};

export default function OrderForm({ productId, productName, price, isInStock, onClose }: OrderFormProps) {
  const {
    data: formData,
    errors,
    touched,
    updateField,
    touchField,
    validateAll
  } = useFormValidation({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    size: '',
    message: '',
    contactMethod: 'email'
  }, orderValidationRules);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const needsSize = productName.toLowerCase().includes('camiseta') || 
                   productName.toLowerCase().includes('sudadera') ||
                   productName.toLowerCase().includes('polo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add size validation if needed
    const currentRules = { ...orderValidationRules };
    if (needsSize) {
      currentRules.size = { required: true };
    }
    
    const validation = validateAll();
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const orderData = {
        productId,
        productName,
        price,
        quantity: formData.quantity,
        totalPrice: price * (formData.quantity as number),
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

  const handleInputChange = (field: string, value: string | number) => {
    updateField(field, value);
  };

  const handleBlur = (field: string) => {
    touchField(field);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isInStock ? 'Hacer Pedido' : 'Pre-pedido'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {submitStatus === 'success' ? (
            <FormSuccessMessage
              title="¡Pedido Enviado!"
              message={`Tu ${isInStock ? 'pedido' : 'pre-pedido'} de ${productName} ha sido enviado. Te contactaremos pronto para confirmar los detalles.`}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800">{productName}</h4>
                <p className="text-betis-green font-bold">€{price}</p>
                {!isInStock && (
                  <p className="text-orange-600 text-sm mt-1">
                    ⚠️ Pre-pedido - Te contactaremos cuando esté disponible
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <Field
                label="Nombre completo"
                htmlFor="order-name"
                required
                icon={<User className="h-4 w-4" />}
                error={errors.name}
                touched={touched.name}
              >
                <ValidatedInput
                  type="text"
                  id="order-name"
                  value={formData.name as string}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Tu nombre completo"
                  error={errors.name}
                  touched={touched.name}
                />
              </Field>

              <Field
                label="Email"
                htmlFor="order-email"
                required
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
                touched={touched.email}
              >
                <ValidatedInput
                  type="email"
                  id="order-email"
                  value={formData.email as string}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="tu@email.com"
                  error={errors.email}
                  touched={touched.email}
                />
              </Field>

              <Field
                label="Teléfono"
                htmlFor="order-phone"
                required
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone}
                touched={touched.phone}
              >
                <ValidatedInput
                  type="tel"
                  id="order-phone"
                  value={formData.phone as string}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+34 123 456 789"
                  error={errors.phone}
                  touched={touched.phone}
                />
              </Field>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Cantidad"
                  htmlFor="order-quantity"
                  required
                  icon={<Package className="h-4 w-4" />}
                  error={errors.quantity}
                  touched={touched.quantity}
                >
                  <ValidatedSelect
                    id="order-quantity"
                    value={formData.quantity as number}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                    onBlur={() => handleBlur('quantity')}
                    error={errors.quantity}
                    touched={touched.quantity}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </ValidatedSelect>
                </Field>

                {needsSize && (
                  <Field
                    label="Talla"
                    htmlFor="order-size"
                    required
                    error={errors.size}
                    touched={touched.size}
                  >
                    <ValidatedSelect
                      id="order-size"
                      value={formData.size as string}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      onBlur={() => handleBlur('size')}
                      error={errors.size}
                      touched={touched.size}
                    >
                      <option value="">Selecciona talla</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </ValidatedSelect>
                  </Field>
                )}
              </div>

              {/* Contact Method */}
              <Field
                label="Método de contacto preferido"
                htmlFor="order-contact"
                required
              >
                <ValidatedSelect
                  id="order-contact"
                  value={formData.contactMethod as string}
                  onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </ValidatedSelect>
              </Field>

              {/* Message */}
              <Field
                label="Mensaje adicional (opcional)"
                htmlFor="order-message"
                icon={<MessageSquare className="h-4 w-4" />}
                error={errors.message}
                touched={touched.message}
              >
                <ValidatedTextarea
                  id="order-message"
                  rows={3}
                  value={formData.message as string}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  placeholder="Instrucciones especiales, preguntas..."
                  error={errors.message}
                  touched={touched.message}
                />
              </Field>

              {/* Total */}
              <div className="bg-betis-green/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-betis-green font-bold text-lg">
                    €{(price * (formData.quantity as number)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <FormErrorMessage 
                  message="Error al enviar el pedido. Por favor, inténtalo de nuevo."
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <FormLoadingMessage message="Enviando pedido..." className="text-white" />
                ) : (
                  <>
                    {isInStock ? '🛒 Enviar Pedido' : '📋 Enviar Pre-pedido'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}