import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, LogOut, Plane, ExternalLink } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/admin', label: 'Grid', icon: LayoutGrid },
    { to: '/admin/artists', label: 'Artists', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-[hsl(222,47%,8%)]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Plane className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:inline">Mural Admin</span>
            </Link>
            <nav className="flex gap-1 ml-4">
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1 text-xs text-white/30 hover:text-amber-400 transition-colors mr-2"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Public site</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
