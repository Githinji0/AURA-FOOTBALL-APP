'use client';

export const MatchCard = ({ match }) => {
  const { homeTeam, awayTeam, goals, date, status } = match;
  const isLive = ['1H', '2H', 'HT'].includes(status);

  return (
    <div className={`border rounded-lg p-4 ${isLive ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</span>
        {isLive && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            LIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Home Team */}
        <div className="text-center">
          <p className="font-semibold text-sm truncate">{homeTeam}</p>
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="text-2xl font-bold">
            {goals?.home ?? '-'} - {goals?.away ?? '-'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {status === 'FT' ? 'Final' : status === 'HT' ? 'HT' : 'vs'}
          </p>
        </div>

        {/* Away Team */}
        <div className="text-center">
          <p className="font-semibold text-sm truncate">{awayTeam}</p>
        </div>
      </div>
    </div>
  );
};
