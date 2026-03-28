import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle, User, Calendar, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector((state) => state.student);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

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
    <div className="mx-auto max-w-[1600px] space-y-8 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-purple-50 via-white to-pink-50/60 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-purple-950/40 dark:shadow-none">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-pink-400/10 blur-3xl dark:bg-pink-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Communication
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Supervisor Feedback
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                View feedback and comments from your supervisor. Use this input to improve your project.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                {project?.title || "No Project"}
              </span>
            </div>
          </div>
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
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.title}
                    </p>
                    <p className={`text-2xl font-bold ${item.valueColor}`}>
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Feedback
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                          {f.title || "Feedback"}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(f.createdAt)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {f.supervisorName || "Supervisor"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className={`text-sm leading-relaxed ${styles.text}`}>
                        {f.message}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
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