import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { axiosInstance } from "../../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import { getAllProjects, getDashboardStats } from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { toggleStudentModal, toggleTeacherModal } from "../../store/slices/popupSlice";
import { AlertCircle, AlertTriangle, Box, FileTextIcon, Folder, PlusIcon, User, X, Settings, Bell, Search } from "lucide-react";

const AdminDashboard = () => {
  
  const {isCreateStudentModalOpen, isCreateTeacherModalOpen} = useSelector((state)=> state.popup);
  const { mode } = useSelector((state) => state.theme);

  const {stats, projects} = useSelector((state)=>state.admin); 
  const notifications = useSelector((state)=>state.notification.list); 

  const dispatch = useDispatch();
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  
  useEffect(()=>{
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
  },[dispatch]);

  const nearingDeadlines = useMemo(()=>{
    const now = new Date();
    const threeDays = 3*24*60*60*1000;
    return (projects || []).filter((p)=>{
      if(!p.deadline) return false;
      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  },[projects]);

  const files = useMemo(() => {
  return (projects || []).flatMap((p) =>
    (p.files || []).map((f) => ({
      projectId: p._id,
      fileId: f._id, // important for download
      originalName: f.originalName,
      uploadedAt: f.uploadedAt,
      projectTitle: p.title,
      studentName: p.student?.name,
    }))
  );
}, [projects]);

  const filteredFiles = files.filter((f)=>
    (f.originalName || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
    (f.projectTitle || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
    (f.studentName || "").toLowerCase().includes(reportSearch.toLowerCase())
  );

const handleDownload = async (projectId, fileId, name) => {
  try {
    const res = await axiosInstance.get(
      `/project/${projectId}/files/${fileId}/download`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", name || "download");

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch {
    toast.error("Download failed");
  }
};

  const supervisorsBucket = useMemo(()=>{
    const map = new Map();
    (projects || []).forEach((p)=>{
      if(!p?.supervisor?.name) return;
      const name = p.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name , count,
    }));
    arr.sort((a, b )=> b.count - a.count);
    return arr;
  },[projects]);

  const projectsOverTime = useMemo(() => {
    const map = new Map();
    (projects || []).forEach(p => {
      const date = new Date(p.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      map.set(monthYear, (map.get(monthYear) || 0) + 1);
    });
    // Sort by date string
    const arr = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    return arr.reverse().slice(0, 6).reverse(); // last 6 months
  }, [projects]);

  const projectStatusDistribution = useMemo(() => {
    const statuses = { pending: 0, approved: 0, rejected: 0, completed: 0 };
    (projects || []).forEach(p => {
      if (statuses.hasOwnProperty(p.status)) {
        statuses[p.status]++;
      } else {
        statuses.pending++; // default
      }
    });
    return [
      { name: "Pending", value: statuses.pending, color: "#F59E0B" },
      { name: "Approved", value: statuses.approved, color: "#10B981" },
      { name: "Rejected", value: statuses.rejected, color: "#EF4444" },
      { name: "Completed", value: statuses.completed, color: "#3B82F6" },
    ].filter(d => d.value > 0);
  }, [projects]);

  const latestNotifications = useMemo(()=>
   (notifications || []).slice(0,6),
  [notifications]);

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject")) return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due")) return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    // type-based fallback
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };
  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
    if (["rejection", "reject"].includes (v)) return "bg-red-100 text-red-800";
    if (["approval", "approved"].includes (v)) return "bg-green-100 text-green-800";
    if (["deadline", "due"].includes (v)) return "bg-orange-100 text-orange-800";
    if (v === "request") return "bg-blue-100 text-blue-800";
    if (v === "feedback") return "bg-purple-100 text-purple-800";
    if (v === "meeting") return "bg-cyan-100 text-cyan-800";
    if (v === "system") return "bg-slate-100 text-slate-800";
    return "bg-gray-100 text-gray-800";
    }
    // priority
    if (v === "high") return "bg-red-100 text-red-800";
    if (v === "medium") return "bg-yellow-100 text-yellow-800";
    if (v === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      iconWrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
      Icon: User,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
      Icon: Box,
      trend: "+4%",
      trendUp: true,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
      Icon: AlertCircle,
      trend: "-2%",
      trendUp: false,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      iconWrap: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
      Icon: Folder,
      trend: "+24%",
      trendUp: true,
    },
    {
      title: "Completed Projects",
      value: stats?.completedProjects ?? 0,
      iconWrap: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-500/20",
      Icon: FileTextIcon,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      iconWrap: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
      Icon: AlertTriangle,
      trend: "+5%",
      trendUp: false, // More approaching deadlines is usually "bad/urgent"
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      
      onClick: () => {
      dispatch(toggleStudentModal());
    },
      btnClass: "btn-primary",
      Icon: PlusIcon, // lucide-react icon
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportsModalOpen(true),
      btnClass: "btn-outline",
      Icon: FileTextIcon,
    },
  ];
      

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      {/* Premium Header Section */}
      <section className="relative overflow-hidden premium-card !p-10 border-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-lg font-semibold uppercase tracking-wider">
              <Settings size={14} />
              System Control Tower
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin <span className="text-blue-600">Overview</span>
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Manage the academic ecosystem efficiently. Monitor student progress, teacher engagement, and project milestones in real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`${btn.btnClass} flex items-center gap-3 !px-8 !py-4 !rounded-[1.5rem] shadow-xl transition-all hover:scale-105 active:scale-95`}
              >
                <btn.Icon size={20} />
                <span className="font-bold">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modern KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        {dashboardStats.map((item, i) => (
          <div
            key={i}
            className="dashboard-stats-card group"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${item.iconWrap}`}>
                  <item.Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-lg font-semibold ${item.trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {item.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Strategy Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Project Evolution Chart */}
          <div className="premium-card !p-0 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Evolution</h3>
                <p className="text-sm text-slate-500 font-medium">New registrations over last 6 months</p>
              </div>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">Monthly View</div>
            </div>
            <div className="p-8 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-900/5">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsOverTime}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode==='dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9', opacity: 0.1}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: mode==='dark'?'#0f172a':'white'}}
                    />
                    <Bar dataKey="count" fill="url(#colorCount)" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Side by Side Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Status Breakdown</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusDistribution}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {projectStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white'}} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Supervisor Load</h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
                {supervisorsBucket.length > 0 ? supervisorsBucket.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>
                      <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">{s.count} Projects</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-400 font-bold italic">No active supervisors</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Information Area (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Activity Logs */}
          <div className="premium-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pulse Stream</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              {latestNotifications.length > 0 ? latestNotifications.map((n) => (
                <div key={n._id} className="group relative pl-6 pb-6 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${getBulletColor(n.type, n.priority)} shadow-lg scale-100 group-hover:scale-125 transition-transform`} />
                  <div className="p-5 premium-card !p-6 !rounded-[2rem] transition-all group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 group-hover:-translate-y-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug mb-3">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${getBadgeClasses("type", n.type)}`}>{n.type}</span>
                      <span className="text-[10px] font-bold text-slate-400">2h ago</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                  <Bell size={48} className="mb-4" />
                  <p className="font-bold italic">Silence in the system...</p>
                </div>
              )}
            </div>
            
            <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm font-bold hover:border-blue-500/50 hover:text-blue-500 transition-all">
              View Audit History
            </button>
          </div>

          {/* Quick System Stats */}
          <div className="premium-card bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none">
            <h3 className="text-lg font-bold mb-6">System Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-medium uppercase tracking-wider mb-2 opacity-60">
                  <span>Server Load</span>
                  <span>Normal</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[24%] bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium uppercase tracking-wider mb-2 opacity-60">
                  <span>Project Submissions</span>
                  <span>Active</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4 text-xs font-bold opacity-80 border-t border-white/5 mt-4">
                 <button 
                  onClick={() => toast.success("Generating platform export...")}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-semibold text-[10px]"
                 >
                   Export PDF Audit
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal (integrated lookup) */}
      {isReportsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium overflow-hidden border border-white/20">
            <div className="px-10 py-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h3>
                <p className="text-sm font-medium text-slate-500">Access and audit all project artifacts</p>
              </div>
              <button 
                onClick={() => setIsReportsModalOpen(false)}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:scale-110 active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search size={22} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by student, title or filename..."
                  className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl pl-16 pr-8 text-lg font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-4 custom-scroll space-y-4">
                {filteredFiles.length > 0 ? filteredFiles.map((f, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-blue-600">
                        <FileTextIcon size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{f.originalName}</h4>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                          {f.studentName} <span className="mx-2 opacity-30">|</span> {f.projectTitle}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(f.projectId, f.fileId, f.originalName)}
                      className="mt-4 md:mt-0 px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      Download
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 font-bold italic">No matching records found in the archive</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
  );
};

export default AdminDashboard;