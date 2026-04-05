import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  deleteNotification, 
  getNotifications, 
  markAllAsRead, 
  markAsRead,
  addNotification 
} from "../../store/slices/notificationSlice";
import {
  MessageCircle,
  Clock,
  BadgeCheck,
  Calendar,
  Settings,
  User,
  AlertCircle,
  CheckCircle2,
  Bell,
  BellOff,
  Mail,
  Eye,
  Trash2,
  Inbox,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getSocket, connectSocket } from "../../lib/socket";
import { toast } from "react-toastify";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getNotifications());
    
    const socket = getSocket();
    if (authUser) {
      connectSocket(authUser._id);
      
      socket.on("new_notification", (notification) => {
        dispatch(addNotification(notification));
        // Optional: show a toast for high priority
        if (notification.priority === "high") {
          toast.warning(notification.message, { icon: "🔔" });
        }
      });
      
      return () => {
        socket.off("new_notification");
      };
    }
  }, [dispatch, authUser]);

  const markAsReadHandler = (id) => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    const iconMap = {
      feedback: { icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-600/10" },
      deadline: { icon: Clock, color: "text-rose-600", bg: "bg-rose-600/10" },
      approval: { icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-600/10" },
      meeting: { icon: Calendar, color: "text-violet-600", bg: "bg-violet-600/10" },
      system: { icon: Settings, color: "text-slate-600", bg: "bg-slate-600/10" },
      request: { icon: Sparkles, color: "text-amber-600", bg: "bg-amber-600/10" },
    };
    const defaultIcon = { icon: Bell, color: "text-blue-600", bg: "bg-blue-600/10" };
    return iconMap[type] || defaultIcon;
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      high: {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        text: "text-rose-700 dark:text-rose-300",
        dot: "bg-rose-500",
      },
      medium: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      },
      low: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
      },
    };
    return styles[priority] || styles.low;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const stats = [
    { title: "Total Alerts", value: notifications.length, icon: Inbox, color: "blue" },
    { title: "Unread", value: unreadCount, icon: Mail, color: "rose" },
    { title: "Critical", value: notifications.filter((n) => n.priority === "high").length, icon: AlertCircle, color: "amber" },
    { title: "Recent", value: notifications.filter(n => new Date(n.createdAt) > new Date(Date.now() - 86400000)).length, icon: Clock, color: "emerald" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Header Section */}
      <section className="premium-card relative overflow-hidden group border-none shadow-xl !p-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-600/20 text-tiny text-blue-600 uppercase tracking-widest shadow-sm">
              <Sparkles size={12} />
              Real-time Feed
            </div>
            <h1 className="heading-lg tracking-tight">
              Activity Stream
            </h1>
            <p className="max-w-xl text-body leading-relaxed">
              Real-time synchronization of system events, project milestones, and faculty requests.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsReadHandler}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-tiny font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 group/btn"
              >
                <BadgeCheck size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center gap-6 hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-3 ${
              stat.color === "blue" ? "bg-blue-600/10 text-blue-600" :
              stat.color === "rose" ? "bg-rose-600/10 text-rose-600" :
              stat.color === "amber" ? "bg-amber-600/10 text-amber-600" :
              "bg-emerald-600/10 text-emerald-600"
            }`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-tiny mb-1">{stat.title}</p>
              <p className="heading-lg">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notification List Area */}
      <section className="premium-card !p-0 overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <h3 className="heading-md">Recent Updates</h3>
          <div className="flex items-center gap-4 text-body font-bold">
             <span>Showing {notifications.length} notifications</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
              const priority = getPriorityStyles(notification.priority);
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification._id}
                  className={`group px-10 py-8 flex gap-6 transition-all relative ${
                    isUnread ? "bg-blue-600/[0.02]" : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  }`}
                >
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 shadow-[2px_0_10px_rgba(37,99,235,0.4)]" />
                  )}
                  
                  <div className={`w-14 h-14 shrink-0 rounded-[1.2rem] flex items-center justify-center ${bg} ${color} shadow-sm`}>
                    <Icon size={24} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`heading-sm truncate ${isUnread ? "text-slate-800 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {notification.title || (notification.type ? notification.type.charAt(0).toUpperCase() + notification.type.slice(1) : "Notification")}
                          </h4>
                          {isUnread && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-tiny font-bold text-white uppercase tracking-tighter">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-tiny font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(notification.createdAt)}</span>
                          <span className={`flex items-center gap-1 ${priority.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {notification.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={() => markAsReadHandler(notification._id)}
                            className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                            title="Mark as Read"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotificationHandler(notification._id)}
                          className="p-2 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className={`text-body leading-relaxed max-w-3xl ${isUnread ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                      {notification.message}
                    </p>

                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="flex items-center gap-2 text-tiny font-bold text-blue-600 hover:text-blue-700 group/link"
                      >
                        View Details{" "}
                        <ArrowRight
                          size={14}
                          className="group-hover/link:translate-x-1 transition-transform"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center px-10">
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-8">
                <BellOff size={48} />
              </div>
              <h4 className="heading-lg mb-3">Quiet Day Today</h4>
              <p className="text-body max-w-sm leading-relaxed font-bold">
                You're all caught up! New updates regarding your projects and requests will appear here in real-time.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NotificationsPage;
