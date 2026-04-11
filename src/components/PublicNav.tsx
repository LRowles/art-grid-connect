import { Link, useLocation } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

export function PublicNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={artownLogo}
            alt="Artown"
            className="h-10 w-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-primary tracking-tight">Art of Aviation</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium -mt-0.5">
              Community Mural
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/' || location.pathname === '/register'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Register
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            About
          </Link>
          <Link
            to="/admin"
            className="ml-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted transition-all duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
