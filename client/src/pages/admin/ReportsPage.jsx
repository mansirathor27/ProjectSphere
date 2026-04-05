import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects, getAllUsers, getSupervisorRequests } from "../../store/slices/adminSlice";
import { 
  Users, 
  Download, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { users, projects, supervisorRequests } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
    dispatch(getSupervisorRequests());
  }, [dispatch]);

  const teachers = useMemo(() => {
    return (users || []).filter((u) => u.role === "Teacher");
  }, [users]);

  // Aggregate data: Group projects by teacher
  const reportData = useMemo(() => {
    return teachers.map((teacher) => {
      const teacherProjects = (projects || []).filter(
        (p) => {
          const supId = p.supervisor?._id?.toString() || p.supervisor?.toString();
          return supId === teacher._id.toString();
        }
      );

      const teacherRequests = (supervisorRequests || []).filter(
        (r) => {
          const supId = r.supervisor?._id?.toString() || r.supervisor?.toString();
          return supId === teacher._id.toString() && r.status === "pending";
        }
      );

      const stats = {
        total: teacherProjects.length,
        approved: teacherProjects.filter((p) => p.status === "approved").length,
        completed: teacherProjects.filter((p) => p.status === "completed").length,
        pending: teacherProjects.filter((p) => p.status === "pending").length + teacherRequests.length,
      };

      return {
        ...teacher,
        projects: teacherProjects,
        pendingRequests: teacherRequests,
        stats,
      };
    });
  }, [teachers, projects, supervisorRequests]);

  const filteredReports = reportData.filter((report) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    const headers = ["Teacher Name", "Department", "Total Students", "Approved", "Completed", "Pending"];
    const rows = filteredReports.map(r => [
      r.name,
      r.department || "N/A",
      r.stats.total,
      r.stats.approved,
      r.stats.completed,
      r.stats.pending
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Faculty_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      <Breadcrumbs />
      {/* Header Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-indigo-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-tiny text-indigo-600">
              <GraduationCap size={12} />
              Faculty Records
            </div>
            <h1 className="heading-lg">
              Faculty Workload <span className="text-indigo-600">Reports</span>
            </h1>
            <p className="max-w-xl text-body">
              Analyze supervisor performance, student distribution, and project completion rates across all departments.
            </p>
          </div>
          <div className="flex shrink-0">
            <button
              onClick={downloadCSV}
              className="group relative flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-semibold uppercase text-white shadow-lg hover:bg-slate-800 transition-all active:scale-95 dark:bg-white dark:text-slate-900"
            >
              <Download className="h-4 w-4" />
              Export Records
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="premium-card !p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by faculty name or department..."
            className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl pl-12 pr-6 text-body-bold outline-none focus:border-indigo-500/50 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Reports List */}
      <section className="space-y-6">
        {filteredReports.map((report) => (
          <div 
            key={report._id} 
            className="group premium-card !p-0 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-indigo-500/50 transition-all"
          >
            <div 
              className={`p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 transition-colors ${expandedTeacher === report._id ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
              onClick={() => setExpandedTeacher(expandedTeacher === report._id ? null : report._id)}
            >
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {report.name.charAt(0)}
                </div>
                <div>
                  <h3 className="heading-sm">{report.name}</h3>
                  <p className="text-tiny text-left">{report.department || "General Faculty"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 max-w-2xl">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                   <p className="text-tiny mb-1">Total</p>
                   <p className="heading-sm">{report.stats.total}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                   <p className="text-tiny !text-emerald-600 mb-1">Done</p>
                   <p className="heading-sm !text-emerald-700 dark:!text-emerald-400">{report.stats.completed}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                   <p className="text-tiny !text-blue-600 mb-1">Approved</p>
                   <p className="heading-sm !text-blue-700 dark:!text-blue-400">{report.stats.approved}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                   <p className="text-tiny !text-amber-600 mb-1">Pending</p>
                   <p className="heading-sm !text-amber-700 dark:!text-amber-400">{report.stats.pending}</p>
                </div>
              </div>

              <div className="flex justify-end min-w-[40px]">
                {expandedTeacher === report._id ? <ChevronUp size={24} className="text-indigo-600" /> : <ChevronDown size={24} className="text-slate-300" />}
              </div>
            </div>

            {expandedTeacher === report._id && (
              <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                  <h4 className="text-tiny uppercase tracking-[0.2em] mb-6">Assigned Project Portfolio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.projects.length > 0 ? report.projects.map((proj) => (
                      <div key={proj._id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex items-start justify-between group/card hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all">
                        <div className="space-y-2">
                          <p className="text-tiny text-indigo-600 uppercase">
                            {proj.students?.[0]?.name || "Unknown Student"}
                          </p>
                          <h5 className="font-bold text-slate-800 dark:text-white leading-tight">{proj.title}</h5>
                          {proj.tags && proj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.tags.map((tag, ti) => (
                                <span key={ti} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-[8px] font-bold text-indigo-500 uppercase">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-tiny font-bold uppercase ${
                          proj.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          proj.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                    )) : (
                      <div className="col-span-full py-10 text-center italic text-slate-400 font-bold">No active projects found for this supervisor.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <GraduationCap size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
             <p className="heading-md italic">No faculty records match your current search.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
