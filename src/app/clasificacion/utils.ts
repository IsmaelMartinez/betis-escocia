// Helper function to get position styling
export function getPositionStyle(position: number): string {
  if (position <= 4) return 'text-green-600 font-bold'; // Champions League
  if (position <= 6) return 'text-blue-600 font-bold'; // Europa League
  if (position <= 7) return 'text-orange-600 font-bold'; // Conference League
  if (position >= 18) return 'text-red-600 font-bold'; // Relegation
  return 'text-gray-900';
}

// Helper function to get position badge
export function getPositionBadge(position: number): { text: string; color: string } | null {
  if (position <= 4) return { text: 'UCL', color: 'bg-green-100 text-green-800' };
  if (position <= 6) return { text: 'UEL', color: 'bg-blue-100 text-blue-800' };
  if (position <= 7) return { text: 'UECL', color: 'bg-orange-100 text-orange-800' };
  if (position >= 18) return { text: 'DESC', color: 'bg-red-100 text-red-800' };
  return null;
}

// Helper function to format form
export function formatForm(form: string): string[] {
  return form ? form.split('').slice(-5) : [];
}

// Helper function to get form result style
export function getFormResultStyle(result: string): string {
  switch (result) {
    case 'W': return 'bg-green-500 text-white';
    case 'D': return 'bg-yellow-500 text-white';
    case 'L': return 'bg-red-500 text-white';
    default: return 'bg-gray-300 text-gray-700';
  }
}