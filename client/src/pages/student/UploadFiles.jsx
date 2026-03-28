import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { downloadFile, fetchProject, uploadFiles } from "../../store/slices/studentSlice";
import { 
  Archive, 

  File, 
  FileCode, 
  FilePlus, 
  FileText, 
  Upload, 
  Download, 
  Trash2,
  Image,
  FileImage,
  FileArchive,
  Loader2,
  CheckCircle2
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch, project]);

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...list]);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!project?._id) {
      toast.error("Project not loaded yet");
      return;
    }

    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await dispatch(uploadFiles({ projectId: project._id, files: selectedFiles })).unwrap();
      setUploadSuccess(true);
      setSelectedFiles([]);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      // Error handled by toast
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelected = (name) => {
    setSelectedFiles(prev => prev.filter((f) => f.name !== name));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: { icon: FileText, color: "text-red-500" },
      doc: { icon: File, color: "text-blue-500" },
      docx: { icon: File, color: "text-blue-500" },
      ppt: { icon: Archive, color: "text-orange-500" },
      pptx: { icon: Archive, color: "text-orange-500" },
      zip: { icon: FileArchive, color: "text-amber-500" },
      rar: { icon: FileArchive, color: "text-amber-500" },
      tar: { icon: FileArchive, color: "text-amber-500" },
      gz: { icon: FileArchive, color: "text-amber-500" },
      jpg: { icon: Image, color: "text-green-500" },
      jpeg: { icon: Image, color: "text-green-500" },
      png: { icon: Image, color: "text-green-500" },
      gif: { icon: Image, color: "text-green-500" },
    };
    const { icon: Icon, color } = iconMap[extension] || { icon: FileCode, color: "text-slate-500" };
    return { Icon, color };
  };

  const handleDownloadFile = async (file) => {
    await dispatch(downloadFile({
      projectId: project._id,
      fileId: file._id,
      fileName: file.originalName,
    }));
  };

  const getPreviewType = (fileName = "") => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    return "text";
  };

  const uploadCategories = [
    {
      title: "Report",
      icon: FileText,
      description: "Upload your project report",
      formats: "PDF, DOC, DOCX",
      accept: ".pdf,.doc,.docx",
      ref: reportRef,
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Presentation",
      icon: Archive,
      description: "Upload your presentation",
      formats: "PPT, PPTX, PDF",
      accept: ".ppt,.pptx,.pdf",
      ref: presRef,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Code Files",
      icon: FileCode,
      description: "Upload your source code",
      formats: "ZIP, RAR, TAR, GZ",
      accept: ".zip,.rar,.tar,.gz",
      ref: codeRef,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50 via-white to-cyan-50/60 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/40 dark:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                File Management
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Upload Project Files
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Upload your project documents including reports, presentations, and code files. All files are securely stored and accessible to your supervisor.
              </p>
            </div>
            {project?.files?.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                  <File className="inline h-3 w-3 mr-1" />
                  {project.files.length} files uploaded
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upload Categories */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Files</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select files to upload to your project</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {uploadCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-900/70"
              >
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${cat.color} opacity-10 blur-2xl`} />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{cat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cat.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Supports: {cat.formats}</p>
                  <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                    Choose File
                    <input
                      type="file"
                      ref={cat.ref}
                      className="hidden"
                      accept={cat.accept}
                      onChange={handleFilePick}
                      multiple
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Action */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Selected Files ({selectedFiles.length})
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Files uploaded successfully!</p>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ready to Upload</h3>
            <div className="space-y-3">
              {selectedFiles.map((file) => {
                const { Icon, color } = getFileIcon(file.name);
                return (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} bg-opacity-10`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelected(file.name)}
                      className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Uploaded Files List */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Uploaded Files</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your uploaded project files</p>
          </div>

          {(project?.files || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <FilePlus className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">No files uploaded yet</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Upload your project files using the options above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(project?.files || []).map((file) => {
                const { Icon, color } = getFileIcon(file.originalName);
                return (
                  <div
                    key={file._id || file.fileUrl}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} bg-opacity-10`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{file.originalName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{file.fileType || "File"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default UploadFiles;