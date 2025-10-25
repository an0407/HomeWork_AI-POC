import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ScanLine,
  BookOpen,
  GraduationCap,
  Library,
  Settings,
  Brain,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Scan Homework', path: '/scan', icon: ScanLine },
  { name: 'Practice Tests', path: '/practice', icon: GraduationCap },
  { name: 'Flashcards', path: '/flashcards', icon: Brain },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">
            AI Homework
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
                          location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
