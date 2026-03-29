import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader, CalendarPlus, MessageCircle } from "lucide-react";
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
  <div className="space-y-6">
    {/* header */}
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Assigned Students</h1>
        <p className="card-subtitle">
          Manage your assigned students and their projects
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {
          stats.map((item)=>{
            return (
              <div key={item.label} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.sub}`}>{item.label}</p>
                <p className={`text-2xl ${item.text} font-bold`}>{item.value}</p>
              </div>
            )
          })
        }
      </div>

    </div>


    {/* students grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {
            sortedStudents.map((student)=>(
              <div key={student._id} className="card hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {student.name?.split(" ").map((n)=>n[0]).join("") || "S"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{student.name}</h3>
                      <p className="text-sm text-slate-600">{student.email}</p>
                    </div>
                  </div>

                  {/* status badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(student.project?.status)}`}>
                    {getStatusText(student.project?.status)}
                  </span>


                </div>

                <div className="mb-5 flex flex-col gap-1">
                  <h4 className="font-medium text-slate-700 mb-1">{student.project.title || "No project title"}</h4>
                  <p className="text-xs text-slate-500">
                    Last Update:{" "} {new Date(student.project?.updatedAt || new Date()).toLocaleDateString()}
                  </p>
                  {student.project?.deadline && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-600 font-medium">
                        Deadline: {new Date(student.project.deadline).toLocaleDateString()}
                      </p>
                      <button 
                        onClick={() => generateICS(
                          student.project.title || "Project Deadline", 
                          `Deadline for ${student.name}'s project`, 
                          student.project.deadline
                        )}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-100/50 hover:bg-blue-100 transition-colors"
                      >
                        <CalendarPlus className="w-3 h-3"/> Add to Calendar
                      </button>
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="flex gap-3">
                  <button onClick={()=>handleFeedback(student)} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600
                   text-white text-sm rounded-lg hover:bg-blue-700 transition">
                    <MessageSquare className="w-4 h-4"/> Feedback
                   </button>
                   <button onClick={()=>handleMarkComplete(student)}
                  disabled={student.project?.status === "completed"} 
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600
                   text-white text-sm rounded-lg hover:bg-green-700 transition ${student?.project?.status === "completed"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700" 
                   }`}>
                    <CheckCircle className="w-4 h-4"/> Mark Complete
                   </button>
                   <button 
                    onClick={() => navigate(`/teacher/chat/${student.project._id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                  >
                    <MessageCircle className="w-4 h-4"/> Chat
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
