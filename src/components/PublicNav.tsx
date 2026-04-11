import { Link, useLocation } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

export function PublicNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-[hsl(222,47%,8%)]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={artownLogo}
            alt="Artown"
            className="h-10 w-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow border border-white/10"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-white tracking-tight">Art of Aviation</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-semibold -mt-0.5">
              Community Mural
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/' || location.pathname === '/register'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Register
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            About
          </Link>
          <Link
            to="/admin"
            className="ml-2 px-3 py-2 rounded-lg text-xs font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
