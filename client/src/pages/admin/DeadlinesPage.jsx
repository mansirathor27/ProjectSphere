import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { getAllProjects } from "../../store/slices/adminSlice";
import { X, Search, Calendar, Clock, AlertCircle, FileText, User, Users, ChevronDown } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { getSocket } from "../../lib/socket";

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
  const [updatingStatusFor, setUpdatingStatusFor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.admin);
  const { authUser } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const [viewProjects, setViewProjects] = useState([]);

  useEffect(() => {
    dispatch(getAllProjects());

    const socket = getSocket();
    if (socket) {
      const handleUpdate = () => {
        dispatch(getAllProjects());
      };
      socket.on("project_updated", handleUpdate);
      socket.on("new_notification", handleUpdate);
      socket.on("new_feedback", handleUpdate);

      return () => {
        socket.off("project_updated", handleUpdate);
        socket.off("new_notification", handleUpdate);
        socket.off("new_feedback", handleUpdate);
      };
    }
  }, [dispatch]);

  useEffect(() => {
    if (!projects) return;
    let filtered = [...projects];
    if (authUser?.role === "Teacher") {
      filtered = projects.filter((p) => {
        const supervisorId = p.supervisor?._id || p.supervisor;
        return supervisorId === authUser._id;
      });
    }
    setViewProjects(filtered);
  }, [projects, authUser]);

  const projectRows = useMemo(() => {
    return (viewProjects || []).map((p) => {
      // Handle the "students" array from the model
      const students = p.students || [];
      const primaryStudent = students[0] || {};
      const studentNames = students.map(s => s.name).join(", ") || primaryStudent.name || '-';
      const studentEmails = students.map(s => s.email).join(", ") || primaryStudent.email || '-';

      return {
        _id: p._id,
        title: p.title,
        studentName: studentNames,
        studentEmail: studentEmails,
        studentDept: primaryStudent.department || '-',
        supervisor: p.supervisor?.name || '-',
        deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "-",
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
        raw: p,
      };
    });
  }, [viewProjects]);

  const filteredProjects = projectRows.filter((row) => {
    const matchesSearch =
      (row.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusUpdate = async (projectId, newStatus) => {
    setUpdatingStatusFor(projectId);
    try {
      const res = await axiosInstance.put(`/admin/update-project-status/${projectId}`, { status: newStatus });
      if (res.data.success) {
        setViewProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, status: newStatus } : p))
        );
        toast.success("Status updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    const students = selectedProject?.students || [];
    const studentNames = students.map(s => s.name || s).filter(Boolean).join(", ");
    const studentName = studentNames || selectedProject?.studentName || "Student";

    let deadlineData = {
      name: studentName,
      dueDate: formData?.deadlineDate,
      project: selectedProject?._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineData })
      ).unwrap();
      if (updated?.project) {
        setViewProjects((prev) =>
          prev.map((p) => (p._id === updated.project ? { ...p, deadline: updated.dueDate } : p))
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
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Hero Section */}
      <header className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600">
              <Calendar size={12} />
              Project Timelines
            </div>
            <h1 className="heading-lg">
              Manage Deadlines
            </h1>
            <p className="max-w-xl text-body">
              Orchestrate project schedules and monitor submission status across the platform.
            </p>
          </div>
          {(authUser?.role === "Admin" || authUser?.role === "Teacher") && (
            <div className="flex shrink-0">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-semibold uppercase text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Calendar className="h-4 w-4" />
                Setup Deadline
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-2 ring-blue-500/20 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-body mt-1">Total Projects</p>
                <p className="heading-lg">{projectRows.length}</p>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600 ring-2 ring-green-500/20 dark:text-green-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-body mt-1">With Deadlines</p>
                <p className="heading-lg">
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
                <p className="text-body mt-1">Urgent Deadlines</p>
                <p className="heading-lg">
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
                <p className="text-body mt-1">Overdue</p>
                <p className="heading-lg">
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
          <h3 className="heading-sm">
            Search Deadlines
          </h3>
          <p className="mt-1 text-body">
            Search by project title or student name
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project or student..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Table Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="heading-sm">
              Project Deadlines
            </h3>
            <p className="mt-1 text-body">
              Overview of all project deadlines and their status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Project Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Supervisor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
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
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
                            {row.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-body-bold">
                              {row.studentName}
                            </div>
                            <div className="text-tiny text-left">
                              {row.studentEmail}
                            </div>
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
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {row.deadline}
                          </div>
                          {deadlineStatus && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${deadlineStatus.color}`}>
                              {deadlineStatus.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.raw.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          row.raw.status === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                          row.raw.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {row.raw.status || "pending"}
                        </span>
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
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                              {p.students?.map(s => s.name).join(", ") || "-"} • {p.supervisor?.name || "No supervisor"}
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                    disabled={!selectedProject}
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                  />
                </div>

                {selectedProject && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {selectedProject.students?.map(s => `${s.name} (${s.email})`).join(" , ") || "-"}
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
