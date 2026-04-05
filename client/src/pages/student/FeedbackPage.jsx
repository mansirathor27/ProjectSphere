import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback, addFeedbackToState } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle, User, Calendar, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

import { getSocket, connectSocket } from "../../lib/socket";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector((state) => state.student);
  const { authUser } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

  useEffect(() => {
    if (!authUser?._id) return;

    connectSocket(authUser._id);
    const socket = getSocket();

    const handleNewFeedback = (data) => {
      // Optimistic Update: Add new feedback to state immediately
      if (data.feedback) {
        dispatch(addFeedbackToState(data.feedback));
      }
      
      // Also fetch to ensure everything is in sync (stats, etc)
      if (project?._id) {
         dispatch(getFeedback(project._id));
      }
    };

    socket.on("new_feedback", handleNewFeedback);
    
    return () => {
      socket.off("new_feedback", handleNewFeedback);
    };
  }, [authUser?._id, project?._id, dispatch]);

  const getFeedbackIcon = (type) => {
    if (type === "positive") {
      return <ThumbsUp className="h-5 w-5 text-green-500" />;
    }
    if (type === "negative") {
      return <ThumbsDown className="h-5 w-5 text-red-500" />;
    }
    return <MessageCircle className="h-5 w-5 text-blue-500" />;
  };

  const getFeedbackTypeStyles = (type) => {
    if (type === "positive") {
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-800 dark:text-green-300",
      };
    }
    if (type === "negative") {
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-800 dark:text-red-300",
      };
    }
    return {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-300",
    };
  };

  const feedbackStats = [
    {
      type: "general",
      title: "Total Feedback",
      icon: MessageSquare,
      bg: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
      textColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-900 dark:text-blue-300",
      getCount: (feedback) => feedback?.length || 0,
    },
    {
      type: "positive",
      title: "Positive",
      icon: ThumbsUp,
      bg: "bg-green-500/10",
      iconBg: "bg-green-500/20",
      textColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-900 dark:text-green-300",
      getCount: (feedback) => feedback?.filter((f) => f.type === "positive").length,
    },
    {
      type: "negative",
      title: "Needs Revision",
      icon: ThumbsDown,
      bg: "bg-red-500/10",
      iconBg: "bg-red-500/20",
      textColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-900 dark:text-red-300",
      getCount: (feedback) => feedback?.filter((f) => f.type === "negative").length,
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden premium-card !p-8 border-none shadow-xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-purple-600/5 to-transparent rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-600/10 border border-purple-600/20 text-tiny text-purple-600">
              <MessageCircle size={12} />
              Communication
            </div>
            <h1 className="heading-lg">
              Supervisor Feedback
            </h1>
            <p className="max-w-xl text-body">
              View feedback and comments from your supervisor. Use this input to improve your project.
            </p>
          </div>
          {project?.title && (
            <div className="flex shrink-0">
               <span className="rounded-xl border border-slate-200/80 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400">
                 {project.title}
               </span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedbackStats.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ring-2 ring-inset ring-current/20`}>
                    <Icon className={`h-6 w-6 ${item.textColor}`} />
                  </div>
                  <div>
                    <p className="text-body mt-1">
                      {item.title}
                    </p>
                    <p className={`heading-lg ${item.valueColor}`}>
                      {item.getCount(feedback)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feedback List */}
      <section className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/25 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-700/80">
            <h3 className="heading-sm">
              All Feedback
            </h3>
            <p className="mt-1 text-body">
              Review all feedback received from your supervisor
            </p>
          </div>

          {feedback && feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((f, i) => {
                const styles = getFeedbackTypeStyles(f.type);
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-5 transition-all hover:shadow-md ${styles.bg} ${styles.border}`}
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getFeedbackIcon(f.type)}
                        <h3 className="text-body-bold">
                          {f.title || "Feedback"}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-tiny text-left flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(f.createdAt)}
                        </span>
                        <span className="text-tiny text-left flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {f.supervisorName || "Supervisor"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                        <p className={`text-body ${styles.text}`}>
                          {f.message}
                        </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-tiny text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 font-bold">
                        Read
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <MessageCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                No feedback received yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Your supervisor's feedback will appear here once available
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;
