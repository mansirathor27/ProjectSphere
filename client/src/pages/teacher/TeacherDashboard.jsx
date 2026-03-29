import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
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
  ArrowRight
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading: teacherLoading } = useSelector((state) => state.teacher);
  const { list: notifications, loading: notifLoading } = useSelector((state) => state.notification);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
    dispatch(getNotifications());
  }, [dispatch]);

  const latestNotifications = useMemo(() => (notifications || []).slice(0, 6), [notifications]);

  const loading = teacherLoading || notifLoading;

  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudents || 0,
      iconWrap: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
      Icon: Users,
      trend: "Active Batch",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      iconWrap: "bg-amber-600/10 text-amber-600 dark:text-amber-400",
      Icon: Clock,
      trend: "Needs Action",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      iconWrap: "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
      Icon: CheckCircle,
      trend: "Successfully Finalized",
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
    return "bg-emerald-500";
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      {/* Premium Header Section */}
      <section className="relative overflow-hidden premium-card !p-10 border-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-600/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <GraduationCap size={14} />
              Academic Supervisor Console
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Teacher <span className="text-emerald-600">Dashboard</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              Review project proposals, monitor student milestones, and provide valuable feedback to your assigned mentees.
            </p>
          </div>
          <Link to="/teacher/messages" className="px-8 py-4 bg-emerald-600 text-white rounded-3xl font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <MessageSquare size={20} />
            <span>Collaboration Hub</span>
          </Link>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((item, i) => (
          <div key={i} className="dashboard-stats-card group">
             <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-4 rounded-2xl ${item.iconWrap}`}>
                  <item.Icon size={24} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
                  {item.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.title}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {teacherLoading ? '...' : item.value}
                  </h3>
                  <ArrowUpRight size={20} className="text-slate-200 dark:text-slate-700 mb-2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="premium-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mentorship Pulse</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Updates
              </div>
            </div>

            <div className="space-y-6">
              {latestNotifications.length > 0 ? (
                latestNotifications.map((n) => (
                  <div key={n._id} className="group relative pl-8 pb-8 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${getBulletColor(n.type, n.priority)} shadow-lg scale-100 group-hover:scale-125 transition-transform`} />
                    <div className="p-6 premium-card !p-6 !rounded-[2rem] transition-all hover:bg-blue-600/[0.02] group-hover:-translate-y-1">
                      <p className="text-base font-bold text-slate-800 dark:text-white leading-relaxed mb-4">{n.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {n.type || "System"}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <Link to="/teacher/notifications" className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                   <Bell size={48} className="mb-4 opacity-50" />
                   <p className="font-black italic">No recent mentorship logs.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mentorship Progress Tracking */}
          <div className="premium-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mentorship Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Target: End of Term</span>
              </div>
            </div>
            
            <div className="space-y-4">
               {/* This would ideally come from the API, but for professional lookup we show a detailed UI */}
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-slate-100 dark:border-slate-800">
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Milestone</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                     {[
                       { name: "John Doe", milestone: "Literature Review", status: "Completed", color: "text-emerald-500" },
                       { name: "Jane Smith", milestone: "System Architecture", status: "In Progress", color: "text-blue-500" },
                       { name: "Mike Johnson", milestone: "Database Schema", status: "Delayed", color: "text-rose-500" },
                     ].map((row, idx) => (
                       <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                         <td className="py-4 text-sm font-medium text-slate-500">{row.milestone}</td>
                         <td className={`py-4 text-xs font-black uppercase tracking-tighter ${row.color}`}>{row.status}</td>
                         <td className="py-4">
                           <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Validate</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-8">
          <div className="premium-card">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Mentees Status</h3>
            <div className="h-[300px] w-full relative">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={12} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: 'white' }} 
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'black', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 font-bold italic">No mentorship data</div>
              )}
                {/* Central Stats */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                    {dashboardStats?.assignedStudents || 0}
                  </span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Mentees</p>
                </div>

                <div className="mt-12 h-[200px] w-full">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2 italic">Status Distribution</h4>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontSize: '12px'}}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={30}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>

          <div className="premium-card bg-slate-950 text-white border-none overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
            <h3 className="text-lg font-black mb-6 tracking-tight">Strategic Overview</h3>
            <div className="space-y-6">
               <p className="text-sm font-medium opacity-60 leading-relaxed">
                 You are currently directing <span className="font-black text-white">{dashboardStats?.assignedStudents || 0} research paths</span>. Ensure all project milestones are validated before the cycle end.
               </p>
               <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <GraduationCap size={24} />
                   </div>
                   <div className="min-w-0">
                     <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Academic Cycle</p>
                     <p className="text-sm font-black truncate">Final Year Session 2026</p>
                   </div>
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