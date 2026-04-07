import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Upload, 
  User, 
  MessageSquare, 
  Bell, 
  Clock, 
  Users, 
  Folder, 
  CheckSquare, 
  GraduationCap, 
  Link, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSelector } from "react-redux";

const Sidebar = ({ open, setOpen, userRole }) => {
  const location = useLocation();
  const { project } = useSelector((state) => state.student);

  const getNavigationItems = () => {
    switch (userRole) {
      case "Student":
        return [
          { name: "Dashboard", path: "/student", icon: Home },
          { name: "Submit Proposal", path: "/student/submit-proposal", icon: FileText },
          { name: "Upload Files", path: "/student/upload-files", icon: Upload },
          { name: "My Supervisor", path: "/student/supervisor", icon: User },
          { name: "Feedback", path: "/student/feedback", icon: MessageSquare },
          { name: "Notifications", path: "/student/notifications", icon: Bell },
          { name: "Messages", path: project?._id ? `/student/chat/${project._id}` : "/student", icon: MessageSquare },
        ];
      case "Teacher":
        return [
          { name: "Dashboard", path: "/teacher", icon: Home },
          { name: "Pending Requests", path: "/teacher/pending-requests", icon: Clock },
          { name: "Assigned Students", path: "/teacher/assigned-students", icon: Users },
          { name: "Project Files", path: "/teacher/files", icon: Folder },
          { name: "Manage Deadlines", path: "/teacher/deadlines", icon: Calendar },
          { name: "Messages", path: "/teacher/messages", icon: MessageSquare },
          { name: "Notifications", path: "/teacher/notifications", icon: Bell },
        ];
      case "Admin":
        return [
          { name: "Dashboard", path: "/admin", icon: Home },
          { name: "Manage Students", path: "/admin/students", icon: Users },
          { name: "Manage Teachers", path: "/admin/teachers", icon: GraduationCap },
          { name: "Assign Supervisor", path: "/admin/assign-supervisor", icon: Link },
          { name: "Manage Deadlines", path: "/admin/deadlines", icon: Calendar },
          { name: "All Projects", path: "/admin/projects", icon: Folder },
          { name: "Faculty Reports", path: "/admin/reports", icon: FileText },
          { name: "Notifications", path: "/admin/notifications", icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed left-0 top-20 h-[calc(100vh-6rem)] m-4 glass-effect rounded-[2.5rem] transition-all duration-500 ease-in-out z-30 shadow-premium group/sidebar ${
          open ? "w-64" : "w-16"
        }`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden relative">
          {/* Sidebar Toggle Button - Floating style */}
          <button
            onClick={() => setOpen(!open)}
            className="absolute -right-3 top-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:scale-110 active:scale-95 transition-all z-50 lg:flex hidden"
          >
            {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto no-scrollbar">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    group relative flex items-center rounded-2xl px-3 py-3.5 transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }
                  `}
                >
                  <div className="flex-shrink-0 relative">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? "animate-in zoom-in-75 duration-300" : ""}
                    />
                    {/* Active indicator dot for collapsed state */}
                    {isActive && !open && (
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full border-2 border-blue-600" />
                    )}
                  </div>
                  <span
                    className={`
                      ml-3 text-body transition-all duration-500 whitespace-nowrap overflow-hidden
                      ${open ? "opacity-100 max-w-xs translate-x-0" : "opacity-0 max-w-0 -translate-x-4 lg:hidden"}
                    `}
                  >
                    {item.name}
                  </span>
                  
                  {/* Premium Tooltip for collapsed state */}
                  {!open && (
                    <div className="absolute left-[calc(100%+1rem)] px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-800 text-tiny rounded-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl shadow-black/10">
                      {item.name}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className={`p-4 mt-auto transition-all duration-500 ${open ? "opacity-100" : "opacity-0 scale-90"}`}>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 p-4 border border-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <GraduationCap size={20} className="text-white" />
                </div>
                {open && (
                  <div className="transition-all duration-300">
                    <p className="heading-sm !text-sm">Admin Hub</p>
                    <p className="text-tiny">v1.0.2 Platinum</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 w-80 bg-background z-50 lg:hidden 
          transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${open ? "translate-x-0" : "-translate-x-full"}
          shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]
        `}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
          {/* Mobile Header */}
          <div className="relative overflow-hidden px-6 py-8">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="heading-md">ProjectSphere</h2>
                  <p className="text-tiny text-blue-600 dark:text-blue-400">Management</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-2xl p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center rounded-2xl px-4 py-4 transition-all duration-300
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon size={22} className={isActive ? "animate-pulse" : ""} />
                  <span className="ml-4 text-body transition-all duration-300">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between text-tiny">
              <span>ProjectSphere</span>
              <span>v1.0.2</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
