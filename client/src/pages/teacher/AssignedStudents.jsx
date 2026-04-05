import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader, CalendarPlus, MessageCircle, Users, Clock } from "lucide-react";
import { addFeedback, getAssignedStudents, markComplete } from "../../store/slices/teacherSlice";
import { generateICS } from "../../lib/calendar";
import { useNavigate } from "react-router-dom";

const AssignedStudents = () => {
  const [sortBy] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {assignedStudents, loading, error} = useSelector((state)=> state.teacher);
  useEffect(()=>{
    dispatch(getAssignedStudents());
  },[dispatch]);

  const getStatusBadge = (status)=>{
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300"
      case "approved":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
    }
  }; 

  const getStatusText = (status) =>{
    if(status === "completed") return "Completed";
    if(status === "approved") return  "Approved";
    return "Pending";
  };

  const handleFeedback = (student)=>{
    setSelectedStudent(student);
    setFeedbackData({title: "", message: "", type: "general"});
    setShowFeedbackModal(true);
  };

  const handleMarkComplete = (student)=>{
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const closeModal = ()=>{
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general"});
  };

  const submitFeedback = () =>{
    if(selectedStudent?.project?._id 
      && feedbackData.title 
      && feedbackData.message){
        dispatch(addFeedback({
          projectId: selectedStudent.project?._id,
          payload: feedbackData,
        }));
        closeModal();
      }
  };


  const confirmMarkComplete = () =>{
    if(selectedStudent?.project?._id){
        dispatch(markComplete(
          selectedStudent.project?._id));
        closeModal();
      }
  };

  const safeStudents = Array.isArray(assignedStudents) ? assignedStudents : [];

const sortedStudents =
  sortBy === "name"
    ? [...safeStudents].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      )
    : sortBy === "lastActivity"
    ? [...safeStudents].sort(
        (a, b) =>
          new Date(b.project?.updatedAt || 0) -
          new Date(a.project?.updatedAt || 0)
      )
    : safeStudents;

  const stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: sortedStudents.filter(
        (s) => s.project?.status === "completed"
      ).length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter(
        (s) => s.project?.status === "in_progress"
      ).length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Projects",
      value: sortedStudents.length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  if(loading){
    return <Loader className="animate-spin w-16 h-16"/>;
  }

  if(error){
    return (
      <div className="text-center py-10 text-red-600 font-medium">Error loading students</div>
    );
  }

  return( <>
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl shadow-blue-500/5 group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest">
            <Users size={12} />
            Active Mentorships
          </div>
          <h1 className="heading-lg">
            Assigned Students
          </h1>
          <p className="max-w-xl text-body">
            Monitor progress, provide specialized feedback, and manage final project submissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((item) => (
          <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-tiny mb-1">{item.label}</p>
            <p className="heading-lg tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </section>


    {/* students grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {
            sortedStudents.map((student)=>(
              <div key={student._id} className="premium-card group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
                      {student.name?.split(" ").map((n)=>n[0]).join("") || "S"}
                    </div>
                    <div>
                      <h3 className="heading-sm">{student.name}</h3>
                      <p className="text-tiny text-left">{student.email}</p>
                    </div>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-tiny font-bold uppercase ${
                    student.project?.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    student.project?.status === "approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {getStatusText(student.project?.status)}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="heading-sm mb-1 leading-snug">{student.project.title || "Untitled Research Project"}</h4>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <p className="text-tiny">
                        Updated {new Date(student.project?.updatedAt || new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {student.project?.deadline && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <CalendarPlus className="w-4 h-4 text-blue-600" />
                        <span className="text-tiny text-slate-700 dark:text-slate-300">
                          Due: {new Date(student.project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => generateICS(
                          student.project.title || "Project Deadline", 
                          `Deadline for ${student.name}'s project`, 
                          student.project.deadline
                        )}
                        className="text-tiny text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Sync Calendar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={()=>handleFeedback(student)} 
                  className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95">
                    <MessageSquare size={14}/> Feedback
                  </button>
                  <button onClick={()=>handleMarkComplete(student)}
                  disabled={student.project?.status === "completed"} 
                  className={`flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 active:scale-95 ${student?.project?.status === "completed" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}>
                    <CheckCircle size={14}/> Finalize
                  </button>
                  <button 
                    onClick={() => navigate(`/teacher/chat/${student.project._id}`)}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition shadow-lg active:scale-95"
                  >
                    <MessageCircle size={14}/> Chat
                  </button>
                </div>
              </div>
          ))}

          {
            sortedStudents.length === 0 && (
              <div className="card text-center py-10 text-slate-600">
                No assigned students found
              </div>
            )
          }


        </div>

    {/* feedback modal */}
    {
      showFeedbackModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100
           transition-all" onClick={(e)=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Provide Feedback</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5"/>
                </button>
              </div>


              {/* project info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">
                      Project:
                    </span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.project?.title || "No title"}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-slate-600">
                      Student:
                    </span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.name}
                    </span>
                  </div>


                  {
                    selectedStudent.project?.deadline && (
                      <div>
                        <span className="font-medium text-slate-600">
                          Deadline:
                        </span>
                        <span className="ml-2 text-slate-800">
                          {new Date(selectedStudent.project?.deadline)
                          .toLocaleDateString()}
                        </span>
                      </div>
                  )}

                  <div>
                    <span className="font-medium text-slate-600">
                      Last Updated:
                    </span>
                    <span className="ml-2 text-slate-800">
                      {new Date(selectedStudent.project?.updatedAt || new Date())
                          .toLocaleDateString()}
                    </span>
                  </div>


                </div>


                {/* feedback form */}
                <div className="space-y-4">
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Title
                    </label>
                    <input type="text" value={feedbackData.title} 
                    onChange={(e)=> setFeedbackData({
                      ...feedbackData,
                      title: e.target.value,
                    })} className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter feedback title"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Type
                    </label>
                    <select value={feedbackData.type} 
                    onChange={(e)=> setFeedbackData({
                      ...feedbackData,
                      type: e.target.value,
                    })} className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2
                     focus:ring-blue-500 focus:border-transparent">
                      <option value="general">General</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                     </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Message
                    </label>
                    <textarea value={feedbackData.message} 
                    onChange={(e)=> setFeedbackData({
                      ...feedbackData,
                      message: e.target.value,
                    })} rows={4} className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2
                     focus:ring-blue-500 focus:border-transparent resize-none"
                     placeholder="Enter your feedback message..."
                    />
                  </div>

                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-danger">Cancel</button>
                  <button onClick={submitFeedback} className="btn-primary" disabled={!feedbackData.title || !feedbackData.message}
                  >Submit Feedback
                  </button>
                </div>
              </div>  
            </div>
          </div>
        </div>
    )}

    {/* complete modal */}
    {
      showCompleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex backdrop-blur-sm items-center justify-center z-50 p-4"
        onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100
           transition-all" onClick={(e)=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Mark Project as Completed?</h2>
                <button className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Student</span>
                    <span className="ml-2 text-slate-800">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Project</span>
                    <span className="ml-2 text-slate-800">{selectedStudent.project?.title || "No title"}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure to mark this project as completed? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button onClick={closeModal} className="btn-danger">Cancel</button>
                <button onClick={confirmMarkComplete} className="btn-primary">
                  Mark as Completed
                </button>
              </div>

            </div>
           </div>
        </div>
      )
    } 

    </div>
  </>
  );
};

export default AssignedStudents;
