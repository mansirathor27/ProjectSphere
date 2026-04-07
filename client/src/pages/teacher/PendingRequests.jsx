import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptRequest, getAssignedStudents, getTeacherDashboardStats, getTeacherRequests, rejectRequest } from "../../store/slices/teacherSlice";
import ScalingLoader from "../../components/ui/ScalingLoader";
import EmptyState from "../../components/ui/EmptyState";
import { Search, Filter, User, Mail, FileText, CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck } from "lucide-react";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser._id));
  }, [dispatch, authUser._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev, [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);
    try {
      await dispatch(acceptRequest(id)).unwrap();
      dispatch(getTeacherRequests(authUser._id));
      dispatch(getAssignedStudents());
      dispatch(getTeacherDashboardStats());
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);
    try {
      await dispatch(rejectRequest(id)).unwrap();
      dispatch(getTeacherRequests(authUser._id));
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const filteredRequests = list.filter((request) => {
    const projectTitle = request?.student?.project?.title || request?.projectTitle || "No project title";
    const matchesSearch =
      (request?.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Header Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest">
               <ShieldCheck size={12} />
               Supervision Desk
             </div>
             <h1 className="heading-lg">Pending Requests</h1>
             <p className="text-body max-w-xl">
               Review and respond to supervision requests from potential project groups.
             </p>
          </div>
          <div className="flex shrink-0">
             <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <span className="text-tiny mb-1">Incoming</span>
                <span className="heading-md !text-blue-600">{list.filter(r => r.status === 'pending').length}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search students or projects..."
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            className="pl-12 pr-10 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 dark:text-slate-300 appearance-none cursor-pointer min-w-[200px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Only</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Content */}
      <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
             <ScalingLoader />
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const project = req.student?.project || req.project;
            const projectStatus = project?.status?.toLowerCase() || "pending";
            const lm = loadingMap[req._id] || {};
            const isPending = req.status === 'pending';

            return (
              <div key={req._id} className="premium-card group hover:border-blue-500/30 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                      <User size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="heading-md">{req.student?.name}</h3>
                        <span className={`px-3 py-1 rounded-lg text-tiny font-bold uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                          'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-tiny">
                         <span className="flex items-center gap-1.5"><Mail size={14} /> {req.student?.email}</span>
                         <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 inline-block max-w-lg">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <FileText size={18} className="text-blue-500" />
                          <span className="text-body-bold tracking-tight">{project?.title || "Untitled Project"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-2">
                          <span className="text-slate-500">Admin Status:</span>
                          <span className={`font-semibold ${
                            projectStatus === "approved" ? "text-green-600" :
                            projectStatus === "rejected" ? "text-red-600" :
                            "text-amber-600"
                          }`}>
                            {projectStatus === "approved" ? "Approved" :
                             projectStatus === "rejected" ? "Rejected" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleReject(req)}
                          disabled={lm.rejecting || lm.accepting}
                          className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          {lm.rejecting ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          onClick={() => handleAccept(req)}
                          disabled={lm.rejecting || lm.accepting || projectStatus !== "approved"}
                          title={projectStatus !== "approved" ? "Project must be approved by an Admin" : ""}
                          className={`w-full sm:w-auto px-10 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                            projectStatus !== "approved" 
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
                          }`}
                        >
                          <CheckCircle2 size={18} />
                          {lm.accepting ? "Accepting..." : "Accept Request"}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-sm">
                        <ArrowRight size={18} />
                        Action Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No requests to display"
            description="You don't have any supervision requests matching your current filters."
          />
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
