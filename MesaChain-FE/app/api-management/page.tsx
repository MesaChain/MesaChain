import APIManagement from "@/components/ApiManagement";

export const metadata = {
  title: "API Management - MesaChain",
  description: "Manage your MesaChain API and study documentations.",
};

export default function APIManagementPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <APIManagement />
      </div>
    </main>
  );
}
