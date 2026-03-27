import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { assignSupervisor as assignSupervisorThunk, getAllUsers } from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users, Search, Filter, UserCheck, UserX, Clock, ChevronDown } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [pendingFor, setPendingFor] = useState(null);

  const { users, projects } = useSelector((state) => state.admin);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch, users]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher"
    );
    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0,
      capacityLeft: (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || []).filter((p) => !!p.student?._id).map((p) => ({
      projectId: p._id,
      title: p.title,
      status: p.status,
      supervisor: p.supervisor?.name || null,
      supervisorId: p.supervisor?._id || null,
      studentId: p.student?._id || "Unknown",
      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "-",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
      isApproved: p.status === "approved",
    }));
  }, [projects]);

  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const status = row.supervisor ? "assigned" : "unassigned";
    const matchesFilter = filterStatus === "all" || status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus === "rejected") {
      toast.error("Cannot assign supervisor to a rejected project");
      return;
    }
    setPendingFor(projectId);
    const res = await dispatch(assignSupervisorThunk({ studentId, supervisorId }));
    setPendingFor(null);
    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    } else {
      toast.error("Failed to assign supervisor");
    }
  };

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      iconWrap: "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      iconWrap: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
    },
    {
      title: "Available Teachers",
      value: teachers.filter((t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0)).length,
      icon: Users,
      iconWrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
    },
  ];

  const getStatusBadge = (row) => {
    if (row.supervisor) {
      return {
        text: row.supervisor,
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      };
    }
    if (row.status === "rejected") {
      return {
        text: "Rejected",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    }
    if (!row.isApproved) {
      return {
        text: "Pending Approval",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    }
    return {
      text: "Not Assigned",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    };
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
              Supervision Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Assign Supervisor
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Manage supervisor assignments for students and projects. Track workload distribution
              and ensure every project has proper guidance.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
              {studentProjects.length} total students
            </span>
            <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
              {teachers.length} teachers available
            </span>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Assignment Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Key metrics at a glance
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/40 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none dark:ring-slate-700/50 dark:hover:shadow-lg dark:hover:shadow-black/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-2 ring-inset ${card.iconWrap}`}
                >
                  <card.icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none sm:p-8">
        <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Filter Students
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search and filter student assignments
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search Students
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or project title..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
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
                <option value="all">All Students</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Student Assignments
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Assign supervisors to students and manage supervision workload
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
                    Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Assign Supervisor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((row) => {
                  const statusBadge = getStatusBadge(row);
                  return (
                    <tr key={row.projectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
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
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {row.deadline}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {row.updatedAt}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                          value={selectedSupervisor[row.projectId] || ""}
                          disabled={!!row.supervisor || row.status === "rejected" || !row.isApproved}
                          onChange={(e) => handleSupervisorSelect(row.projectId, e.target.value)}
                        >
                          <option value="" disabled>Select Supervisor</option>
                          {teachers
                            .filter((t) => t.capacityLeft > 0)
                            .map((t) => (
                              <option value={t._id} key={t._id}>
                                {t.name} ({t.capacityLeft} slots left)
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                          onClick={() => handleAssign(row.studentId, row.status, row.projectId)}
                          disabled={
                            pendingFor === row.projectId ||
                            !!row.supervisor ||
                            row.status === "rejected" ||
                            !row.isApproved ||
                            !selectedSupervisor[row.projectId]
                          }
                        >
                          {pendingFor === row.projectId
                            ? "Assigning..."
                            : row.supervisor
                            ? "Assigned"
                            : row.status === "rejected"
                            ? "Rejected"
                            : !row.isApproved
                            ? "Not Approved"
                            : "Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <UserX className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                No students found matching your criteria
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AssignSupervisor;