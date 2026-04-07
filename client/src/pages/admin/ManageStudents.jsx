import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import { getAllProjects, getAllUsers, deleteStudent, updateStudent } from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Plus, TriangleAlert, Users, X, Search, Filter, Edit, Trash2, GraduationCap, BookOpen } from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import { getSocket } from "../../lib/socket";

const ManageStudents = () => {
  const { users, projects } = useSelector(state => state.admin);
  const { isCreateStudentModalOpen } = useSelector(state => state.popup);
  const { mode } = useSelector((state) => state.theme);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());

    const socket = getSocket();
    if (socket) {
      const handleUpdate = () => {
        dispatch(getAllUsers());
        dispatch(getAllProjects());
      };
      socket.on("project_updated", handleUpdate);
      socket.on("new_request", handleUpdate);
      socket.on("user_updated", handleUpdate);

      return () => {
        socket.off("project_updated", handleUpdate);
        socket.off("new_request", handleUpdate);
        socket.off("user_updated", handleUpdate);
      };
    }
  }, [dispatch]);

  const students = useMemo(() => {
    const studentUsers = (users || []).filter(u => u.role?.toLowerCase() === "student");

    return studentUsers.map((student) => {
      const studentProject = (projects || []).find(p => 
        (p.students || []).some(s => (s._id || s) === student._id) || 
        (p.student?._id || p.student) === student._id
      );
      
      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor?.name || (studentProject?.supervisor ? "Assigned" : null),
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set((students || []).map((s) => s.department).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterDepartment === "all" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const statsCards = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      iconWrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
    },
    {
      title: "Completed Projects",
      value: students.filter(s => s.projectStatus === "completed").length,
      icon: CheckCircle,
      iconWrap: "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
    },
    {
      title: "Unassigned",
      value: students.filter(s => !s.supervisor).length,
      icon: TriangleAlert,
      iconWrap: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600">
              <Users size={12} />
              User Records
            </div>
            <h1 className="heading-lg">
              Student Directory
            </h1>
            <p className="max-w-xl text-body">
              Manage student accounts, monitor academic status, and coordinate supervisor assignments with precision.
            </p>
          </div>
          <div className="flex shrink-0">
            <button
              onClick={() => dispatch(toggleStudentModal())}
              className="group relative flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-semibold uppercase text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Onboard Student
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="heading-sm">
              Student Overview
            </h2>
            <p className="mt-1 text-body">
              Key metrics at a glance
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((card, i) => (
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
              <p className="mt-4 text-body">
                {card.title}
              </p>
              <p className="mt-1 heading-lg tabular-nums">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none sm:p-8">
        <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
          <h3 className="heading-sm">
            Filter Students
          </h3>
          <p className="mt-1 text-body">
            Search and filter student records
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
                placeholder="Search by name or email..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter Department
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option value={dept} key={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Students Table */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="heading-sm">
              Students List
            </h3>
            <p className="mt-1 text-body">
              Manage student accounts and view their project details
            </p>
          </div>

          <div className="overflow-x-auto">
            {filteredStudents && filteredStudents.length > 0 ? (
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Student Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Department & Year
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Supervisor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Project Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-body-bold">
                            {student.name}
                          </div>
                          <div className="text-tiny text-left">
                            {student.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {student.department || "--"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {student.createdAt ? new Date(student.createdAt).getFullYear() : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {student.supervisor ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {student.supervisor}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            student.projectStatus === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {student.projectStatus === "rejected" ? "Rejected" : "Not Assigned"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {student.projectTitle || "No project"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
                <GraduationCap className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  No students found matching your criteria
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60 overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 px-6 py-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Edit Student
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update student information
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
                Delete Student
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {studentToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={cancelDelete}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateStudentModalOpen && <AddStudent />}
    </div>
  );
};

export default ManageStudents;
