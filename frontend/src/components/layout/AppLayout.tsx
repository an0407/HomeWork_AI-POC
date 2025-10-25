import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
