import { Link, useLocation } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

export function PublicNav() {
  const location = useLocation();

  return (
    <nav className="border-b bg-card px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={artownLogo} alt="Artown" className="h-10 w-auto rounded" />
          <span className="text-lg font-bold text-foreground hidden sm:inline">Art of Aviation</span>
        </Link>
        <div className="flex gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/' || location.pathname === '/register'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Register
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/about'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
