import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownToLine, FileArchive, FileSpreadsheet, FileText, LayoutGrid, List, File } from "lucide-react";
import {downloadTeacherFile, getFiles} from "../../store/slices/teacherSlice"
const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();

  const filesFromStore = useSelector((state)=>state.teacher.files);
  useEffect(()=>{
    dispatch(getFiles());
  },[dispatch]);

  const deriveTypeFormatName = (name)=>{
    if(!name) return "other";
    const parts = name.split(".");
    return (parts[parts.length -1] || "").toLowerCase()
  };

  const normalizeFile = useCallback((f)=>{
    const type = deriveTypeFormatName(f.originalName) || f.fileType || "other";

  let category = "other";
  if(["pdf", "doc", "docx", "txt"].includes(type)){
    category = "report";
  }else if(["ppt", "pptx"].includes(type)){
    category = "presentation";
  }else if(["zip", "rar", "7z", "js", "ts", "html", "css", "json"].includes(type)){
    category = "code";
  }else if(["jpeg", "jpg", "png", "avif", "gif"].includes(type)){
    category = "image";
  }

  return {
    id: f._id,
    name: f.originalName,
    type: type.toUpperCase(),
    size: f.size || "-",
    student: f.studentNames || f.studentName || "-",
    email: f.studentEmails || "-",
    uploadedAt: f.uploadedAt || f.createdAt || new Date().toISOString(),
    category,
    projectId: f.projectId || f.project?._id,
    fileId: f._id,
  };
}, []);

const files = useMemo (()=> (
  (filesFromStore || []).map(normalizeFile)),
  [filesFromStore, normalizeFile]
);
    const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;

      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;

      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;

      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;

      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };


  
  const filteredFiles = useMemo(() => {
  return files.filter((file) => {
    const matchesType =
      filterType === "all" ? true : file.category === filterType;

    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });
}, [files, filterType, searchTerm]);


  const handleDownloadFile = async (file) => {
    await dispatch(
      downloadTeacherFile({
        projectId: file.projectId,
        fileId: file.id,
        fileName: file.name, // ✅ PASS THIS
      })
    );
  };

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
    {
      label: "Images",
      count: files.filter((f) => f.category === "image").length,
      bg: "bg-pink-50",
      text: "text-pink-600",
      value: "text-pink-700",
    },
  ];

  const tableHeadData = [
    "File Name",
    "Student",
    "Type",
    "Upload Date",
    "Actions",
  ];  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest">
              <FileArchive size={12} />
              Artifact Repository
            </div>
            <h1 className="heading-lg">
              Student Submissions
            </h1>
            <p className="max-w-xl text-body">
              Audit project documentation, source code, and presentation artifacts across all mentored groups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {fileStats.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-tiny mb-1">{item.label}</p>
              <p className="heading-lg tabular-nums">{item.count}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <select 
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 py-3 pl-4 pr-10 text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all cursor-pointer" 
              value={filterType} 
              onChange={(e)=>setFilterType(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="report">Academic Reports</option>
              <option value="presentation">Presentations</option>
              <option value="code">Source Code</option>
              <option value="image">Media/UI Assets</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <List size={14} />
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 py-3 pl-4 pr-4 text-xs font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" 
              placeholder="Search by filename or student..." 
              value={searchTerm} 
              onChange={(e)=> setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button 
            onClick={()=>setViewMode("grid")}
            className={`px-4 py-2 rounded-xl text-tiny transition-all font-bold ${viewMode === "grid" 
              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Grid
          </button>
          <button
            onClick={()=>setViewMode("list")}
            className={`px-4 py-2 rounded-xl text-tiny transition-all font-bold ${viewMode === "list" 
              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredFiles.map((file)=>(
            <div key={file.id} className="premium-card group hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] text-blue-600 group-hover:rotate-6 transition-transform">
                  {getFileIcon(file.type)}
                </div>
              </div>
              
              <h3 className="text-body-bold mb-1 truncate w-full px-2" title={file.name}>
                {file.name}
              </h3>
              <p className="text-tiny text-left mb-4 px-2">
                {file.student} • {file.size}
              </p>

              <button 
                onClick={()=>handleDownloadFile(file)} 
                className="w-full mt-auto py-3 bg-blue-600 hover:bg-blue-700 text-white text-tiny font-bold uppercase rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ArrowDownToLine size={14}/> Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="premium-card overflow-hidden !p-0 border-none shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {tableHeadData.map((t, idx) => (
                  <th key={idx} className="px-8 py-5 text-tiny">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-blue-600/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-body-bold truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-body-bold">{file.student}</td>
                  <td className="px-8 py-6">
                    <span className="text-tiny font-bold uppercase text-blue-600 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      {file.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-tiny">
                    {new Date(file.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-tiny font-bold uppercase rounded-xl transition-all active:scale-95"
                      onClick={()=> handleDownloadFile(file)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherFiles;
