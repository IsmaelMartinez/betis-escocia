import PorraCard from '@/components/PorraCard';

export default function PorraPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🎲 La Porra de Fran</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            La tradicional porra de la Peña Bética Escocesa. ¡Demuestra que conoces al Betis y gana premios!
          </p>
        </div>
      </section>

      {/* Current Porra */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PorraCard
            isActive={true}
            opponent="Sevilla FC"
            date="2025-07-15T20:00:00Z"
            prizePool={150}
            totalEntries={23}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Regístrate</h3>
              <p className="text-gray-600 text-sm">Introduce tus datos y paga la entrada de €5</p>
            </div>
            
            <div className="text-center">
              <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Predice</h3>
              <p className="text-gray-600 text-sm">Resultado exacto y primer goleador del Betis</p>
            </div>
            
            <div className="text-center">
              <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Disfruta</h3>
              <p className="text-gray-600 text-sm">Ve el partido con nosotros en Polwarth Tavern</p>
            </div>
            
            <div className="text-center">
              <div className="bg-betis-gold text-betis-dark rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🏆
              </div>
              <h3 className="font-semibold mb-2">¡Gana!</h3>
              <p className="text-gray-600 text-sm">Si aciertas, te llevas el 70% del bote de premios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Previous winners */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Ganadores Anteriores</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Real Betis 2-1 Barcelona</h3>
                <p className="text-gray-600">1 de Junio, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-betis-green">€84</p>
                <p className="text-sm text-gray-600">Premio</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="font-medium">🏆 Ganador: Demo Winner</p>
              <p className="text-sm text-gray-600">Predicción: 2-1, Goleador: Isco</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Fran */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">¿Quién es Fran?</h2>
          <div className="bg-betis-green/10 rounded-lg p-8">
            <p className="text-lg text-gray-700 mb-4">
              Fran es el alma de nuestra porra. Él decide cuándo abrir y cerrar las apuestas, 
              y se encarga de todo el proceso con la dedicación que caracteriza a los béticos.
            </p>
            <p className="text-gray-600">
              La disponibilidad de Fran determina cuándo podemos tener porra. 
              ¡No todos los partidos tienen porra, pero cuando la hay, es épica! 🎲
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
