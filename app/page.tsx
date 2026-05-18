import { redirect } from 'next/navigation';

// Middleware handles language detection and redirects.
// This page is a safety-net fallback only.
export default function RootPage() {
  redirect('/uk');
}
