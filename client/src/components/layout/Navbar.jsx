import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { Moon, Sun, Menu, X, ChevronDown, User, LogOut, Settings, GraduationCap, Search, Bell } from "lucide-react";
import { toggleTheme } from "../../store/slices/themeSlice";
import { getSocket, connectSocket } from "../../lib/socket";
import { addNotification, getNotifications } from "../../store/slices/notificationSlice";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { authUser } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (authUser) {
      dispatch(getNotifications());
      connectSocket(authUser._id);
      const socket = getSocket();
      
      socket.on("new_notification", (notification) => {
        dispatch(addNotification(notification));
      });
      
      return () => {
        socket.off("new_notification");
      };
    }
  }, [authUser, dispatch]);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate("/login");
    });
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const role = authUser?.role?.toLowerCase() || "student";
      navigate(`/${role}/search?q=${searchQuery.trim()}`);
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/20";
      case "teacher":
        return "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20";
      case "student":
        return "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20";
      default:
        return "bg-gradient-to-br from-slate-500 to-gray-600 shadow-slate-500/20";
    }
  };

  const notificationsPath = `/${(authUser?.role || "student").toLowerCase()}/notifications`;

  return (
    <nav className="fixed top-0 z-50 w-full glass-effect border-b transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Left: Sidebar Toggle & Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all hover:scale-110 active:scale-95 lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 transition-all group-hover:scale-110 group-hover:rotate-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  ProjectSphere
                </h1>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest -mt-0.5">
                  FYP Management
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Hero Search Bar */}
          <div className={`hidden lg:flex flex-1 max-w-xl transition-all duration-500 ${searchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className={`transition-colors duration-300 ${searchFocused ? 'text-blue-600' : 'text-slate-400'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search projects, students or keywords..."
                className="w-full h-12 bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl pl-12 pr-4 text-sm font-medium outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="px-2 py-1 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">⌘ K</span>
              </div>
            </div>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link 
              to={notificationsPath}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all hover:scale-110 active:scale-95 group"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white border-2 border-white dark:border-slate-900 shadow-lg animate-in zoom-in-50">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all hover:scale-110 active:scale-95"
            >
              {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 rounded-[1.25rem] p-1.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${getRoleColor(
                    authUser?.role
                  )} shadow-lg scale-100 group-active:scale-90 transition-all`}
                >
                  <span className="text-sm font-black text-white">
                    {getInitials(authUser?.name)}
                  </span>
                </div>
                <div className="hidden text-left xl:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {authUser?.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                    {authUser?.role}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden text-slate-400 transition-transform duration-300 xl:block ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Enhanced Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-[2rem] glass-effect border p-4 shadow-premium z-50 animate-in fade-in-0 zoom-in-95 duration-300">
                    {/* Active User Label */}
                    <div className="px-4 py-4 mb-2 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl border border-blue-500/10">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getRoleColor(authUser?.role)} shadow-lg`}>
                          <span className="text-lg font-black text-white">{getInitials(authUser?.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{authUser?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{authUser?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      <Link
                        to={`/${(authUser?.role || "student").toLowerCase()}/profile`}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User size={18} />
                        <span>Profile Settings</span>
                      </Link>
                      <button
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        <span>Sign Out System</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;