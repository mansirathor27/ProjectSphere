import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveAnnouncements } from "../../store/slices/announcementSlice";
import { Megaphone, X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

const AnnouncementBanner = () => {
  const dispatch = useDispatch();
  const { list: announcements } = useSelector((state) => state.announcements);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    dispatch(getActiveAnnouncements());
  }, [dispatch]);

  if (!isVisible || !announcements || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getStyles = (type) => {
    switch (type) {
      case "warning": return "bg-amber-600 font-bold border-amber-500 shadow-amber-500/20";
      case "danger": return "bg-rose-600 font-bold border-rose-500 shadow-rose-500/20";
      case "success": return "bg-emerald-600 font-bold border-emerald-500 shadow-emerald-500/20";
      default: return "bg-blue-600 font-bold border-blue-500 shadow-blue-500/20";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "warning": return <AlertTriangle size={18} />;
      case "danger": return <AlertCircle size={18} />;
      case "success": return <CheckCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[40] w-[95%] max-w-4xl animate-in slide-in-from-top-full duration-500`}>
      <div className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-2xl flex items-center gap-4 group transition-all`}>
        <div className={`p-3 rounded-xl text-white ${getStyles(current.type)} shadow-lg`}>
          {getIcon(current.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">System Broadcast</span>
             <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{current.title}</h4>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{current.message}</p>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Multi-announcement navigation */}
        {announcements.length > 1 && (
           <div className="hidden group-hover:flex absolute bottom-1 right-1/2 translate-x-1/2 gap-1">
              {announcements.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-blue-600' : 'w-1 bg-slate-300'}`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
