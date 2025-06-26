'use client';

import { Camera, Hash, ExternalLink, Heart, MessageCircle, Share2 } from 'lucide-react';

export default function GalleryPage() {
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
              Tag us in your photos wearing peña merchandise or at Polwarth Tavern to be featured in our community feeds
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-sm">📸</span>
                <span className="font-medium">@penabetiscaescocesa</span>
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

        {/* Coming Soon Notice */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center border-l-4 border-betis-green">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🚧 Social Media Integration Coming Soon!</h3>
          <p className="text-gray-600 mb-6">
            We&apos;re working on integrating Instagram and Facebook feeds to automatically display photos from our community. 
            In the meantime, follow us on social media to stay connected!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com/penabetiscaescocesa"
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

        {/* Mock Social Media Feed Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Instagram Preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <h3 className="font-bold text-lg">Instagram Feed</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Mock Instagram Posts */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-betis-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                      PB
                    </div>
                    <div>
                      <p className="font-medium text-sm">@penabetiscaescocesa</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-32 rounded-lg mb-3 flex items-center justify-center">
                    <Camera className="text-gray-400" size={32} />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <Heart size={16} className="text-red-500" />
                    <MessageCircle size={16} className="text-gray-600" />
                    <Share2 size={16} className="text-gray-600" />
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">15 likes</span>
                  </p>
                  <p className="text-sm mt-1">
                    Ready for today&apos;s match at Polwarth! 💚🤍 #BetisEdinburgh #PenaBetiscaEscocesa
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-betis-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                      PB
                    </div>
                    <div>
                      <p className="font-medium text-sm">@penabetiscaescocesa</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-32 rounded-lg mb-3 flex items-center justify-center">
                    <Camera className="text-gray-400" size={32} />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <Heart size={16} className="text-red-500" />
                    <MessageCircle size={16} className="text-gray-600" />
                    <Share2 size={16} className="text-gray-600" />
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">23 likes</span>
                  </p>
                  <p className="text-sm mt-1">
                    New merchandise arrived! Check out our coleccionables 📦✨ #BetisEdinburgh
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📘</span>
                <h3 className="font-bold text-lg">Facebook Feed</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Mock Facebook Posts */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-betis-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                      PB
                    </div>
                    <div>
                      <p className="font-medium text-sm">Peña Bética Escocesa</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-32 rounded-lg mb-3 flex items-center justify-center">
                    <Camera className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm mb-3">
                    Great turnout at Polwarth Tavern today! Thanks to everyone who joined us to support Real Betis. 
                    The atmosphere was incredible! 💚🤍
                  </p>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" />
                      18
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      5 comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={14} />
                      2 shares
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-betis-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                      PB
                    </div>
                    <div>
                      <p className="font-medium text-sm">Peña Bética Escocesa</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">
                    🎉 Event Alert! Join us this Sunday at Polwarth Tavern for the big match. 
                    RSVP on our website to let us know you&apos;re coming!
                  </p>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" />
                      32
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      8 comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={14} />
                      5 shares
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Share Your Betis Pride?</h3>
          <p className="text-gray-600 mb-6">
            Join hundreds of béticos sharing their match day experiences, merchandise collections, and memories from Polwarth Tavern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/coleccionables"
              className="inline-flex items-center gap-2 bg-betis-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              View Our Merchandise
            </a>
            <a
              href="/rsvp"
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Join Us at Polwarth
            </a>
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
                <li>• Merchandise collection photos</li>
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
                <li>• @penabetiscaescocesa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
