import { useRouter } from 'next/router';

export const ReserveButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/reserve')}
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Reserve a Table
    </button>
  );
}; 