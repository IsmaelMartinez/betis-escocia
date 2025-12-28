'use client';

export const dynamic = 'force-dynamic';



import { Camera, Hash, ExternalLink } from 'lucide-react';
import InstagramEmbed from '@/components/InstagramEmbed';
import FacebookPagePlugin from '@/components/FacebookPagePlugin';
import { withFeatureFlag, FeatureWrapper } from '@/lib/featureProtection';

function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="text-betis-green" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Galería Social</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our vibrant community through Instagram and Facebook! See the latest photos, 
            updates, and match day moments shared by fellow béticos in Edinburgh.
          </p>
        </div>

        {/* Social Media Integration Info */}
        <div className="bg-gradient-to-r from-betis-green to-green-600 rounded-lg p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Share Your Betis Moments!</h2>
            <p className="text-lg mb-6 opacity-90">
              Tag us in your photos at Polwarth Tavern to be featured in our community feeds
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-sm">📸</span>
                <span className="font-medium">@rbetisescocia</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-sm">📘</span>
                <span className="font-medium">Peña Bética Escocesa</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <Hash size={20} />
                <span className="font-medium">#PenaBetiscaEscocesa</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <Hash size={20} />
                <span className="font-medium">#BetisEdinburgh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Integration Active */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center border-l-4 border-betis-green">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">� Live Social Media Feeds</h3>
          <p className="text-gray-600 mb-6">
            See the latest content from our Instagram and Facebook feeds! Real posts from our community members and official updates from the peña.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com/rbetisescocia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              <span>📸</span>
              Follow on Instagram
              <ExternalLink size={16} />
            </a>
            <a
              href="https://facebook.com/penabetiscaescocesa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>📘</span>
              Follow on Facebook
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Live Social Media Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Instagram Embed */}
          <InstagramEmbed showHeader={true} />
          
          {/* Facebook Page Plugin */}
          <FacebookPagePlugin 
            showHeader={true} 
            height={400}
          />
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Share Your Betis Pride?</h3>
          <p className="text-gray-600 mb-6">
            Join hundreds of béticos sharing their match day experiences and memories from Polwarth Tavern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FeatureWrapper feature="show-rsvp">
              <a
                href="/rsvp"
                className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Join Us at Polwarth
              </a>
            </FeatureWrapper>
            <a
              href="/redes-sociales"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Hash size={20} />
              Social Media Guide
            </a>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-betis-green mb-2">700+</div>
            <div className="text-gray-600">Total Followers</div>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-pink-600">📸</span>
              <span className="text-blue-600">📘</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-betis-green mb-2">150+</div>
            <div className="text-gray-600">Photos Shared</div>
            <div className="text-sm text-gray-500 mt-1">This Month</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-betis-green mb-2">25+</div>
            <div className="text-gray-600">Active Members</div>
            <div className="text-sm text-gray-500 mt-1">Edinburgh Area</div>
          </div>
        </div>

        {/* Hashtag Guidelines */}
        <div className="bg-gradient-to-r from-betis-green to-green-600 rounded-lg p-8 text-white mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center">📱 Social Media Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3">📸 What to Post:</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Match day photos at Polwarth Tavern</li>
                <li>• Community events and gatherings</li>
                <li>• Real Betis celebration moments</li>
                <li>• Edinburgh Betis fan meetups</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">🏷️ Tags to Use:</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• #PenaBetiscaEscocesa</li>
                <li>• #BetisEdinburgh</li>
                <li>• #RealBetis</li>
                <li>• #PolwarthTavern</li>
                <li>• @rbetisescocia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withFeatureFlag(GalleryPage, 'show-galeria');
