'use client';

import { useRouter } from 'next/navigation';

export default function TestRedirect() {
  const router = useRouter();

  const testNavigations = () => {
    console.log('Testing navigations...');

    // Test 1: router.push
    console.log('Test 1: router.push("/dashboard")');
    router.push('/dashboard');

    // Test 2: router.replace after delay
    setTimeout(() => {
      console.log('Test 2: router.replace("/dashboard")');
      router.replace('/dashboard');
    }, 2000);

    // Test 3: window.location after delay
    setTimeout(() => {
      console.log('Test 3: window.location.href = "/dashboard"');
      window.location.href = '/dashboard';
    }, 4000);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Redirect</h1>

      <div className="space-y-4">
        <button
          onClick={testNavigations}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test All Navigation Methods
        </button>

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Direct window.location
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Direct router.push
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p>Check console for navigation attempts</p>
        <p>If none work, there might be a middleware or guard blocking</p>
      </div>
    </div>
  );
}