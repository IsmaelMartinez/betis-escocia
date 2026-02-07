import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy, Heart, Camera } from "lucide-react";
import { LEYENDAS } from "@/data/leyendas";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;

  // Easter egg: Only Sabaly has a special page
  if (id !== "youssouf-sabaly") {
    notFound();
  }

  const player = LEYENDAS.find((p) => p.id === id);

  if (!player) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-betis-verde-pale via-white to-betis-verde-pale">
      {/* Header */}
      <div className="bg-betis-verde text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/jugadores-historicos"
            className="inline-flex items-center gap-2 text-white hover:text-betis-oro transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Volver a Leyendas</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {player.name}
          </h1>
          <p className="text-betis-oro text-lg">{player.position}</p>
          <p className="text-white/90">{player.years}</p>
        </div>
      </div>

      {/* Special Easter Egg Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Easter Egg Badge */}
        <div className="bg-betis-oro/20 border-2 border-betis-oro rounded-lg p-6 mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Heart className="w-8 h-8 text-betis-verde animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-betis-verde-dark mb-2">
            Un Héroe de La Peña Bética Edimburgo
          </h2>
          <p className="text-gray-700 italic">
            "Descubriste el secreto mejor guardado de nuestra peña..."
          </p>
        </div>

        {/* Special Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-betis-oro" />
            <h2 className="text-2xl font-bold text-betis-verde-dark">
              La Bufanda de Edimburgo en la Final
            </h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              El 23 de abril de 2022, el Real Betis Balompié conquistó su
              tercera Copa del Rey en La Cartuja. Mientras todo el mundo
              celebraba, los miembros de La Peña Bética de Edimburgo notamos
              algo muy especial: <strong>Youssouf Sabaly lucía nuestra bufanda
              verdiblanca escocesa</strong> durante toda la celebración.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Desde las gradas hasta el césped, desde el palco hasta el
              autobús del equipo, Sabaly no se quitó la bufanda que representa
              el puente entre Sevilla y Edimburgo. Un gesto que quedó grabado
              para siempre en el corazón de todos los béticos escoceses.
            </p>

            <div className="bg-betis-verde-light rounded-lg p-6 my-6 border-l-4 border-betis-verde">
              <p className="text-betis-verde-dark font-semibold italic">
                "Ver a Sabaly con nuestra bufanda en el momento más glorioso
                del club moderno fue algo indescriptible. Nos hizo sentir parte
                de ese triunfo, aunque estuviéramos a miles de kilómetros."
              </p>
              <p className="text-sm text-gray-600 mt-2">
                — La Peña Bética Edimburgo
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              Sabaly no solo fue pieza fundamental en el once titular que
              ganó la Copa. Fue el jugador que nos representó en el campo,
              que llevó los colores verdes y blancos con el orgullo escocés
              entrelazado. Por eso, para nosotros, Sabaly siempre será más
              que un lateral derecho: es un embajador de La Peña Bética en
              Edimburgo.
            </p>
          </div>
        </div>

        {/* Career Highlights with La Peña Connection */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-betis-verde-dark mb-6">
            Momentos Inolvidables
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-betis-verde rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-betis-verde-dark mb-1">
                  Final de Copa del Rey 2022
                </h3>
                <p className="text-gray-700">
                  Titular indiscutible en La Cartuja. Defendió con todo y
                  celebró con nuestra bufanda.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-betis-verde rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-betis-verde-dark mb-1">
                  Más de 150 Partidos
                </h3>
                <p className="text-gray-700">
                  Seis temporadas de entrega total al Real Betis (2018-2024).
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-betis-verde rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-betis-verde-dark mb-1">
                  Conexión con Escocia
                </h3>
                <p className="text-gray-700">
                  El único jugador del Betis moderno que ha honrado a nuestra
                  peña de manera tan visible y emotiva.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Placeholder */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-betis-oro" />
            <h2 className="text-2xl font-bold text-betis-verde-dark">
              Galería de Recuerdos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placeholder for photos */}
            <div className="aspect-video bg-betis-verde-pale rounded-lg flex items-center justify-center border-2 border-betis-verde/20">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-betis-verde mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Sabaly con la bufanda
                  <br />
                  Copa del Rey 2022
                </p>
              </div>
            </div>

            <div className="aspect-video bg-betis-verde-pale rounded-lg flex items-center justify-center border-2 border-betis-verde/20">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-betis-verde mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Celebración en La Cartuja
                  <br />
                  23 de abril 2022
                </p>
              </div>
            </div>

            <div className="aspect-video bg-betis-verde-pale rounded-lg flex items-center justify-center border-2 border-betis-verde/20">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-betis-verde mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  En el palco con la bufanda
                  <br />
                  Momento histórico
                </p>
              </div>
            </div>

            <div className="aspect-video bg-betis-verde-pale rounded-lg flex items-center justify-center border-2 border-betis-verde/20">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-betis-verde mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Con sus compañeros
                  <br />
                  Autobús del equipo
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-betis-oro/10 rounded-lg border border-betis-oro/30">
            <p className="text-sm text-gray-700 italic">
              <strong>Nota:</strong> Si tienes fotos de Sabaly con la bufanda
              de La Peña Bética Edimburgo, contáctanos para añadirlas a esta
              galería especial.
            </p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="bg-gradient-to-r from-betis-verde to-betis-verde-dark text-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Gracias, Youssouf
          </h2>
          <p className="text-lg mb-4">
            Por llevar los colores de Escocia en tu corazón y en tus hombros
            durante el momento más glorioso del Betis moderno.
          </p>
          <p className="text-betis-oro font-semibold text-xl">
            Siempre serás uno de los nuestros.
          </p>
          <p className="mt-4 text-sm text-white/80">
            🏴󠁧󠁢󠁳󠁣󠁴󠁿 La Peña Bética Edimburgo 💚
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/jugadores-historicos"
            className="inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a todas las leyendas
          </Link>
        </div>
      </div>
    </main>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  if (id !== "youssouf-sabaly") {
    return {
      title: "Jugador no encontrado",
    };
  }

  return {
    title: "Youssouf Sabaly - Un Héroe de La Peña Bética Edimburgo",
    description:
      "El lateral senegalés que llevó nuestra bufanda escocesa durante la conquista de la Copa del Rey 2022. Un honor para La Peña Bética Edimburgo.",
  };
}
