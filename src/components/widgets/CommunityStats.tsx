export default function CommunityStats() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-2xl font-black text-betis-green">150+</div>
          <div className="text-xs text-gray-600 font-medium uppercase">MIEMBROS</div>
        </div>
        <div>
          <div className="text-2xl font-black text-betis-green">15</div>
          <div className="text-xs text-gray-600 font-medium uppercase">AÑOS</div>
        </div>
        <div>
          <div className="text-2xl font-black text-betis-green">∞</div>
          <div className="text-xs text-gray-600 font-medium uppercase">RECUERDOS</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 italic">
        &ldquo;Como estar en casa pero viendo el Betis&rdquo;
      </p>
    </div>
  );
}
