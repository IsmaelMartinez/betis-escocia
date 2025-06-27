import Link from 'next/link';

export default function HistoriaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold mb-4">Historia de la Peña</h1>
          <p className="text-xl">Conoce cómo nació y creció la Peña Bética Escocesa en Edimburgo.</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          {[
            { year: '2018', title: 'Fundación de la Peña', description: 'Un grupo de béticos inmigrantes y estudiantes en Edimburgo, liderados por Fran y con Jose Mari como primer presidente, decide unirse para ver los partidos juntos en el Polwarth Tavern.' },
            { year: '2019', title: 'Primera reunión oficial en Sevilla', description: 'Juan, asiduo asistente al estadio Benito Villamarín en Sevilla, promueve la primera quedada durante un viaje de la peña a un partido en casa.' },
            { year: '2020', title: 'Consolidación online', description: 'Durante la pandemia, la peña mantuvo vivo el espíritu bético con transmisiones colectivas virtuales y quedadas digitales.' },
            { year: '2021', title: 'Reconocimiento nacional', description: 'La ABC publicó un reportaje destacando nuestra peña como ejemplo de pasión bética en el extranjero. <Link href="https://www.abc.es/deportes/alfinaldelapalmera/noticias-betis/sevi-pena-betica-no-busques-mas-no-embajada-recibe-suyos-escocia-202112091615_noticia.html" target="_blank" className="underline">Leer artículo</Link>.' },
            { year: '2022', title: 'LaLiga nos cita', description: 'LaLiga.com publicó un perfil de la Peña Bética Escocesa: <Link href="https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay" target="_blank" className="underline">Conoce más</Link>.' },
            { year: '2024', title: 'Crecimiento y comunidad', description: 'Hoy más de 100 miembros asisten regularmente a nuestros eventos en Polwarth Tavern y mantenemos viva la llama bética en Escocia.' }
          ].map((item) => (
            <div key={item.year} className="flex items-start gap-6">
              <div className="text-green-700 font-bold text-lg w-20">{item.year}</div>
              <div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* External Links */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Enlaces de interés</h2>
          <ul className="list-disc list-inside text-blue-700 space-y-2">
            <li><Link href="https://x.com/rbetisescocia" target="_blank" className="underline">X (Twitter): @rbetisescocia</Link></li>
            <li><Link href="https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay" target="_blank" className="underline">Foro BetisWeb: Peña Bética Escocesa</Link></li>
            <li><Link href="https://www.manquepierda.com/blog/la-aficion-del-betis-objetivo-elogios/" target="_blank" className="underline">Manquepierda: La afición del Betis</Link></li>
            <li><Link href="https://beticosenescocia.blogspot.com/" target="_blank" className="underline">Beticos en Escocia Blog</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
