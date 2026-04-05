import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats, addFeedbackToState, updateProjectState } from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  LayoutDashboard, 
  User, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  FolderOpen,
  ArrowRight,
  Target,
  FileText,
  Clock,
  History,
  ClipboardList,
  BookOpen,
  ChevronRight,
  Plus,
  TrendingUp,
  Files,
  Activity,
  MessageSquare,
  Users,
  Edit2,
  Info
} from "lucide-react";
import Timeline from "../../components/common/Timeline";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import LoadingState from "../../components/ui/LoadingState";
import { connectSocket, getSocket } from "../../lib/socket";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats, loading, feedback } = useSelector((state) => state.student);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Real-time synchronization with Optimistic Updates
  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
      const socket = getSocket();

      const handleFeedback = (data) => {
        if (data.feedback) {
          dispatch(addFeedbackToState(data.feedback));
        }
        dispatch(fetchDashboardStats());
      };

      const handleProjectUpdate = (data) => {
        if (data.project) {
          dispatch(updateProjectState(data.project));
        }
        dispatch(fetchDashboardStats());
      };

      socket.on("new_feedback", handleFeedback);
      socket.on("project_updated", handleProjectUpdate);
      socket.on("new_notification", () => dispatch(fetchDashboardStats()));

      return () => {
        socket.off("new_feedback", handleFeedback);
        socket.off("project_updated", handleProjectUpdate);
        socket.off("new_notification");
      };
    }
  }, [authUser?._id, dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "Unassigned";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  
  // Use real-time feedback list from state if available, otherwise from stats
  const feedbackList = feedback?.length > 0 ? feedback : (dashboardStats?.feedbackNotifications || []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      approved: "badge-success",
      pending: "badge-amber",
      rejected: "badge-danger",
    };
    return map[status] || "badge-primary";
  };

  const handleUpdateGroupName = async (e) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    try {
       await axiosInstance.put(`/project/${project._id}/group-name`, { groupName: groupNameInput });
       toast.success("Group name updated successfully");
       setIsUpdatingName(false);
       dispatch(fetchDashboardStats());
    } catch (error) {
       toast.error("Failed to update group name");
    }
  };

  if (loading && !dashboardStats) {
    return <LoadingState label="Loading academic workspace..." />;
  }

  const isGroup = project?.students?.length > 1;
  const needsGroupName = isGroup && !project.groupName;

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/50 p-10 shadow-2xl shadow-slate-200/20 dark:border-slate-800/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 dark:shadow-none">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/5 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/5 blur-[100px]" />
        
        <div className="relative">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <span className="badge-primary">Student Workspace</span>
              <h1 className="heading-lg">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{authUser?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-body max-w-2xl">
                Manage your academic research, track supervisor feedback, and stay ahead of project milestones.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link to={`/student/chat/${project?._id}`} className="btn-outline px-8">
                <MessageSquare size={18} />
                Open Chat
              </Link>
              <Link to="/student/submit-proposal" className="btn-primary px-8">
                <Plus size={18} />
                {project?._id ? "Update Proposal" : "New Proposal"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Group Naming Alert */}
      {needsGroupName && (
         <div className="premium-card bg-amber-500/5 border-amber-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
               <Users size={120} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="h-14 w-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600">
                  <AlertCircle size={30} />
               </div>
                <div>
                   <h4 className="heading-md text-amber-900 dark:text-amber-400">Action Required: Name Your Group</h4>
                   <p className="text-body-bold text-amber-800/70 dark:text-amber-500/60 font-bold">Teachers need a group name to identify your team in the chat hub.</p>
                </div>
            </div>
            <form onSubmit={handleUpdateGroupName} className="flex items-center gap-2 relative z-10 w-full md:w-auto">
               <input 
                  className="bg-white dark:bg-slate-800 border-2 border-amber-500/20 rounded-2xl px-4 py-3 text-body-bold focus:ring-4 focus:ring-amber-500/10 outline-none w-full md:w-64 font-bold"
                  placeholder="Enter a creative group name..."
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
               />
               <button type="submit" className="btn-secondary whitespace-nowrap bg-amber-600 hover:bg-amber-700 shadow-amber-600/20">
                  Save Name
               </button>
            </form>
         </div>
      )}

      {/* Real-time Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Supervisor", value: supervisorName, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-600/10" },
          { label: "Total Artifacts", value: project?.files?.length || 0, icon: Files, color: "text-emerald-600", bg: "bg-emerald-600/10" },
          { label: "Feedback Cycles", value: feedbackList.length, icon: MessageCircle, color: "text-indigo-600", bg: "bg-indigo-600/10" },
          { label: "Project Status", value: project?.status || "Draft", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-600/10" },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center gap-5 hover:translate-x-1 transition-transform">
            <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 animate-float`}>
              <stat.icon size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-tiny mb-1">{stat.label}</p>
              <h4 className="heading-md truncate">{stat.value}</h4>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Project Details Card */}
          <div className="premium-card">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <BookOpen size={24} />
                 </div>
                 <h3 className="heading-md">Project Insight</h3>
              </div>
              <span className={getStatusBadge(project?.status)}>
                {project?.status || "Draft"}
              </span>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                {isGroup && (
                   <div className="flex items-center gap-2 mb-2">
                      <span className="badge-primary bg-indigo-600/10 text-indigo-600">
                        Group: {project.groupName || "Unnamed"}
                      </span>
                   </div>
                )}
                <h4 className="heading-lg">
                  {project?.title || "Project title pending assignment"}
                </h4>
                <p className="text-body">
                  {project?.description || "Your full project description will be available once your proposal is approved by the academic committee."}
                </p>
                
                {project?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-tiny text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700 font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Assigned Supervisor", value: supervisorName, icon: User, color: "text-blue-500" },
                  { label: "Team Configuration", value: isGroup ? "Group Project" : "Individual", icon: Users, color: "text-indigo-500" },
                  { label: "Documentation", value: `${project?.files?.length || 0} Artifacts`, icon: Files, color: "text-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-tiny mb-2">{item.label}</p>
                    <div className="flex items-center gap-2 text-body-bold">
                       <item.icon size={18} className={item.color} />
                       <span className="truncate">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="heading-md flex items-center gap-3">
                <Activity className="text-blue-600 font-bold" size={24} />
                Activity Timeline
              </h3>
              <Link to="/student/upload-files" className="btn-outline px-6 py-2 rounded-xl text-xs">
                 Sync Files
              </Link>
            </div>

            <div className="space-y-4">
              {project?._id ? (
                <Timeline project={project} />
              ) : (
                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                  <ClipboardList className="mx-auto text-slate-300 dark:text-slate-800 mb-4" size={56} />
                  <p className="text-body-bold text-slate-400 italic">Initiate project workspace to see timeline tracking.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
               <TrendingUp size={160} />
            </div>
            <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                      <span className="text-tiny uppercase tracking-widest text-blue-100 opacity-80">Mentor pulse</span>
                   </div>
                              <div className="space-y-6">
                      <div>
                         <p className="text-tiny uppercase text-blue-200 mb-2 tracking-widest">Feedback Velocity</p>
                         <div className="heading-lg">{feedbackList.length} Cycle{feedbackList.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                         <p className="text-tiny uppercase text-blue-200 mb-2 tracking-widest">Lifecycle Status</p>
                         <p className="heading-lg capitalize">{project?.status || "Proposal Stage"}</p>
                      </div>
                      <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 shadow-lg">
                        <p className="text-body-bold italic text-blue-50 leading-relaxed font-bold">
                           {feedbackList.length > 0 
                             ? `Continuous improvement synchronized. Last noted: ${formatDate(feedbackList[0].createdAt)}`
                             : "Synchronizing with supervisor for initial feedback cycle."}
                        </p>
                      </div>
               </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <h3 className="heading-md">Real-time Feedback</h3>
              <Link to="/student/feedback" className="text-tiny text-blue-600 hover:underline">Full Audit</Link>
            </div>

            <div className="space-y-8">
              {feedbackList.length > 0 ? feedbackList.slice(0, 3).map((f, i) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500/10 rounded-full group-hover:bg-blue-500 transition-all duration-300" />
                    <p className="text-tiny mb-2">{formatDate(f.createdAt)}</p>
                    <p className="text-body-bold text-slate-800 dark:text-slate-200 leading-relaxed italic mb-3 line-clamp-2">"{f.message}"</p>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-tiny font-bold text-white">{supervisorName.charAt(0)}</div>
                      <span className="text-tiny text-slate-500 uppercase tracking-widest">supervisor: {supervisorName}</span>
                    </div>
                  </div>
              )) : (
                <div className="text-center py-12 opacity-30">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p className="text-body-bold italic">Awaiting mentor feedback.</p>
                </div>
              )}
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center justify-between mb-8 overflow-hidden">
              <h3 className="heading-md">Notification Hub</h3>
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0 shadow-lg shadow-rose-500/50" />
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scroll">
              {topNotifications.length > 0 ? topNotifications.map((n, i) => (
                <Link to="/student/notifications" key={i} className="block p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none">
                  <p className="text-body-bold leading-snug line-clamp-2">{n.message}</p>
                  <p className="text-tiny mt-3 text-slate-400">{formatDate(n.createdAt)}</p>
                </Link>
              )) : (
                <div className="text-center py-10 text-body italic font-bold">Workspace feed up to date.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
