import React from 'react';

const ScalingLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Data...</p>
    </div>
  );
};

export default ScalingLoader;
