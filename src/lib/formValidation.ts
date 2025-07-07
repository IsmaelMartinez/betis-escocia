// Form validation utilities
'use client';

import { useState } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export function validateForm(data: Record<string, unknown>, rules: ValidationRules): ValidationResult {
  const errors: Record<string, string> = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const error = validateField(value, rule);
    
    if (error) {
      errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateField(value: unknown, rule: ValidationRule): string | null {
  const stringValue = String(value ?? '').trim();
  
  // Required validation
  if (rule.required && !stringValue) {
    return 'Este campo es obligatorio';
  }
  
  // Skip other validations if field is empty and not required
  if (!stringValue && !rule.required) {
    return null;
  }
  
  // Length validations
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `Mínimo ${rule.minLength} caracteres`;
  }
  
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `Máximo ${rule.maxLength} caracteres`;
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return 'Formato inválido';
  }
  
  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(stringValue);
    if (customError) {
      return customError;
    }
  }
  
  return null;
}

// Common validation rules
export const commonValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Zàáâäæãåąćčđðèéêëēėęğïīįìíîïłñńňöõòóôøœßśšțùúûüųūÿýžźż\s'-]+$/,
    custom: (value: string) => {
      if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
      if (!/^[a-zA-Zàáâäæãåąćčđðèéêëēėęğïīįìíîïłñńňöõòóôøœßśšțùúûüųūÿýžźż\s'-]+$/.test(value)) {
        return 'El nombre solo puede contener letras, espacios, apostrofes y guiones';
      }
      return null;
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un email válido';
      }
      return null;
    }
  },
  phone: {
    required: false,
    pattern: /^[+]?[\d\s-()]{9,15}$/,
    custom: (value: string) => {
      if (value && !/^[+]?[\d\s-()]{9,15}$/.test(value)) {
        return 'Ingresa un número de teléfono válido';
      }
      return null;
    }
  },
  message: {
    required: false,
    minLength: 5,
    maxLength: 500,
    custom: (value: string) => {
      if (value && value.length < 5) {
        return 'El mensaje debe tener al menos 5 caracteres';
      }
      if (value && value.length > 500) {
        return 'El mensaje no puede exceder 500 caracteres';
      }
      return null;
    }
  },
  subject: {
    required: true,
    minLength: 3,
    maxLength: 100,
    custom: (value: string) => {
      if (value.length < 3) {
        return 'El asunto debe tener al menos 3 caracteres';
      }
      return null;
    }
  }
};

// Real-time validation hook
export function useFormValidation(initialData: Record<string, unknown>, rules: ValidationRules) {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const validateSingleField = (field: string, value: unknown) => {
    const rule = rules[field];
    if (!rule) return null;
    
    return validateField(value, rule);
  };
  
  const updateField = (field: string, value: unknown) => {
    setData((prev: Record<string, unknown>) => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateSingleField(field, value);
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field]: error ?? ''
      }));
    }
  };
  
  const touchField = (field: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [field]: true }));
    
    // Validate field when touched
    const error = validateSingleField(field, data[field]);
    setErrors((prev: Record<string, string>) => ({
      ...prev,
      [field]: error ?? ''
    }));
  };
  
  const validateAll = () => {
    const result = validateForm(data, rules);
    setErrors(result.errors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(rules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    return result;
  };
  
  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };
  
  return {
    data,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}
