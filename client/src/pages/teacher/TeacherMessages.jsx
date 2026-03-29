import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageSquare, User, ChevronRight, Loader, Users } from "lucide-react";
import { getAssignedStudents } from "../../store/slices/teacherSlice";

const TeacherMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignedStudents, loading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select a student to start chatting</p>
        </div>
      </div>

      <div className="grid gap-3">
        {assignedStudents?.length > 0 ? (
          assignedStudents.map((student) => (
            <button
              key={student._id}
              onClick={() => navigate(`/teacher/chat/${student.project._id}`)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{student.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{student.project.title}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-20 dark:border-slate-700">
            <Users className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-lg font-medium text-slate-500">No students assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessages;
