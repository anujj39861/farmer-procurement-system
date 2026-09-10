import React from 'react';
import { CheckCircle2, Clock, Scale, ShieldCheck, QrCode, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'waiting', label: 'Token Issued', icon: Clock },
  { key: 'in_quality', label: 'Quality Testing', icon: ShieldCheck },
  { key: 'in_weighing', label: 'Scale Weighing', icon: Scale },
  { key: 'in_procurement', label: 'Confirmation', icon: CheckCircle2 },
  { key: 'completed', label: 'Lot & QR Issued', icon: QrCode },
];

export default function StatusTimeline({ currentStatus }) {
  const getStageIndex = (status) => {
    switch (status) {
      case 'waiting': return 0;
      case 'in_quality': return 1;
      case 'in_weighing': return 2;
      case 'in_procurement': return 3;
      case 'completed': return 4;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  if (currentStatus === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Procurement Transaction Rejected</h4>
          <p className="text-xs text-red-600">The crop lot did not satisfy moisture or foreign matter quality specs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {/* Progress Line Overlay */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%` }}
        ></div>

        {STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stg.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center ${
                  isCurrent
                    ? 'text-amber-700 font-bold'
                    : isDone
                    ? 'text-emerald-800'
                    : 'text-gray-400'
                }`}
              >
                {stg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
