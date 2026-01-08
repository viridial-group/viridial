import { redirect } from 'next/navigation';

export default function Home() {
  // Rediriger vers la page publique de navigation des propriétés
  redirect('/browse');
}
