import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats, getAssignedStudents } from "../../store/slices/teacherSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { 
  CheckCircle, 
  Clock, 
  Loader, 
  Users, 
  MessageSquare, 
  ArrowUpRight, 
  GraduationCap,
  Bell,
  ArrowRight,
  Target,
  FileText,
  Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { connectSocket, getSocket } from "../../lib/socket";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, assignedStudents, loading: teacherLoading } = useSelector((state) => state.teacher);
  const { list: notifications, loading: notifLoading } = useSelector((state) => state.notification);
  const { mode } = useSelector((state) => state.theme);

  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
    dispatch(getAssignedStudents());
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
      const socket = getSocket();

      const refresh = () => {
        dispatch(getTeacherDashboardStats());
        dispatch(getNotifications());
      };

      socket.on("new_feedback", refresh);
      socket.on("project_updated", refresh);
      socket.on("new_notification", refresh);
      socket.on("new_request", refresh);

      return () => {
        socket.off("new_feedback", refresh);
        socket.off("project_updated", refresh);
        socket.off("new_notification", refresh);
        socket.off("new_request", refresh);
      };
    }
  }, [authUser?._id, dispatch]);

  const latestNotifications = useMemo(() => (notifications || []).slice(0, 6), [notifications]);

  const loading = teacherLoading || notifLoading;

  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudents || 0,
      iconWrap: "bg-blue-600/10 text-blue-600",
      Icon: Users,
      trend: "Mentorship Batch",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      iconWrap: "bg-amber-600/10 text-amber-600",
      Icon: Clock,
      trend: "Attention Req.",
    },
    {
      title: "Finalized Projects",
      value: dashboardStats?.completedProjects || 0,
      iconWrap: "bg-emerald-600/10 text-emerald-600",
      Icon: CheckCircle,
      trend: "Submission End",
    },
  ];

  const chartData = useMemo(() => {
    const dist = dashboardStats?.statusDistribution || {};
    return [
      { name: "Pending", value: dist.pending || 0, color: "#F59E0B" },
      { name: "Approved", value: dist.approved || 0, color: "#3B82F6" },
      { name: "Completed", value: dist.completed || 0, color: "#10B981" },
      { name: "Rejected", value: dist.rejected || 0, color: "#EF4444" },
    ].filter(d => d.value > 0);
  }, [dashboardStats?.statusDistribution]);

  const getBulletColor = (type, priority) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return "bg-rose-500";
    if (p === "medium") return "bg-amber-500";
    return "bg-blue-500";
  };

  if (loading && !dashboardStats) {
     return <div className="flex h-[80vh] items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden premium-card !p-10 border-none bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 shadow-2xl shadow-blue-500/5">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="badge-primary">Teacher Portal</span>
            <h1 className="heading-lg">
              Academic <span className="text-blue-600">Console</span>
            </h1>
            <p className="text-body-lg max-w-xl">
               Manage project life cycles, direct student groups, and provide strategic mentorship across your assigned research programs.
            </p>
          </div>
          <Link to="/teacher/messages" className="btn-primary px-10 py-5 rounded-[2.5rem] shadow-2xl">
            <MessageSquare size={22} className="animate-pulse" />
            <span>Collaboration Hub</span>
          </Link>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statsCards.map((item, i) => (
          <div key={i} className="premium-card p-6 flex flex-col justify-between min-h-[180px] hover:translate-y-[-4px] transition-all duration-300 group">
             <div className="flex items-center justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl ${item.iconWrap} flex items-center justify-center`}>
                  <item.Icon size={28} />
                </div>
                <span className="text-tiny text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">{item.trend}</span>
             </div>
             <div>
                <p className="text-tiny mb-1">{item.title}</p>
                 <div className="flex items-end justify-between">
                    <h4 className="heading-lg tabular-nums">{item.value}</h4>
                    <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <ArrowUpRight size={18} className="text-slate-400" />
                    </div>
                 </div>
             </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Mentorship Pulse */}
          <div className="premium-card bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
               <h3 className="heading-md flex items-center gap-3">
                 <Activity className="text-blue-600" size={24} />
                 Mentorship Pulse
               </h3>
               <div className="badge-primary bg-blue-600/5 text-blue-600 animate-pulse">
                 Live Updates
               </div>
            </div>

            <div className="space-y-10">
              {latestNotifications.length > 0 ? (
                latestNotifications.map((n) => (
                  <div key={n._id} className="group relative pl-10 pb-10 border-l border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={`absolute left-[-6px] top-0 w-3 h-3 rounded-full ${getBulletColor(n.type, n.priority)} shadow-xl shadow-blue-500/20 group-hover:scale-150 transition-all`} />
                    <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none">
                      <p className="text-body-bold mb-4 line-clamp-2 italic opacity-90">"{n.message}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-tiny bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{n.type || "Event"}</span>
                          <span className="text-tiny opacity-50">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Link to="/teacher/notifications" className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all">
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <Bell size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                   <p className="text-body font-bold italic opacity-40">Mentorship log synchronized. No alerts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Status Table */}
          <div className="premium-card">
            <div className="flex items-center justify-between mb-10 overflow-hidden">
               <h3 className="heading-md flex items-center gap-3">
                 <Users className="text-blue-600 font-bold" size={24} />
                 Program Participants
               </h3>
                <Link to="/teacher/feedback" className="text-tiny text-blue-600 font-bold hover:underline tracking-widest">In-depth feedback</Link>
            </div>
            
            <div className="overflow-x-auto pb-4 custom-scroll">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-100 dark:border-slate-800/80">
                     <th className="pb-5 text-tiny">Student / Group</th>
                     <th className="pb-5 text-tiny">Project Context</th>
                     <th className="pb-5 text-tiny">Lifecycle</th>
                     <th className="pb-5 text-tiny text-center">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                   {assignedStudents?.length > 0 ? assignedStudents.map((student, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                         <td className="py-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-body-bold">{student.name}</p>
                               {student.project?.groupName && (
                                   <span className="badge-primary bg-indigo-600/5 text-indigo-600 rounded-lg text-tiny">
                                      GROUP: {student.project.groupName}
                                   </span>
                               )}
                            </div>
                         </td>
                         <td className="py-6">
                             <p className="text-tiny italic line-clamp-1 max-w-[200px]">
                                {student.project?.title || "Draft Phase"}
                             </p>
                         </td>
                         <td className="py-6">
                             <span className={`text-tiny font-bold px-3 py-1 rounded-full ${
                                student.project?.status === 'completed' ? 'bg-emerald-600/10 text-emerald-600' :
                                student.project?.status === 'approved' ? 'bg-blue-600/10 text-blue-600' : 'bg-amber-600/10 text-amber-600'
                             }`}>
                                {student.project?.status || "PENDING"}
                             </span>
                         </td>
                         <td className="py-6 text-center">
                            <Link to={`/chat/${student.project?._id}`} className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                               <MessageSquare size={18} />
                            </Link>
                         </td>
                      </tr>
                   )) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-body font-bold italic opacity-20">Cycle initialization pending.</td>
                      </tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Analytics Column */}
        <div className="lg:col-span-4 space-y-8">
           {/* Progress Chart */}
           <div className="premium-card bg-white dark:bg-slate-900 border-none shadow-none">
             <h3 className="heading-md mb-8">Strategic Distribution</h3>
             <div className="h-[350px] relative">
               {chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={chartData}
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={10}
                       dataKey="value"
                     >
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={12} strokeWidth={0} />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', background: '#0e172a', p: '16px' }}
                        itemStyle={{ fontWeight: 'black', fontSize: '10px', textTransform: 'uppercase' }}
                     />
                     <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontWeight: 'black', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', pt: '24px' }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                  <div className="h-full flex items-center justify-center opacity-20"><Target size={64} /></div>
               )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-20px]">
                   <p className="heading-lg tabular-nums">{dashboardStats?.assignedStudents || 0}</p>
                   <p className="text-tiny opacity-50">Active Batch</p>
                </div>
             </div>
           </div>

           {/* Call to Action Card */}
           <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-950/20 border-t border-white/5">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-blue-600/10 rounded-full blur-[80px]" />
              <h3 className="heading-md text-white mb-6">Mentorship Summary</h3>
              <p className="text-sm font-bold opacity-60 leading-relaxed mb-8 italic">
                 Directing <span className="text-white font-bold">{dashboardStats?.assignedStudents || 0} unique projects</span> towards academic excellence. Ensure all final artifacts are synchronized before session close.
              </p>
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-3xl">
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                       <GraduationCap size={28} />
                    </div>
                     <div>
                        <p className="text-tiny opacity-40 uppercase tracking-widest mb-1">Academic Cycle</p>
                        <p className="text-body-bold">Session 2024-2026</p>
                     </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
