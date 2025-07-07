'use client';

import { useEffect } from 'react';
import { Facebook } from 'lucide-react';

interface FacebookPagePluginProps {
  showHeader?: boolean;
  width?: number;
  height?: number;
}

// Extend window type for Facebook SDK
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

export default function FacebookPagePlugin({
  showHeader = true,
  width = 380,
  height = 500,
}: FacebookPagePluginProps) {
  
  useEffect(() => {
    // Parse Facebook XFBML when component mounts
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.XFBML.parse();
    }
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
        {/* Facebook Group Embed */}
        <div className="mb-4">
          <iframe
            src="https://www.facebook.com/plugins/group.php?href=https%3A%2F%2Fwww.facebook.com%2Fgroups%2Fbeticosenescocia%2F&width=340&show_social_context=true&appId"
            width={width}
            height={height}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
        
        {/* Fallback message */}
        <div className="text-center text-gray-600 text-sm">
          <p>Si no puedes ver el contenido, visita nuestro grupo directamente en Facebook.</p>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <a 
          href="https://www.facebook.com/groups/beticosenescocia/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Facebook className="h-4 w-4" />
          Ver Grupo en Facebook
        </a>
      </div>
    </div>
  );
}
