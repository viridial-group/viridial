import { redirect } from 'next/navigation';

export default function Home() {
  // Rediriger vers la page de login par défaut
  redirect('/login');
}
