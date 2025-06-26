'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Users, ExternalLink, Heart, MessageCircle, Share, Calendar } from 'lucide-react';

interface FacebookPost {
  id: string;
  message: string;
  story?: string;
  full_picture?: string;
  created_time: string;
  permalink_url: string;
  likes?: { total_count: number };
  comments?: { total_count: number };
  shares?: { count: number };
  type: 'status' | 'photo' | 'video' | 'link' | 'event';
}

interface FacebookFeedProps {
  maxPosts?: number;
  showHeader?: boolean;
  compactMode?: boolean;
}

export default function FacebookFeed({ 
  maxPosts = 6, 
  showHeader = true, 
  compactMode = false 
}: FacebookFeedProps) {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacebookPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data until Facebook API is configured
      const mockPosts: FacebookPost[] = [
        {
          id: '1',
          message: '🟢⚪ Big match coming up this weekend! We\'ll be at Polwarth Tavern from 2pm for the Betis vs Sevilla derby. Who\'s joining us? ¡Viva el Betis!',
          full_picture: '/images/mock-facebook-1.jpg',
          created_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          permalink_url: 'https://facebook.com/penabetiscaescocesa/posts/1',
          type: 'photo',
          likes: { total_count: 34 },
          comments: { total_count: 12 },
          shares: { count: 8 }
        },
        {
          id: '2',
          message: 'Reminder: Our next peña meeting is this Thursday at 7pm at Polwarth Tavern. We\'ll be discussing upcoming events and the new merchandise collection. All members welcome!',
          created_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          permalink_url: 'https://facebook.com/penabetiscaescocesa/posts/2',
          type: 'status',
          likes: { total_count: 18 },
          comments: { total_count: 5 }
        },
        {
          id: '3',
          story: 'Peña Bética Escocesa shared photos from their album "Match Day at Polwarth"',
          message: 'What a fantastic atmosphere last night! Thanks to everyone who joined us for the Europa League match. The Polwarth was rocking! 🎉🟢⚪',
          full_picture: '/images/mock-facebook-3.jpg',
          created_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          permalink_url: 'https://facebook.com/penabetiscaescocesa/posts/3',
          type: 'photo',
          likes: { total_count: 52 },
          comments: { total_count: 18 },
          shares: { count: 12 }
        },
        {
          id: '4',
          message: 'New arrival alert! 🧣 Our limited edition bufandas are now available for collection. Perfect for the Scottish weather and showing your Betis pride. Message us to reserve yours!',
          full_picture: '/images/mock-facebook-4.jpg',
          created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          permalink_url: 'https://facebook.com/penabetiscaescocesa/posts/4',
          type: 'photo',
          likes: { total_count: 28 },
          comments: { total_count: 9 },
          shares: { count: 4 }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setPosts(mockPosts.slice(0, maxPosts));
    } catch (err) {
      setError('Error loading Facebook posts');
      console.error('Facebook API error:', err);
    } finally {
      setLoading(false);
    }
  }, [maxPosts]);

  useEffect(() => {
    fetchFacebookPosts();
  }, [fetchFacebookPosts]);

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
            <Users className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Facebook</h3>
          </div>
        )}
        <div className="space-y-4">
          {Array.from({ length: maxPosts }, (_, i) => (
            <div key={`loading-fb-post-${i + 1}`} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
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
            <Users className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Facebook</h3>
          </div>
        )}
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Users className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchFacebookPosts}
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
            <Users className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Facebook</h3>
          </div>
          <a 
            href="https://facebook.com/penabetiscaescocesa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Follow us <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Post Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-betis-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PBE</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Peña Bética Escocesa</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={12} />
                    {formatTimeAgo(post.created_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              {post.story && (
                <p className="text-sm text-gray-600 mb-2 italic">{post.story}</p>
              )}
              
              {post.message && (
                <p className="text-gray-800 mb-3 leading-relaxed">
                  {post.message}
                </p>
              )}

              {/* Post Image */}
              {post.full_picture && (
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <Image 
                    src={post.full_picture} 
                    alt="Facebook post"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-facebook.jpg';
                    }}
                  />
                </div>
              )}

              {/* Post Stats and Actions */}
              {!compactMode && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-4">
                      {post.likes && post.likes.total_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart size={14} className="text-red-500" fill="currentColor" />
                          {post.likes.total_count}
                        </div>
                      )}
                      {post.comments && post.comments.total_count > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} className="text-blue-500" />
                          {post.comments.total_count}
                        </div>
                      )}
                      {post.shares && post.shares.count > 0 && (
                        <div className="flex items-center gap-1">
                          <Share size={14} className="text-green-500" />
                          {post.shares.count}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View on Facebook */}
                  <a 
                    href={post.permalink_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View on Facebook <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Follow CTA */}
      <div className="text-center mt-6">
        <a 
          href="https://facebook.com/penabetiscaescocesa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          <Users size={20} />
          Follow our Facebook Page
        </a>
      </div>
    </div>
  );
}
