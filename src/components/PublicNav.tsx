import { Link, useLocation } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

const navLinks = [
  { to: '/', label: 'Register', match: ['/', '/register'] },
  { to: '/about', label: 'About', match: ['/about'] },
  { to: '/events', label: 'Events', match: ['/events'] },
  { to: '/follow-along', label: 'Follow Along', match: ['/follow-along'] },
];

export function PublicNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 nav-white">
      {/* Artown-style colorful dash line at the very top */}
      <div className="artown-dash w-full" />
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={artownLogo}
            alt="Artown"
            className="h-10 w-auto group-hover:brightness-110 transition-all"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-gray-900 tracking-tight font-['Oswald'] uppercase">
              Art of Aviation
            </span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-[#dc2626] font-bold -mt-0.5">
              Community Mural
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                link.match.includes(location.pathname)
                  ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/25'
                  : 'text-gray-500 hover:text-[#dc2626] hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="ml-2 px-3 py-2 rounded text-xs font-medium text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
