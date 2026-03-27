import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { getAllProjects } from "../../store/slices/adminSlice";
import { X, Search, Calendar, Clock, AlertCircle, FileText, User, Users, ChevronDown } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.admin);
  const { mode } = useSelector((state) => state.theme);

  const [viewProjects, setViewProjects] = useState(projects || []);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return (viewProjects || []).map((p) => ({
      _id: p._id,
      title: p.title,
      studentName: p.student?.name || '-',
      studentEmail: p.student?.email || '-',
      studentDept: p.student?.department || '-',
      supervisor: p.supervisor?.name || '-',
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "-",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
      raw: p,
    }));
  }, [viewProjects]);

  const filteredProjects = projectRows.filter((row) => {
    const matchesSearch =
      (row.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    let deadlineData = {
      name: selectedProject?.student?.name,
      dueDate: formData?.deadlineDate,
      project: selectedProject?._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineData })
      ).unwrap();
      const updatedProject = updated?.project || updated;

      if (updatedProject?._id) {
        setViewProjects((prev) =>
          prev.map((p) => (p._id === updatedProject._id ? { ...p, ...updatedProject } : p))
        );
      }
      toast.success("Deadline created/updated successfully!");
    } catch (error) {
      toast.error("Failed to create/update deadline");
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline || deadline === "-") return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { label: "Overdue", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
    if (daysDiff <= 3) return { label: "Urgent", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" };
    if (daysDiff <= 7) return { label: "Soon", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { label: "On Track", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
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
              Timeline Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Manage Deadlines
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Create and monitor project deadlines. Keep track of upcoming submissions and ensure
              timely project completion.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Calendar className="h-4 w-4" />
              Create/Update Deadline
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-2 ring-blue-500/20 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectRows.length}</p>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600 ring-2 ring-green-500/20 dark:text-green-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">With Deadlines</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projectRows.filter(p => p.deadline !== "-").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 ring-2 ring-orange-500/20 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Urgent Deadlines</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projectRows.filter(p => {
                    const status = getDeadlineStatus(p.deadline);
                    return status && status.label === "Urgent";
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 ring-2 ring-red-500/20 dark:text-red-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projectRows.filter(p => {
                    const status = getDeadlineStatus(p.deadline);
                    return status && status.label === "Overdue";
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none sm:p-8">
        <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Search Deadlines
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search by project title or student name
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project or student..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Table Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Project Deadlines
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Overview of all project deadlines and their status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProjects.map((row) => {
                  const deadlineStatus = getDeadlineStatus(row.deadline);
                  return (
                    <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {row.studentName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {row.studentEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {row.title}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {row.supervisor !== "-" ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {row.supervisor}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {row.deadline}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {deadlineStatus && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${deadlineStatus.color}`}>
                            {deadlineStatus.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {row.updatedAt}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                No projects found matching your criteria
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Try adjusting your search term
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="max-h-[min(90vh,720px)] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 px-6 py-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Create or Update Deadline
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Set a new deadline for a project
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Start typing or search projects..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedProject(null);
                      setFormData({
                        ...formData,
                        projectTitle: e.target.value,
                      });
                    }}
                  />

                  {query && !selectedProject && (
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 max-h-56 overflow-y-auto">
                      {(projects || [])
                        .filter((p) =>
                          (p.title || "").toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((p) => (
                          <button
                            type="button"
                            key={p._id}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                            onClick={() => {
                              setSelectedProject(p);
                              setQuery(p.title);
                              setFormData({
                                ...formData,
                                projectTitle: p.title,
                                deadlineDate: p.deadline
                                  ? new Date(p.deadline).toISOString().slice(0, 10)
                                  : "",
                              });
                            }}
                          >
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {p.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {p.student?.name || "-"} • {p.supervisor?.name || "No supervisor"}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                    disabled={!selectedProject}
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                  />
                </div>

                {selectedProject && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Project Details
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {selectedProject.status || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Supervisor</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {selectedProject.supervisor?.name || "Not Assigned"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {selectedProject.student?.name || "-"} • {selectedProject.student?.email || "-"}
                        </p>
                      </div>
                    </div>
                    {selectedProject.description && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Description</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {selectedProject.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                    disabled={!selectedProject || !formData.deadlineDate}
                  >
                    Save Deadline
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlinesPage;