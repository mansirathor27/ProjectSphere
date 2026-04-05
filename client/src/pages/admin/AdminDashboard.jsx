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
import { connectSocket, getSocket } from "../../lib/socket";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import AddAnnouncement from "../../components/modal/AddAnnouncement";
import { toast } from "react-toastify";
import { getAllProjects, getDashboardStats } from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { toggleStudentModal, toggleTeacherModal } from "../../store/slices/popupSlice";
import { 
  AlertCircle, 
  AlertTriangle, 
  Box, 
  FileTextIcon, 
  Folder, 
  PlusIcon, 
  User, 
  X, 
  Settings, 
  Bell, 
  Search, 
  Megaphone,
  TrendingUp,
  Activity,
  Shield,
  Layers,
  ArrowUpRight
} from "lucide-react";

const AdminDashboard = () => {

  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const { mode } = useSelector((state) => state.theme);

  const { stats, projects } = useSelector((state) => state.admin);
  const notifications = useSelector((state) => state.notification.list);

  const dispatch = useDispatch();
  const { authUser } = useSelector(state => state.auth);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());

    const socket = getSocket();
    if (socket && authUser) {
      const refresh = () => {
        dispatch(getDashboardStats());
        dispatch(getNotifications());
        dispatch(getAllProjects());
      };

      socket.on("new_notification", refresh);
      socket.on("project_updated", refresh);
      socket.on("new_request", refresh);

      return () => {
        socket.off("new_notification", refresh);
        socket.off("project_updated", refresh);
        socket.off("new_request", refresh);
      };
    }
  }, [dispatch, authUser]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.students || []).flatMap((s) => 
        (p.files || []).map((f) => ({
          projectId: p._id,
          fileId: f._id,
          originalName: f.originalName,
          uploadedAt: f.uploadedAt,
          projectTitle: p.title,
          studentName: s.name,
          groupName: p.groupName || null
        }))
      )
    );
  }, [projects]);

  const filteredFiles = files.filter((f) =>
    (f.originalName || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
    (f.projectTitle || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
    (f.studentName || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
    (f.groupName || "").toLowerCase().includes(reportSearch.toLowerCase())
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

  const supervisorsBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      if (!p?.supervisor?.name) return;
      const name = p.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name, count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

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

  const latestNotifications = useMemo(() =>
    (notifications || []).slice(0, 6),
    [notifications]);

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high") return "bg-rose-500";
    if (p === "medium") return "bg-amber-500";
    return "bg-blue-500";
  };
  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v)) return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v)) return "bg-orange-100 text-orange-800";
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

  const kpis = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      iconWrap: "bg-blue-600/10 text-blue-600",
      Icon: User,
      desc: "Registered scholars"
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      iconWrap: "bg-emerald-600/10 text-emerald-600",
      Icon: Shield,
      desc: "Academic supervisors"
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      iconWrap: "bg-amber-600/10 text-amber-600",
      Icon: AlertCircle,
      desc: "Awaiting approval"
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      iconWrap: "bg-indigo-600/10 text-indigo-600",
      Icon: Folder,
      desc: "Ongoing research"
    },
    {
      title: "Completed",
      value: stats?.completedProjects ?? 0,
      iconWrap: "bg-cyan-600/10 text-cyan-600",
      Icon: FileTextIcon,
      desc: "Finalized archives"
    },
    {
      title: "System Load",
      value: "Stable",
      iconWrap: "bg-slate-600/10 text-slate-600",
      Icon: Activity,
      desc: "Network status"
    }
  ];


  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-12">
      {/* Hero Section */}
      <header className="relative overflow-hidden premium-card !p-10 border-none bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 shadow-2xl shadow-blue-500/5">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4">
            <span className="badge-primary">Administrative Command</span>
            <h1 className="heading-lg">
              Platform <span className="text-blue-600">Commander</span>
            </h1>
            <p className="text-body-lg max-w-xl">
               Orchestrate the academic ecosystem with real-time analytics, student lifecycle management, and comprehensive reporting.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { label: "New Student", onClick: () => dispatch(toggleStudentModal()), icon: PlusIcon, variant: "btn-primary" },
              { label: "New Teacher", onClick: () => dispatch(toggleTeacherModal()), icon: User, variant: "btn-outline" },
              { label: "Broadcast", onClick: () => setIsBroadcastModalOpen(true), icon: Megaphone, variant: "btn-secondary !bg-amber-600" },
              { label: "Reports", onClick: () => setIsReportsModalOpen(true), icon: FileTextIcon, variant: "btn-outline" },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`${btn.variant} px-8 py-4 rounded-[2rem] shadow-xl group hover:translate-y-[-2px] active:translate-y-[1px] transition-all`}
              >
                <btn.icon size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-bold whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI Cloud */}
      <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((item, i) => (
          <div key={i} className="premium-card p-6 flex flex-col justify-between hover:translate-y-[-6px] transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-2xl ${item.iconWrap} flex items-center justify-center shadow-inner`}>
                  <item.Icon size={22} />
                </div>
                <div className="h-6 w-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                   <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
             </div>
             <div>
                <p className="text-tiny mb-1 uppercase">{item.title}</p>
                <h4 className="heading-lg mb-1 tabular-nums">{item.value}</h4>
                <p className="text-tiny opacity-70">{item.desc}</p>
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
                <h3 className="heading-md">Project Evolution</h3>
                <p className="text-body">New registrations over last 6 months</p>
              </div>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-tiny">Monthly View</div>
            </div>
            <div className="p-8 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-900/5">
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={projectsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3B82F6" floodOpacity="0.3" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: mode === 'dark' ? '#1e293b' : '#f8fafc', radius: 10 }}
                      contentStyle={{
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                        background: mode === 'dark' ? '#0f172a' : 'white',
                        padding: '16px 24px',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{ color: '#3B82F6' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#colorCount)"
                      radius={[12, 12, 4, 4]}
                      barSize={45}
                      animationDuration={1500}
                      filter="url(#shadow)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Side by Side Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card">
              <h3 className="heading-sm mb-6">Status Breakdown</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white' }} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card">
              <h3 className="heading-sm mb-6">Supervisor Load</h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
                {supervisorsBucket.length > 0 ? supervisorsBucket.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>
                      <span className="font-bold text-slate-800 dark:text-white">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-tiny px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">{s.count} Projects</span>
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
              <h3 className="heading-md">Pulse Stream</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              {latestNotifications.length > 0 ? latestNotifications.map((n) => (
                <div key={n._id} className="group relative pl-10 pb-10 border-l border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${getBulletColor(n.type, n.priority)} shadow-xl group-hover:scale-150 transition-all`} />
                  <div className="bg-slate-50/20 dark:bg-slate-800/10 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-slate-200/20 dark:hover:shadow-none">
                    <p className="text-body-bold leading-relaxed mb-4 italic opacity-90">"{n.message}"</p>
                    <div className="flex items-center justify-between">
                      <span className="badge-primary !px-3 !py-1 text-[9px]">{n.type}</span>
                      <span className="text-tiny">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 opacity-20">
                  <Bell size={64} className="mx-auto mb-4" />
                  <p className="font-bold italic">Platform silence...</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="w-full mt-6 py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-tiny hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-50/10 transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <Search size={18} />
              Full Audit Ledger
            </button>
          </div>

        </div>
      </div>

      {/* Reports Modal (integrated lookup) */}
      {isReportsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-in zoom-in duration-300">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-premium overflow-hidden border border-white/20">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/30">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <Folder size={32} />
                 </div>
                 <div>
                    <h3 className="heading-lg">Archive Vault</h3>
                    <p className="text-tiny text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-platform artifact auditing</p>
                 </div>
              </div>
              <button
                onClick={() => setIsReportsModalOpen(false)}
                className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:scale-110 active:scale-95 transition-all shadow-inner flex items-center justify-center"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="relative">
                <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="Query student, project id, group name or artifact type..."
                  className="w-full h-20 bg-slate-50 dark:bg-slate-800/50 border-4 border-transparent rounded-3xl pl-16 pr-8 text-lg font-bold outline-none focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-6 custom-scroll space-y-6">
                {filteredFiles.length > 0 ? filteredFiles.map((f, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center justify-between p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/20 transition-all group">
                    <div className="flex items-center gap-6 text-left w-full md:w-auto">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                        <FileTextIcon size={32} />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="heading-sm mb-1">{f.originalName}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                           <span className="badge-primary bg-blue-600/5 text-blue-600 text-[9px]">{f.studentName}</span>
                           <span className="text-[14px] opacity-30 text-slate-400">/</span>
                           <span className="text-tiny truncate max-w-[200px]">{f.projectTitle}</span>
                           {f.groupName && (
                              <span className="badge-primary bg-amber-500/10 text-amber-600 text-tiny !tracking-tighter !py-0.5">G: {f.groupName}</span>
                           )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(f.projectId, f.fileId, f.originalName)}
                      className="btn-primary mt-6 md:mt-0 !bg-slate-950 !text-white !px-10 !py-4 !rounded-2xl"
                    >
                      Extract Artifact
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-24 opacity-30 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100">
                    <Layers size={80} className="mx-auto mb-6" />
                    <p className="heading-md italic">No records found for the given parameters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-3xl animate-in fade-in duration-400">
          <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-premium overflow-hidden border border-white/10">
            <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-8">
                 <div className="h-20 w-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
                    <Shield size={40} />
                 </div>
                 <div>
                    <h1 className="heading-lg !text-4xl">Platform DNA</h1>
                    <p className="text-tiny text-blue-600 mt-2">Comprehensive System Audit Ledger</p>
                 </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="h-16 w-16 rounded-[2rem] bg-white dark:bg-slate-800 text-slate-500 shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
              >
                <X size={32} />
              </button>
            </div>

            <div className="p-12">
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-8 custom-scroll">
                {(notifications || []).map((n) => (
                  <div key={n._id} className="flex items-start gap-10 p-10 rounded-[3.5rem] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all">
                    <div className={`h-16 w-16 shrink-0 rounded-[2rem] flex items-center justify-center shadow-2xl ${getBulletColor(n.type, n.priority)} text-white transform group-hover:rotate-12 transition-transform`}>
                      <Bell size={32} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="badge-primary !bg-slate-200 !text-slate-700 !px-4 !py-1 text-[10px]">
                          {n.type}
                        </span>
                        <span className="text-tiny opacity-40">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="heading-md italic leading-snug">"{n.message}"</p>
                      <div className="flex items-center gap-6">
                        <span className={`text-tiny ${n.priority === 'high' ? '!text-rose-600 font-bold' : ''}`}>
                          INTENSITY: {n.priority}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-tiny !tracking-normal">ID: {n._id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}
      {isBroadcastModalOpen && <AddAnnouncement onClose={() => setIsBroadcastModalOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;
