import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="mb-3 h-5 w-3/4 rounded bg-slate-200" />
          <div className="mb-2 h-3.5 w-full rounded bg-slate-100" />
          <div className="mb-4 h-3.5 w-5/6 rounded bg-slate-100" />
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};