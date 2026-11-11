import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  enabled,
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="py-6 px-4 flex items-center justify-center min-h-[calc(100vh-64px)] bg-slate-900/30">
      <div className="relative w-full max-w-[400px] h-[820px] bg-slate-950 rounded-[50px] p-3.5 shadow-2xl ring-1 ring-slate-800 border-[7px] border-slate-850 flex flex-col overflow-hidden">
        {/* iOS Dynamic Island & Status Bar */}
        <div className="relative z-20 pt-2 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold text-white select-none shrink-0">
          <span>{currentTime}</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-900 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto rounded-[36px] bg-slate-950 pb-16 relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center py-1 z-30 pointer-events-none">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
