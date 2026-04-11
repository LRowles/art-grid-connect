import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Plane } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <Plane className="h-12 w-12 text-[#dc2626] mx-auto opacity-60" />
        <h1 className="text-7xl font-black text-white">404</h1>
        <p className="text-lg text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded btn-neon text-sm"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
