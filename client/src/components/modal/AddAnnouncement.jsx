import { useState } from "react";
import { useDispatch } from "react-redux";
import { broadcastAnnouncement } from "../../store/slices/announcementSlice";
import { X, Megaphone, Send, Info, AlertTriangle, CheckCircle, Flame } from "lucide-react";

const AddAnnouncement = ({ onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    expiresAt: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(broadcastAnnouncement(formData));
    onClose();
  };

  const types = [
    { value: "info", icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    { value: "warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    { value: "danger", icon: Flame, color: "text-rose-500", bg: "bg-rose-50" },
    { value: "success", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium overflow-hidden border border-white/20">
        <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
              <Megaphone size={24} />
            </div>
            <div>
              <h3 className="heading-sm">System Broadcast</h3>
              <p className="text-tiny">Send alert to all users</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Type</label>
            <div className="grid grid-cols-4 gap-3">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.value })}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    formData.type === t.value 
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <t.icon size={20} className={t.color} />
                  <span className="text-[8px] font-bold uppercase mt-1 text-slate-400">{t.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Title</label>
             <input
                required
                placeholder="Important System Update..."
                className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
             />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Message</label>
             <textarea
                required
                rows={3}
                placeholder="All students are requested to complete their profiles by EOD..."
                className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50 transition-all resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
             />
          </div>

          <button
            type="submit"
            className="btn-primary w-full !h-14 !rounded-2xl"
          >
            <Send size={18} />
            Initialize Broadcast
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncement;
