import Link from 'next/link';
import { MapPin, Users, MessageCircle, Heart } from 'lucide-react';

export default function Unete() {
  const steps = [
    {
      number: 1,
      title: "Aparece en el Polwarth",
      description: "Simplemente ven al Polwarth Tavern 15 minutos antes de cualquier partido del Betis.",
      icon: "📍",
      details: "No hace falta avisar ni reservar. Solo aparece y pregunta por cualquiera de la peña."
    },
    {
      number: 2,
      title: "Preséntate",
      description: "Di que eres bético y que has visto que tenemos una peña aquí. Te haremos sitio inmediatamente.",
      icon: "👋",
      details: "Somos muy acogedores. En 5 minutos ya estarás integrado como uno más."
    },
    {
      number: 3,
      title: "Disfruta del partido",
      description: "Vive el partido con nosotros. Verás que el ambiente es familiar, relajado y siempre con buen rollo.",
      icon: "⚽",
      details: "Cantamos, sufrimos, celebramos y vivimos cada jugada como si estuviéramos en el Villamarín."
    },
    {
      number: 4,
      title: "Únete digitalmente",
      description: "Si te gusta el ambiente, únete a nuestro grupo de Facebook e Instagram para estar al día.",
      icon: "📱",
      details: "Así podrás seguir todas las novedades, fotos y planes entre partidos.",
      links: [
        { label: "Facebook", href: "https://www.facebook.com/groups/beticosenescocia/", icon: "📘" },
        { label: "Instagram", href: "https://www.instagram.com/rbetisescocia/", icon: "📷" }
      ]
    }
  ];

  const faqs = [
    {
      question: "¿Tengo que ser socio del Betis?",
      answer: "No es necesario. Solo necesitas ser bético de corazón y tener ganas de compartir la pasión por nuestro equipo."
    },
    {
      question: "¿Hay que pagar algo?",
      answer: "Solo tu consumición en el pub. La peña no cobra cuotas ni tiene gastos fijos. Todo es voluntario y familiar."
    },
    {
      question: "¿Puedo venir con amigos no béticos?",
      answer: "¡Por supuesto! Siempre que respeten nuestros colores y no celebren goles en contra, todos son bienvenidos."
    },
    {
      question: "¿Qué pasa si el Betis pierde?",
      answer: "Nos consolamos juntos, analizamos el partido y ya empezamos a pensar en el siguiente. La familia está para lo bueno y lo malo."
    },
    {
      question: "¿Hay ambiente familiar?",
      answer: "Totalmente. Vienen padres con hijos, parejas, estudiantes, trabajadores... Es un ambiente muy sano y acogedor."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-betis-verde text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Únete
          </h1>
          <p className="text-xl sm:text-2xl mb-6 font-bold text-betis-oro drop-shadow-lg">
            Ser bético en Escocia nunca fue tan fácil
          </p>
          <p className="text-lg max-w-3xl mx-auto text-white leading-relaxed font-medium drop-shadow-xl">
            No importa si acabas de llegar a Edinburgh o si llevas años aquí. 
            Si eres bético, ya tienes sitio en nuestra mesa.
          </p>
        </div>
      </div>

      {/* How to Join Steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-verde text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              🚀 PROCESO FÁCIL
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              CÓMO UNIRTE
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Es tan fácil como aparecer. No hay formularios, cuotas ni complicaciones.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 max-w-lg">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-betis-verde text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                        {step.number}
                      </div>
                      <span className="text-4xl">{step.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-800 mb-4 leading-relaxed text-base">
                      {step.description}
                    </p>
                    <div className="bg-betis-verde-light rounded-lg p-4 border-l-4 border-betis-verde">
                      <p className="text-sm text-gray-700 font-medium">
                        💡 {step.details}
                      </p>
                    </div>
                    {step.links && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {step.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                          >
                            <span>{link.icon}</span>
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 max-w-lg">
                  <div className="bg-gradient-to-br from-betis-verde-light to-betis-oro-light rounded-2xl p-8 border border-betis-verde/20">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{step.icon}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Paso {step.number}
                      </h4>
                      <p className="text-gray-700 font-medium">
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-verde text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              📍 INFORMACIÓN PRÁCTICA
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              TODO LO QUE NECESITAS SABER
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <MapPin className="h-12 w-12 text-betis-verde mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h3>
              <p className="text-gray-800 mb-4 leading-relaxed">
                <strong className="text-gray-900">Polwarth Tavern</strong><br />
                35 Polwarth Cresace<br />
                Edinburgh EH11 1HR
              </p>
              <a
                href="https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-betis-verde hover:bg-betis-verde-dark text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver en Maps
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <Users className="h-12 w-12 text-betis-verde mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-800 mb-4 leading-relaxed">
                <strong className="text-gray-900">¿Dudas?</strong><br />
                Escríbenos por Facebook,<br />
                Instagram o YouTube
              </p>
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-betis-verde hover:bg-betis-verde-dark text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar
              </a>
            </div>
          </div>

          {/* Special Welcome for Tourists */}
          <div className="bg-gradient-to-r from-betis-verde-light to-betis-oro-light rounded-2xl p-8 border border-betis-verde/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-betis-verde mr-3" />
                🏴󠁧󠁢󠁳󠁣󠁴󠁿 ¿Estás de visita en Escocia?
              </h3>
              <p className="text-lg text-gray-800 mb-6 leading-relaxed max-w-3xl mx-auto">
                Si eres bético y estás de vacaciones, trabajo o estudios en Edinburgh, 
                ¡eres especialmente bienvenido! Nos encanta conocer béticos de toda España 
                y hacer que se sientan como en casa.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">✈️ Turistas</h4>
                  <p className="text-sm text-gray-700">
                    Si coincides con un partido durante tu visita, ven y vive la experiencia 
                    de ser bético en Escocia.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">🎓 Estudiantes</h4>
                  <p className="text-sm text-gray-700">
                    Edinburgh tiene muchos estudiantes españoles. Si eres bético y estudias aquí, 
                    esta es tu casa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              PREGUNTAS FRECUENTES
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              RESOLVEMOS TUS DUDAS
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-betis-verde text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    ?
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-800 leading-relaxed pl-9 text-base">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-betis-verde to-betis-verde-dark text-white relative">
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl">
            💚 ¿A qué esperas?
          </h2>
          <p className="text-xl mb-8 text-white font-medium leading-relaxed drop-shadow-lg">
            El próximo partido del Betis puede ser el momento perfecto para conocernos. 
            Te garantizamos que volverás.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/partidos"
              className="bg-betis-oro hover:bg-betis-oro-dark text-betis-dark px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              📅 Ver próximo partido
            </Link>
            <a
              href="https://www.facebook.com/groups/beticosenescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-betis-verde px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              💬 Contactar por Facebook
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
