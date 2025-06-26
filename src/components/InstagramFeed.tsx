'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Instagram, ExternalLink, Heart, MessageCircle, Calendar } from 'lucide-react';

interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramFeedProps {
  maxPosts?: number;
  showHeader?: boolean;
  compactMode?: boolean;
}

export default function InstagramFeed({ 
  maxPosts = 6, 
  showHeader = true, 
  compactMode = false 
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstagramPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data until Instagram API is configured
      const mockPosts: InstagramPost[] = [
        {
          id: '1',
          caption: '🟢⚪ Ready for today\'s match at Polwarth Tavern! Come join us for Betis vs Real Madrid. #ManqueGanemos #PenaBetiscaEscocesa #BetisEdinburgh',
          media_url: '/images/mock-instagram-1.jpg',
          media_type: 'IMAGE',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          permalink: 'https://instagram.com/p/mock1',
          like_count: 25,
          comments_count: 8
        },
        {
          id: '2',
          caption: 'New merchandise has arrived! Check out our limited edition bufandas 🧣 Perfect for the Edinburgh weather! #BetisScotland #Merchandise',
          media_url: '/images/mock-instagram-2.jpg',
          media_type: 'IMAGE',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          permalink: 'https://instagram.com/p/mock2',
          like_count: 42,
          comments_count: 12
        },
        {
          id: '3',
          caption: 'What a night! Thanks to everyone who joined us for the derby. The atmosphere was incredible! 🎉 #VivaElBetis #PenaBetiscaEscocesa',
          media_url: '/images/mock-instagram-3.jpg',
          media_type: 'CAROUSEL_ALBUM',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: 'https://instagram.com/p/mock3',
          like_count: 67,
          comments_count: 23
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(mockPosts.slice(0, maxPosts));
    } catch (err) {
      setError('Error loading Instagram posts');
      console.error('Instagram API error:', err);
    } finally {
      setLoading(false);
    }
  }, [maxPosts]);

  useEffect(() => {
    fetchInstagramPosts();
  }, [fetchInstagramPosts]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return postTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full">
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Instagram className="text-pink-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Instagram</h3>
          </div>
        )}
        <div className={`grid gap-4 ${compactMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: maxPosts }, (_, i) => (
            <div key={`loading-post-${i + 1}`} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Instagram className="text-pink-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Instagram</h3>
          </div>
        )}
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Instagram className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchInstagramPosts}
            className="mt-3 text-betis-green hover:text-green-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Instagram className="text-pink-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Instagram</h3>
          </div>
          <a 
            href="https://instagram.com/penabetiscaescocesa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-500 transition-colors"
          >
            Follow us <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className={`grid gap-4 ${compactMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Post Image/Video */}
            <div className="relative aspect-square bg-gray-100">
              <Image 
                src={post.media_url} 
                alt="Instagram post"
                width={400}
                height={400}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-instagram.jpg';
                }}
              />
              {post.media_type === 'CAROUSEL_ALBUM' && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Multiple
                </div>
              )}
              {post.media_type === 'VIDEO' && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Video
                </div>
              )}
            </div>

            {!compactMode && (
              <div className="p-4">
                {/* Caption */}
                <p className="text-sm text-gray-800 mb-3 line-clamp-3">
                  {post.caption}
                </p>

                {/* Stats and time */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    {post.like_count && (
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-red-500" />
                        {post.like_count}
                      </div>
                    )}
                    {post.comments_count && (
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-blue-500" />
                        {post.comments_count}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatTimeAgo(post.timestamp)}
                  </div>
                </div>

                {/* View on Instagram */}
                <a 
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-pink-500 hover:text-pink-700 font-medium"
                >
                  View on Instagram <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Follow CTA */}
      <div className="text-center mt-6">
        <a 
          href="https://instagram.com/penabetiscaescocesa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Instagram size={20} />
          Follow @penabetiscaescocesa
        </a>
      </div>
    </div>
  );
}
