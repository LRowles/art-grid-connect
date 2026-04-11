import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Plane } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <Plane className="h-7 w-7" />
        </div>
        <h1 className="text-5xl font-black text-white">404</h1>
        <p className="text-lg text-white/50">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
