import Header from "@/app/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
