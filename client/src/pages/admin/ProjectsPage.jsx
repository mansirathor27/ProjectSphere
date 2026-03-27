import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllProjects, approveProject, rejectProject } from "../../store/slices/adminSlice";
import { AlertCircle, CheckCircle, Search, Filter, XCircle, FileText } from "lucide-react";

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const { projects } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const filteredProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const matchesSearch = 
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filterStatus]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    await dispatch(approveProject(id));
    setProcessingId(null);
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    await dispatch(rejectProject(id));
    setProcessingId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return { text: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
      case "rejected":
        return { text: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
      case "completed":
        return { text: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      default:
        return { text: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 dark:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Project Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Student Projects
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Review and manage student project proposals. Approve valid projects so they can be assigned to supervisors.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search Projects
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student or project title..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => {
          const badge = getStatusBadge(project.status);
          return (
            <div key={project._id} className="flex flex-col rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.color}`}>
                  {badge.text}
                </div>
                {project.supervisor && (
                  <span className="text-xs text-slate-500">Supervisor: {project.supervisor.name}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {project.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1 line-clamp-3">
                {project.description}
              </p>
              
              <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold">
                    {project.student?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{project.student?.name}</p>
                    <p className="text-xs text-slate-500">{project.student?.email}</p>
                  </div>
                </div>

                {project.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(project._id)}
                      disabled={processingId === project._id}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(project._id)}
                      disabled={processingId === project._id}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectsPage;
