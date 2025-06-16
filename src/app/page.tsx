import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  const headersList = headers();
  const host = headersList.get('host');
  
  // Force server-side redirect
  if (host?.includes('vercel.app')) {
    return redirect('/login');
  }
  
  // Fallback for local development
  return redirect('/login');
} 