import { Loader2 } from "lucide-react";

const LoadingState = ({ label = "Loading..." }) => {
  return (
    <div className="card flex items-center justify-center gap-3 py-10">
      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
};

export default LoadingState;
