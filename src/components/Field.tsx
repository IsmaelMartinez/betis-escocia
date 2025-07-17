'use client';

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldProps {
  readonly label: string;
  readonly htmlFor: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly touched?: boolean;
  readonly icon?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export default function Field({ 
  label, 
  htmlFor, 
  required = false, 
  error, 
  touched, 
  icon,
  children, 
  className = '' 
}: FieldProps) {
  const hasError = touched && error;
  const fieldId = htmlFor;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-gray-700"
      >
        {icon && <span className="inline-block mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        {hasError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// Input wrapper with validation styling
interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly error?: string;
  readonly touched?: boolean;
}

export function ValidatedInput({ error, touched, className = '', ...props }: ValidatedInputProps) {
  const hasError = touched && error;
  
  const baseStyles = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent transition-colors";
  const errorStyles = hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  const disabledStyles = props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "";
  
  return (
    <input
      {...props}
      className={`${baseStyles} ${errorStyles} ${disabledStyles} ${className}`}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={hasError ? `${props.id}-error` : undefined}
    />
  );
}

// Textarea wrapper with validation styling
interface ValidatedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly error?: string;
  readonly touched?: boolean;
}

export function ValidatedTextarea({ error, touched, className = '', ...props }: ValidatedTextareaProps) {
  const hasError = touched && error;
  
  const baseStyles = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent transition-colors";
  const errorStyles = hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  
  return (
    <textarea
      {...props}
      className={`${baseStyles} ${errorStyles} ${className}`}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={hasError ? `${props.id}-error` : undefined}
    />
  );
}

// Select wrapper with validation styling
interface ValidatedSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly error?: string;
  readonly touched?: boolean;
}

export function ValidatedSelect({ error, touched, className = '', children, ...props }: ValidatedSelectProps) {
  const hasError = touched && error;
  
  const baseStyles = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent transition-colors";
  const errorStyles = hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  
  return (
    <select
      {...props}
      className={`${baseStyles} ${errorStyles} ${className}`}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={hasError ? `${props.id}-error` : undefined}
    >
      {children}
    </select>
  );
}
