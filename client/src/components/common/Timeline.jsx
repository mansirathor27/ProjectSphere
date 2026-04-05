import { useMemo } from "react";
import { 
  FileText, 
  MessageSquare, 
  RotateCcw, 
  CheckCircle, 
  Upload, 
  AlertCircle 
} from "lucide-react";

const Timeline = ({ project }) => {
  const events = useMemo(() => {
    if (!project) return [];

    const list = [];

    // 1. Initial Creation
    if (project.createdAt) {
      list.push({
        type: "creation",
        title: "Project Draft Initiated",
        message: "Academic proposal submission started.",
        date: project.createdAt,
        icon: FileText,
        color: "bg-slate-400",
      });
    }

    // 2. File Uploads
    if (project.files) {
      project.files.forEach((file) => {
        list.push({
          type: "upload",
          title: "Artifact Uploaded",
          message: `File: ${file.originalName}`,
          date: file.uploadedAt || project.updatedAt,
          icon: Upload,
          color: "bg-blue-500",
        });
      });
    }

    // 3. Feedback
    if (project.feedback) {
      project.feedback.forEach((f) => {
        list.push({
          type: "feedback",
          title: "Supervisor Feedback",
          message: f.message.substring(0, 80) + "...",
          date: f.createdAt || project.updatedAt,
          icon: MessageSquare,
          color: "bg-indigo-600",
        });
      });
    }

    // 4. Status updates (Manual check from history isn't perfect without a dedicated audit log, but we can simulate/lookup)
    if (project.status === "approved") {
        list.push({
            type: "status",
            title: "Project Approved",
            message: "Thesis proposal has been validated by Admin.",
            date: project.updatedAt,
            icon: CheckCircle,
            color: "bg-emerald-500",
          });
    }

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [project]);

  if (events.length === 0) return null;

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
      {events.map((event, i) => (
        <div key={i} className="relative flex items-start gap-6 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-2xl ${event.color} text-white shadow-lg transition-transform group-hover:scale-110 z-10`}>
            <event.icon size={20} />
          </div>
          
          <div className="flex-1 pt-0.5 ml-14">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{event.title}</h4>
              <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">
              "{event.message}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
