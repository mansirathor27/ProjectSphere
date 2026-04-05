import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
      <Link 
        to="/" 
        className="hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <Home size={12} />
        Home
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-slate-300" />
            {last ? (
              <span className="text-blue-600 truncate max-w-[150px]">
                {value.replace(/-/g, " ")}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-blue-600 transition-colors underline-offset-4"
              >
                {value.replace(/-/g, " ")}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
