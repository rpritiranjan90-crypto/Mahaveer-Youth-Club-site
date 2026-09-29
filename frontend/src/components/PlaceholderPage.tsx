import React from 'react';

interface PlaceholderPageProps {
  title: string;
  routePath: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, routePath }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md w-full p-6 rounded-lg border border-slate-800 bg-slate-900 shadow-lg">
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-semibold text-amber-400 bg-amber-950/50 border border-amber-800/60 rounded-full">
          Route: {routePath}
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-sm text-slate-400">
          Page foundation ready — Phase 3 implementation pending.
        </p>
      </div>
    </div>
  );
};
