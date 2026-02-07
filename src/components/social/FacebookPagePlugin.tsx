'use client';

import { useEffect, useState } from 'react';
import { Facebook } from 'lucide-react';

interface FacebookPagePluginProps {
  showHeader?: boolean;
  width?: number;
  height?: number;
}

// Extend window type for Facebook SDK
interface FacebookSDKInitParams {
  xfbml: boolean;
  version: string;
}

declare global {
  interface Window {
    FB?: {
      init: (params: FacebookSDKInitParams) => void;
      XFBML: {
        parse: () => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

export default function FacebookPagePlugin({
  showHeader = true,
  width = 380,
  height = 500,
}: FacebookPagePluginProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      // Skip if already loaded
      if (window.FB) {
        setIsLoading(false);
        return;
      }

      // Set up Facebook SDK initialization
      window.fbAsyncInit = function() {
        window.FB?.init({
          xfbml: true,
          version: 'v18.0'
        });
        setIsLoading(false);
      };

      // Load Facebook SDK script
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/es_ES/sdk.js';
      script.onload = () => {
        if (window.fbAsyncInit) {
          window.fbAsyncInit();
        }
      };
      script.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadFacebookSDK();

    // Cleanup
    return () => {
      // Remove script if component unmounts
      const script = document.querySelector('script[src*="connect.facebook.net"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {showHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
          <div className="flex items-center gap-3">
            <Facebook className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">Facebook Group</h3>
              <p className="text-blue-100 text-sm">Béticos en Escocia</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando contenido de Facebook...</p>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <Facebook className="h-8 w-8 mx-auto opacity-50" />
            </div>
            <p className="text-gray-600 text-sm">Error al cargar el contenido de Facebook</p>
          </div>
        )}
        
        {/* Facebook Group Plugin */}
        {!isLoading && !hasError && (
          <div className="mb-4">
            {/* Use Facebook Page Plugin instead of Group plugin for better compatibility */}
            <div 
              className="fb-page" 
              data-href="https://www.facebook.com/penabetiscaescocesa"
              data-tabs="timeline"
              data-width={width}
              data-height={height}
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote cite="https://www.facebook.com/penabetiscaescocesa" className="fb-xfbml-parse-ignore">
                <a href="https://www.facebook.com/penabetiscaescocesa">Peña Bética Escocesa</a>
              </blockquote>
            </div>
          </div>
        )}
        
        {/* Fallback message */}
        <div className="text-center text-gray-600 text-sm">
          <p>Si no puedes ver el contenido, visita nuestra página directamente en Facebook.</p>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <a 
          href="https://www.facebook.com/penabetiscaescocesa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Facebook className="h-4 w-4" />
          Ver Página en Facebook
        </a>
      </div>
    </div>
  );
}
