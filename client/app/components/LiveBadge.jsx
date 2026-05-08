'use client';

import { CheckCircle2, Clock3, RadioTower } from 'lucide-react';

export const LiveBadge = ({ status }) => {
  const isLive = ['1H', '2H', 'HT'].includes(status);
  const isFinished = status === 'FT';
  const isUpcoming = ['NS', 'TBD'].includes(status);

  if (isLive) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold animate-pulse">
        <RadioTower className="h-3 w-3" />
        LIVE
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
        <CheckCircle2 className="h-3 w-3" />
        FINISHED
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
        <Clock3 className="h-3 w-3" />
        UPCOMING
      </div>
    );
  }

  return null;
};
