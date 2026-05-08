'use client';

export const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No standings data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Team</th>
            <th className="px-4 py-3 text-center font-semibold">P</th>
            <th className="px-4 py-3 text-center font-semibold">W</th>
            <th className="px-4 py-3 text-center font-semibold">D</th>
            <th className="px-4 py-3 text-center font-semibold">L</th>
            <th className="px-4 py-3 text-center font-semibold">GF</th>
            <th className="px-4 py-3 text-center font-semibold">GA</th>
            <th className="px-4 py-3 text-center font-semibold">GD</th>
            <th className="px-4 py-3 text-center font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr
              key={team.team?.id || index}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 font-semibold text-gray-600">{team.rank}</td>
              <td className="px-4 py-3 font-medium">{team.team?.name}</td>
              <td className="px-4 py-3 text-center">{team.all?.played}</td>
              <td className="px-4 py-3 text-center text-green-600">{team.all?.win}</td>
              <td className="px-4 py-3 text-center text-yellow-600">{team.all?.draw}</td>
              <td className="px-4 py-3 text-center text-red-600">{team.all?.lose}</td>
              <td className="px-4 py-3 text-center">{team.all?.goals?.for}</td>
              <td className="px-4 py-3 text-center">{team.all?.goals?.against}</td>
              <td className="px-4 py-3 text-center font-semibold">
                {(team.all?.goals?.for || 0) - (team.all?.goals?.against || 0)}
              </td>
              <td className="px-4 py-3 text-center font-bold text-blue-600">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
