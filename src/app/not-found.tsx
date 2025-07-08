import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-black text-betis-green mb-4">404</h1>
          <h2 className="text-2xl font-bold text-betis-black mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-betis-green/90 transition-colors"
          >
            Volver al inicio
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>¿Necesitas ayuda? <Link href="/contacto" className="text-betis-green hover:underline">Contáctanos</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
