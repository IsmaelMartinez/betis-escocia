'use client';

import { Camera } from 'lucide-react';

interface InstagramEmbedProps {
  readonly showHeader?: boolean;
}

export default function InstagramEmbed({ showHeader = true }: InstagramEmbedProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {showHeader && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">Instagram</h3>
              <p className="text-pink-100 text-sm">@penabetiscaescocesa</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="space-y-4">
          {/* Instagram Feed Placeholder */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-dashed border-pink-200 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-pink-400 mx-auto mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">Instagram Feed Coming Soon!</h4>
            <p className="text-gray-600 text-sm mb-4">
              We&apos;re working on integrating our Instagram feed. For now, follow us directly on Instagram to see all our latest content.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Tag your photos with <span className="font-mono bg-gray-100 px-2 py-1 rounded">#PenaBetiscaEscocesa</span> to be featured!
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50 space-y-3">
        <a 
          href="https://instagram.com/penabetiscaescocesa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 font-medium"
        >
          <Camera className="h-4 w-4" />
          Follow us on Instagram
        </a>
        
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Popular hashtags:</p>
          <div className="flex flex-wrap gap-2">
            {['#PenaBetiscaEscocesa', '#BetisEdinburgh', '#RealBetis', '#PolwarthTavern'].map((tag) => (
              <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
