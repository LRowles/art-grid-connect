import { Link, useLocation } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

export function PublicNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
      {/* Artown-style colorful dash line at the very top */}
      <div className="artown-dash w-full" />
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={artownLogo}
            alt="Artown"
            className="h-10 w-auto rounded-md group-hover:brightness-110 transition-all"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-white tracking-tight font-['Oswald'] uppercase">
              Art of Aviation
            </span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-[#7fff00] font-bold -mt-0.5">
              Community Mural
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
              location.pathname === '/' || location.pathname === '/register'
                ? 'bg-[#7fff00] text-black shadow-md shadow-[#7fff00]/25'
                : 'text-white/60 hover:text-[#7fff00] hover:bg-white/5'
            }`}
          >
            Register
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-[#7fff00] text-black shadow-md shadow-[#7fff00]/25'
                : 'text-white/60 hover:text-[#7fff00] hover:bg-white/5'
            }`}
          >
            About
          </Link>
          <Link
            to="/admin"
            className="ml-2 px-3 py-2 rounded text-xs font-medium text-white/20 hover:text-white/50 hover:bg-white/5 transition-all duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
