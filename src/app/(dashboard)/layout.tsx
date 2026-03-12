import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardProviders } from '@/components/layout/DashboardProviders';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardProviders>
        <Sidebar />
        <main className="ml-52 min-h-screen">{children}</main>
      </DashboardProviders>
    </div>
  );
}
