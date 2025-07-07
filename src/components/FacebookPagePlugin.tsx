'use client';

import { useEffect } from 'react';
import { Facebook } from 'lucide-react';

interface FacebookPagePluginProps {
  showHeader?: boolean;
  width?: number;
  height?: number;
  tabs?: string;
  hideCover?: boolean;
  showFacepile?: boolean;
  smallHeader?: boolean;
  adaptContainerWidth?: boolean;
}

export default function FacebookPagePlugin({
  showHeader = true,
  width = 380,
  height = 500,
  tabs = "timeline",
  hideCover = false,
  showFacepile = true,
  smallHeader = false,
  adaptContainerWidth = true
}: FacebookPagePluginProps) {
  
  useEffect(() => {
    // Parse Facebook XFBML when component mounts
    if (typeof window !== 'undefined' && (window as any).FB) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).FB.XFBML.parse();
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
        <div 
          className="fb-page" 
          data-href="https://www.facebook.com/groups/beticosenescocia/" 
          data-tabs={tabs}
          data-width={adaptContainerWidth ? "" : width.toString()}
          data-height={height.toString()}
          data-small-header={smallHeader.toString()}
          data-adapt-container-width={adaptContainerWidth.toString()}
          data-hide-cover={hideCover.toString()}
          data-show-facepile={showFacepile.toString()}
        >
          <blockquote 
            cite="https://www.facebook.com/groups/beticosenescocia/" 
            className="fb-xfbml-parse-ignore"
          >
            <a href="https://www.facebook.com/groups/beticosenescocia/">
              Béticos en Escocia - Facebook Group
            </a>
          </blockquote>
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
          Ver en Facebook
        </a>
      </div>
    </div>
  );
}
