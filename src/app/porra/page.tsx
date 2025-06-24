import { redirect } from 'next/navigation';

export default function PorraPage() {
  // Redirect to homepage since La Porra is temporarily unavailable
  redirect('/');
}
