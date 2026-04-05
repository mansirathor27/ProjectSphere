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

  // Group students by project_id
  const groupedProjects = assignedStudents?.reduce((acc, student) => {
    const projectId = student.project?._id;
    if (!projectId) return acc;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: student.project,
        students: []
      };
    }
    acc[projectId].students.push(student);
    return acc;
  }, {});

  const projectsList = Object.values(groupedProjects || {});

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest">
              <MessageSquare size={12} />
              Collaboration Hub
            </div>
            <h1 className="heading-lg">
              Messages
            </h1>
            <p className="max-w-xl text-body">
              Select a group project to start chatting with your mentees.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {projectsList.length > 0 ? (
          projectsList.map((group) => {
            const isGroup = group.students.length > 1;
            const displayName = group.project.groupName || (isGroup ? group.students.map(s => s.name.split(' ')[0]).join(', ') : group.students[0].name);
            
            return (
              <button
                key={group.project._id}
                onClick={() => navigate(`/teacher/chat/${group.project._id}`)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isGroup ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {isGroup ? <Users className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-body-bold truncate">{displayName}</h3>
                    <p className="text-body truncate">{group.project.title}</p>
                    {isGroup && (
                      <p className="text-tiny mt-1 text-slate-400">Team Member{group.students.length > 1 ? 's' : ''}: {group.students.length}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-20 dark:border-slate-700">
            <Users className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-lg font-medium text-slate-500">No projects assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessages;
