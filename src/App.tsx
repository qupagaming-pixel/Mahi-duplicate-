import React from 'react';
import { usePageTracking } from './utils/analytics';

// Lazy load the full audio/AI companion engine to keep initial bundle tiny and fast
const MahiCompanion = React.lazy(() => 
  import('./components/MahiCompanion').then(m => ({ default: m.MahiCompanion }))
);

export default function App() {
  usePageTracking();

  return (
    <React.Suspense
      fallback={
        <div className="fixed inset-0 bg-[#06000d] flex flex-col items-center justify-center text-white z-[200]">
          <div className="relative flex flex-col items-center gap-4">
            <img 
              src="/mahi-avatar-sm.webp" 
              alt="Mahi AI"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-2 border-purple-500/50 animate-pulse"
            />
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono tracking-wider text-purple-200">STARTING MAHI...</span>
            </div>
          </div>
        </div>
      }
    >
      <MahiCompanion />
    </React.Suspense>
  );
}
