'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, LoaderCircle, RadioTower, Trophy } from 'lucide-react';
import { StandingsTable } from '../../components/StandingsTable';
import { fetchStandings, fetchFixtures } from '../../lib/api';
import { onLeagueStandingsUpdate, subscribeStandings } from '../../lib/socket';

const LEAGUE_INFO = {
  39: { name: 'Premier League', season: 2025, logo: '/epl.png' },
  2: { name: 'Champions League', season: 2025, logo: '/ucl.png' },
  1: { name: 'World Cup', season: 2026, logo: '/fwc.png' },
  45: { name: 'FA Cup', season: 2025, logo: '/fa.png' },
};

export default function LeaguePage() {
  const params = useParams();
  const leagueId = Number(params?.id);
  const season = LEAGUE_INFO[leagueId]?.season || 2025;

  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  // Fetch standings
  const {
    data: standingsData,
    isLoading: standingsLoading,
    error: standingsError,
  } = useQuery({
    queryKey: ['standings', leagueId, season],
    queryFn: () => fetchStandings(leagueId, season),
    enabled: !!leagueId,
  });

  // Fetch fixtures for context
  const {
    data: fixturesData,
    isLoading: fixturesLoading,
  } = useQuery({
    queryKey: ['fixtures', leagueId, season],
    queryFn: () => fetchFixtures(leagueId, season),
    enabled: !!leagueId,
  });

  useEffect(() => {
    if (standingsData) {
      setStandings(Array.isArray(standingsData) ? standingsData : []);
    }
  }, [standingsData]);

  useEffect(() => {
    if (fixturesData) {
      setFixtures(Array.isArray(fixturesData) ? fixturesData : []);
    }
  }, [fixturesData]);

  // Subscribe to real-time standings updates
  useEffect(() => {
    if (!leagueId) return;

    subscribeStandings(leagueId, season);

    const unsubscribe = onLeagueStandingsUpdate((updatedStandings) => {
      setStandings(updatedStandings);
    });

    return unsubscribe;
  }, [leagueId, season]);

  const leagueInfo = LEAGUE_INFO[leagueId];

  if (!leagueInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">League not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src={leagueInfo.logo}
              alt={`${leagueInfo.name} logo`}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{leagueInfo.name}</h1>
              <p className="text-gray-600">Season {leagueInfo.season}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Standings Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Standings</h2>
                {standingsLoading && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>

              {standingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Error loading standings
                  </p>
                </div>
              )}

              {standings.length > 0 ? (
                <StandingsTable standings={standings} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {standingsLoading ? 'Loading standings...' : 'No standings data available'}
                </div>
              )}
            </div>

            {/* Upcoming Matches */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
                <RadioTower className="h-5 w-5 text-blue-600" />
                Upcoming Matches
              </h2>
              {fixturesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading matches...</div>
              ) : (
                <div className="space-y-2">
                  {fixtures
                    .filter((m) => ['NS', 'TBD'].includes(m.status))
                    .slice(0, 5)
                    .map((match) => (
                      <div key={match.fixtureId} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {match.homeTeam} vs {match.awayTeam}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(match.date).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
                            UPCOMING
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* League Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4 text-lg">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Teams</p>
                  <p className="text-2xl font-bold">{standings.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Fixtures</p>
                  <p className="text-2xl font-bold">{fixtures.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Live Matches</p>
                  <p className="text-2xl font-bold text-red-600">
                    {fixtures.filter((m) => ['1H', '2H', 'HT'].includes(m.status)).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Team */}
            {standings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="flex items-center gap-2 font-bold mb-4 text-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Leader
                </h3>
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <p className="text-sm text-gray-600">First Place</p>
                  <p className="text-xl font-bold text-yellow-700">{standings[0].team?.name}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {standings[0].points} pts • {standings[0].all?.played} matches
                  </p>
                </div>
              </div>
            )}

            {/* Real-time Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <p className="font-semibold text-blue-900">Real-time Updates</p>
              </div>
              <p className="text-sm text-blue-700">Live standings synchronized</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}