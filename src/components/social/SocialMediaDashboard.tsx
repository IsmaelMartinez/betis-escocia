'use client';

import { useState } from 'react';
import { Camera, Users, Hash, ExternalLink } from 'lucide-react';
import InstagramEmbed from './InstagramEmbed';
import FacebookPagePlugin from './FacebookPagePlugin';

interface SocialMediaDashboardProps {
  readonly showHashtags?: boolean;
}

export default function SocialMediaDashboard({ 
  showHashtags = true
}: SocialMediaDashboardProps) {
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'both'>('both');

  const hashtags = [
    '#PenaBetiscaEscocesa',
    '#BetisEdinburgh', 
    '#ManqueGanemos',
    '#VivaElBetis',
    '#BetisScotland',
    '#PolwarthTavern',
    '#VerdePorSiempre'
  ];

  const socialLinks = [
    {
      platform: 'Instagram',
      icon: Camera,
      url: 'https://instagram.com/penabetiscaescocesa',
      handle: '@penabetiscaescocesa',
      followers: '280+',
      color: 'from-purple-500 to-pink-500'
    },
    {
      platform: 'Facebook',
      icon: Users,
      url: 'https://facebook.com/penabetiscaescocesa',
      handle: 'Peña Bética Escocesa',
      followers: '420+',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const handleHashtagClick = (tag: string) => {
    navigator.clipboard.writeText(tag);
  };

  const handleHashtagKeyDown = (event: React.KeyboardEvent, tag: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleHashtagClick(tag);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Social Media Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialLinks.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className={`bg-gradient-to-r ${social.color} p-6 rounded-lg text-white hover:shadow-lg transition-all transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <social.icon size={32} />
                  <div>
                    <h3 className="text-xl font-bold">{social.platform}</h3>
                    <p className="text-sm opacity-90">{social.handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{social.followers}</div>
                  <div className="text-sm opacity-90">followers</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Follow us <ExternalLink size={16} />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Hashtags Section */}
      {showHashtags && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="text-betis-green" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Follow & Tag Us</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Use these hashtags to be featured in our community gallery and connect with fellow béticos in Edinburgh!
          </p>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <button
                key={tag}
                className="inline-block bg-betis-green text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-betis-verde-dark transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={() => handleHashtagClick(tag)}
                onKeyDown={(e) => handleHashtagKeyDown(e, tag)}
                title="Click to copy"
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Click any hashtag to copy it to your clipboard
          </p>
        </div>
      )}

      {/* Feed Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-1 flex">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'both'
                ? 'bg-betis-green text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Both Feeds
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'instagram'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Instagram Only
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'facebook'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Facebook Only
          </button>
        </div>
      </div>

      {/* Social Media Feeds */}
      <div className="space-y-8">
        {(activeTab === 'both' || activeTab === 'instagram') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <InstagramEmbed 
              showHeader={activeTab === 'both'}
            />
          </div>
        )}

        {(activeTab === 'both' || activeTab === 'facebook') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <FacebookPagePlugin 
              showHeader={activeTab === 'both'}
              height={400}
            />
          </div>
        )}
      </div>

      {/* Community Engagement CTA */}
      <div className="bg-gradient-to-r from-betis-green to-green-600 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Join Our Digital Community!</h3>
        <p className="text-lg mb-6 opacity-90">
          Share your match day experiences, connect with fellow béticos, and stay updated with all things Peña Bética Escocesa
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://instagram.com/penabetiscaescocesa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-betis-green px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Camera size={20} />
            Follow on Instagram
          </a>
          <a
            href="https://facebook.com/penabetiscaescocesa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Users size={20} />
            Like on Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
