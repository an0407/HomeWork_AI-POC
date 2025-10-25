import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ScanLine,
  GraduationCap,
  Library,
  Brain,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Scan', path: '/scan', icon: ScanLine },
  { name: 'Practice', path: '/practice', icon: GraduationCap },
  { name: 'Flashcards', path: '/flashcards', icon: Brain },
  { name: 'Library', path: '/library', icon: Library },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
                          location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px] transition-colors',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
