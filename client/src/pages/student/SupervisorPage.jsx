import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSupervisors, fetchProject, getSupervisor, requestSupervisor } from "../../store/slices/studentSlice";
import { X, User, Mail, BookOpen, Calendar, Send, CheckCircle, AlertCircle, Clock, GraduationCap, Briefcase, MessageSquare } from "lucide-react";
import { NavLink } from "react-router-dom";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor } = useSelector((state) => state.student);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisors());
  }, [dispatch]);

  const hasSupervisor = useMemo(() => !!(supervisor && supervisor._id), [supervisor]);
  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor(day % 100 / 10) === 1) ? 0 : day % 10];
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedSupervisor) return;
    const message = requestMessage?.trim() || `${authUser?.name || "Student"} has requested ${selectedSupervisor.name} to be their supervisor.`;
    
    setIsSubmitting(true);
    try {
      await dispatch(requestSupervisor({ teacherId: selectedSupervisor._id, message })).unwrap();
      setShowRequestModal(false);
      setSelectedSupervisor(null);
      setRequestMessage("");
    } catch {
      // Error handled by toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-50 via-white to-purple-50/60 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 dark:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Supervision Management
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Supervisor
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                View your assigned supervisor and request supervision for your project.
              </p>
            </div>
            {hasSupervisor && (
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="inline h-3 w-3 mr-1" />
                  Supervisor Assigned
                </span>
                <NavLink
                  to={`/student/chat/${project?._id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat with Supervisor
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Current Supervisor Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Current Supervisor
              </h3>
            </div>
          </div>

          {hasSupervisor ? (
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {supervisor?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{supervisor?.name || "-"}</h2>
                  <p className="text-slate-600 dark:text-slate-400">{supervisor?.department || "-"}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-800 dark:text-slate-200">
                      <Mail className="h-3 w-3" />
                      {supervisor?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Expertise</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Array.isArray(supervisor?.experties) ? (
                        supervisor.experties.slice(0, 2).map((exp, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {exp}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-600 dark:text-slate-400">{supervisor?.experties || "-"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <User className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                Supervisor not assigned yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Once you submit a project proposal, you can request a supervisor
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Project Details (if exists) */}
      {hasProject && (
        <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="p-6 sm:p-8">
            <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Project Details
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Title</p>
                <p className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-200">{project?.title || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(project?.status)}`}>
                    {project?.status || "Unknown"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Deadline</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
                  <Calendar className="h-3 w-3" />
                  {project?.deadline ? formatDeadline(project.deadline) : "No deadline set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Created</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {project?.createdAt ? formatDeadline(project.createdAt) : "Unknown"}
                </p>
              </div>
              {project?.description && (
                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project?.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* No Project Message */}
      {!hasProject && (
        <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="p-6 sm:p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Project Required</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You haven't submitted any project proposal yet. Please submit a proposal first to request a supervisor.
            </p>
          </div>
        </section>
      )}

      {/* Available Supervisors */}
      {!hasSupervisor && hasProject && supervisors?.length > 0 && (
        <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="p-6 sm:p-8">
            <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Available Supervisors
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a supervisor and send a request for supervision
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((sup) => (
                <div
                  key={sup._id}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                      <span className="text-lg font-bold text-white">{sup.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{sup.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{sup.department}</p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {sup.experties && Array.isArray(sup.experties) && (
                      <div className="flex flex-wrap gap-1">
                        {sup.experties.slice(0, 2).map((exp, idx) => (
                          <span key={idx} className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sup.maxStudents ? `${sup.assignedStudents?.length || 0}/${sup.maxStudents} students` : "Available"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenRequest(sup)}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Request Supervisor
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Request Supervision</h3>
                    <p className="text-xs text-indigo-100">Send a request to {selectedSupervisor.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedSupervisor(null);
                    setRequestMessage("");
                  }}
                  className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Requesting supervision from:</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{selectedSupervisor.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedSupervisor.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message to Supervisor <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Introduce yourself and explain why you'd like this professor to supervise your project..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedSupervisor(null);
                    setRequestMessage("");
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRequest}
                  disabled={isSubmitting || !requestMessage.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorPage;