'use client';

import Image from 'next/image';

export const LeagueTabs = ({ leagues, activeLeague, onLeagueChange }) => {
  const leagueInfo = {
    39: { name: 'Premier League', logo: '/epl.png' },
    2: { name: 'Champions League', logo: '/ucl.png' },
    1: { name: 'World Cup', logo: '/fwc.png' },
    45: { name: 'FA Cup', logo: '/fa.png' },
  };

  return (
    <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-0">
      {leagues.map(({ leagueId, season }) => (
        <button
          key={`${leagueId}-${season}`}
          onClick={() => onLeagueChange(leagueId, season)}
          className={`inline-flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
            activeLeague?.leagueId === leagueId
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Image
            src={leagueInfo[leagueId]?.logo || '/globe.svg'}
            alt={`${leagueInfo[leagueId]?.name || 'League'} logo`}
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 object-contain"
          />
          {leagueInfo[leagueId]?.name} {season}
        </button>
      ))}
    </div>
  );
};