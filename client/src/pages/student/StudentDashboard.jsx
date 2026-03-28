import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  BookOpen, 
  User, 
  Calendar, 
  Bell, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  FolderOpen,
  CalendarPlus,
  ArrowUpRight,
  Target,
  FileText,
  Zap,
  TrendingUp,
  BarChart as BarChartIcon,
  Users,
  ChevronRight,
  Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import { generateICS } from "../../lib/calendar";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats, loading } = useSelector((state) => state.student);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackList = dashboardStats?.feedbackNotifications?.slice(-3).reverse() || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
    return statusMap[status] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

  const calculateProgress = useMemo(() => {
    if (project?.milestones && project.milestones.length > 0) {
      const completed = project.milestones.filter(m => m.status === "completed").length;
      return Math.round((completed / project.milestones.length) * 100);
    }
    if (!project?.status) return 0;
    if (project.status === "completed") return 100;
    if (project.status === "approved") return 40;
    if (project.status === "pending") return 10;
    return 0;
  }, [project]);

  const chartData = useMemo(() => {
    if (!project?.milestones) return [];
    const statusCounts = project.milestones.reduce((acc, m) => {
      const status = m.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { completed: 0, "in-progress": 0, pending: 0 });

    return [
      { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
      { name: 'Active', value: statusCounts["in-progress"], color: '#3b82f6' },
      { name: 'Pending', value: statusCounts.pending, color: '#64748b' },
    ];
  }, [project?.milestones]);

  if (loading) {
    return <LoadingState label="Initiating student workspace..." />;
  }

  const statsCards = [
    {
      title: "Active Project",
      value: project?.title || "Assigning...",
      icon: Target,
      iconWrap: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
      desc: "Primary focus area"
    },
    {
      title: "Supervisor",
      value: supervisorName,
      icon: GraduationCap,
      iconWrap: "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
      desc: "Expert guidance"
    },
    {
      title: "Sync Status",
      value: project?.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "None",
      icon: Zap,
      iconWrap: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400",
      desc: "Current project state"
    },
    {
      title: "Deadlines",
      value: upcomingDeadlines.length,
      icon: Clock,
      iconWrap: "bg-rose-600/10 text-rose-600 dark:text-rose-400",
      desc: "Urgent milestones"
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden premium-card !p-12 border-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Student Workspace Active
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                Hello, <span className="text-blue-600">{authUser?.name?.split(" ")[0] || "Student"}</span>!
              </h1>
              <p className="max-w-xl text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                You're making great progress. Your project is currently <span className="text-slate-900 dark:text-white font-bold">{project?.status || "unassigned"}</span>. Keep pushing forward!
              </p>
            </div>
          </div>

          {/* Progress Circular Mock/Simple */}
          <div className="flex items-center gap-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <div className="relative w-24 h-24">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle className="text-blue-600 stroke-current transition-all duration-1000 ease-out" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * calculateProgress) / 100}></circle>
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-white">
                 {calculateProgress}%
               </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Completion</p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Project Milestones</h4>
              <p className="text-xs font-bold text-blue-500 mt-1">On schedule</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, i) => (
          <div key={i} className="dashboard-stats-card group">
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-3.5 rounded-2xl ${card.iconWrap} shadow-sm`}>
                  <card.icon size={22} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
                  {card.desc}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{card.title}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate" title={card.value}>
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Project Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Detailed Project Overview */}
          <div className="premium-card overflow-hidden">
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <FileText size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Project Blueprint</h3>
               </div>
               <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusBadge(project?.status)}`}>
                 {project?.status || "Draft"}
               </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Subject Title</p>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {project?.title || "Pending Assignment"}
                    </h4>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Project Vision</p>
                    <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                      {project?.description || "A detailed project description will be available once assigned."}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase">Final Submission</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(project?.deadline)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase">Supervisor</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{supervisorName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase">Group Members</span>
                    <div className="flex -space-x-2">
                       {project?.students?.map((s, i) => (
                         <div key={i} title={s.name} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-slate-200 dark:ring-slate-800">
                           {s.name.charAt(0)}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400 uppercase">Artifacts</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{(project?.files?.length || 0)} Documents</span>
                  </div>
                  <Link to="/student/projects" className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-900 hover:text-white transition-all group">
                    View Project Details
                    <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChartIcon size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                         <TrendingUp size={24} />
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Project Momentum</h3>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Milestone Distribution</p>
                       </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6">
                        <Target size={24} />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight mb-2">Efficiency Rating</h3>
                      <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Based on milestone completion time</p>
                    </div>
                    
                    <div className="mt-8">
                      <div className="text-6xl font-bold mb-2">{calculateProgress}%</div>
                      <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-white rounded-full" style={{width: `${calculateProgress}%`}}></div>
                      </div>
                      <p className="mt-4 text-sm font-bold text-blue-100 italic">"Keep pushing, you're ahead of the curve!"</p>
                    </div>
                  </div>
               </div>
            </div>
  
            {/* Feedback Stream */}
            <div className="premium-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mentorship Feedback</h3>
                <Link to="/student/feedback" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Archive History</Link>
              </div>
  
              {feedbackList && feedbackList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedbackList.map((feedback, index) => (
                    <div key={index} className="group premium-card !p-8 !rounded-[2.5rem] !bg-slate-50 dark:!bg-slate-800/40 border-none transition-all hover:!bg-indigo-50/50 dark:hover:!bg-indigo-900/10 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm text-indigo-600">
                          <MessageCircle size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{formatDate(feedback.createdAt)}</span>
                      </div>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed mb-4 line-clamp-3">
                        "{feedback.message}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">{supervisorName.charAt(0)}</div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">— {supervisorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <MessageCircle size={64} className="mx-auto text-slate-300 mb-6 opacity-30" />
                  <p className="text-lg font-bold text-slate-400 italic">No feedback cycles initiated yet.</p>
                </div>
              )}
            </div>
          </div>
  
          {/* Right: Milestones & Alerts (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Milestone Radar */}
            <div className="premium-card space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Milestone Radar</h3>
                 <Target size={20} className="text-blue-500 animate-pulse" />
               </div>
   
               <div className="space-y-4">
                  {project?.milestones && project.milestones.length > 0 ? project.milestones.map((m, i) => (
                    <div key={i} className="group premium-card !p-6 !rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-2 border-transparent hover:border-blue-500/10">
                       <div className="flex items-start justify-between">
                         <div className="min-w-0">
                           <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{m.title}</h4>
                           <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">{m.description || "Project Milestone"}</p>
                         </div>
>
                         <div className={`p-2 rounded-xl ${m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                           {m.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                         </div>
                       </div>
                       <div className="mt-4 flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${m.status === 'completed' ? 'w-full bg-emerald-500' : 'w-0 bg-blue-600'} transition-all duration-1000`} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{m.status}</span>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-40">
                      <Target size={48} className="mx-auto mb-4" />
                      <p className="font-bold italic text-sm">No milestones defined yet.</p>
                    </div>
                  )}
               </div>
            </div>
  
            {/* Alert Center */}
            <div className="premium-card">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Alert Center</h3>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                  {topNotifications.length > 0 ? topNotifications.map((n, i) => (
                     <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] border border-transparent hover:border-slate-200 transition-all">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug">{n.message}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2">{formatDate(n.createdAt)}</p>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-10 text-slate-400 italic font-bold">Inbox empty</div>
                  )}
               </div>
               
               <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                 <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-blue-600/40 transition-colors" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Pro Tip</p>
                      <h5 className="font-bold text-base leading-snug">Enable browser notifications to never miss a supervisor update.</h5>
                    </div>
                 </div>
               </div>
            </div>
  
          </div>
        </div>
      </div>
    );
  };
  
  export default StudentDashboard;