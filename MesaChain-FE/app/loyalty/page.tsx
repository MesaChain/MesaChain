import LoyaltyDashboard from "@/components/Loyalty/LoyaltyDashboard";

export const metadata = {
  title: "Loyalty Program - MesaChain",
  description: "Manage your MesaChain loyalty tokens and rewards.",
};

export default function LoyaltyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <LoyaltyDashboard />
      </div>
    </main>
  );
}
