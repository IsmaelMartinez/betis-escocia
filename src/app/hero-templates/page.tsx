import Hero from '@/components/Hero';
import HeroCommunity from '@/components/HeroCommunity';
import HeroFriends from '@/components/HeroFriends';
import HeroWarm from '@/components/HeroWarm';
import HeroSocial from '@/components/HeroSocial';

export default function HeroTemplates() {
  return (
    <div>
      {/* Navigation between templates */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-200">
        <h3 className="font-bold text-betis-black mb-3 text-sm">Hero Templates:</h3>
        <div className="space-y-2 text-xs">
          <a href="#original" className="block text-betis-green hover:text-betis-green-dark">
            1. Original (Dark & Modern)
          </a>
          <a href="#community" className="block text-betis-green hover:text-betis-green-dark">
            2. Community (Family Focus)
          </a>
          <a href="#friends" className="block text-betis-green hover:text-betis-green-dark">
            3. Friends (Stories & Light)
          </a>
          <a href="#warm" className="block text-betis-green hover:text-betis-green-dark">
            4. Warm (Personal & Inviting)
          </a>
          <a href="#social" className="block text-betis-green hover:text-betis-green-dark">
            5. Social (Social Media Style)
          </a>
        </div>
      </div>

      {/* Original Hero (current) */}
      <section id="original">
        <div className="bg-red-500 text-white text-center py-2 font-bold">
          TEMPLATE 1: ORIGINAL (Dark & Modern)
        </div>
        <Hero />
      </section>

      {/* Community Hero */}
      <section id="community">
        <div className="bg-blue-500 text-white text-center py-2 font-bold">
          TEMPLATE 2: COMMUNITY (Family Focus)
        </div>
        <HeroCommunity />
      </section>

      {/* Friends Hero */}
      <section id="friends">
        <div className="bg-green-500 text-white text-center py-2 font-bold">
          TEMPLATE 3: FRIENDS (Stories & Light)
        </div>
        <HeroFriends />
      </section>

      {/* Warm Hero */}
      <section id="warm">
        <div className="bg-yellow-500 text-black text-center py-2 font-bold">
          TEMPLATE 4: WARM (Personal & Inviting)
        </div>
        <HeroWarm />
      </section>

      {/* Social Hero */}
      <section id="social">
        <div className="bg-purple-500 text-white text-center py-2 font-bold">
          TEMPLATE 5: SOCIAL (Social Media Style)
        </div>
        <HeroSocial />
      </section>
    </div>
  );
}
