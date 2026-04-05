import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "No data found",
  description = "Try changing filters or adding new data.",
}) => {
  return (
    <div className="card text-center py-10">
      <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
  );
};

export default EmptyState;
