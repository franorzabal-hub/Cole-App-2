'use client';

export default function ForceDashboard() {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard');
  }

  return <div>Redirecting...</div>;
}