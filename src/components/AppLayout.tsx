import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, LogOut, Plane, ExternalLink, ClipboardList } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/admin', label: 'Grid', icon: LayoutGrid },
    { to: '/admin/artists', label: 'Artists', icon: Users },
    { to: '/admin/tracking', label: 'Tracking', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="artown-dash w-full" />
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25">
                <Plane className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:inline" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>Mural Admin</span>
            </Link>
            <nav className="flex gap-1 ml-4">
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-[#dc2626] text-black shadow-md shadow-[#dc2626]/25'
                        : 'text-white/40 hover:text-[#dc2626] hover:bg-white/[0.03]'
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
              className="flex items-center gap-1 text-xs text-white/25 hover:text-[#dc2626] transition-colors mr-2"
              style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Public site</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/30 hover:text-red-400 hover:bg-red-500/10"
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
