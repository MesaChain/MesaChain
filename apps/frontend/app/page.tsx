import { ReserveButton } from '../components/Reserve/ReserveButton';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <section className="text-center py-24">
        <h1 className="text-4xl font-bold mb-6">Reserva tu mesa en segundos</h1>
        <p className="mb-8 text-lg text-gray-600">¡Reserva online y asegura tu lugar!</p>
        <ReserveButton />
      </section>
    </main>
  );
}
