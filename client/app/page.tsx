'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, LoaderCircle, RadioTower, Trophy } from 'lucide-react';
import { MatchCard } from './components/MatchCard';
import { LeagueTabs } from './components/LeagueTabs.jsx';
import { fetchFixtures, fetchStandings } from './lib/api';
import { onLiveMatchUpdate, subscribeLiveMatches } from './lib/socket';
import Link from 'next/link';

type League = {
  leagueId: number;
  season: number;
  name: string;
  logo: string;
};

type Fixture = {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  status: string;
  date: string;
  goals?: {
    home: number | null;
    away: number | null;
  };
};

type Standing = {
  team?: {
    id?: number;
    name?: string;
  };
  rank?: number;
  points?: number;
  all?: {
    played?: number;
    win?: number;
    draw?: number;
    lose?: number;
    goals?: {
      for?: number;
      against?: number;
    };
  };
};

const LEAGUES: League[] = [
  { leagueId: 39, season: 2025, name: 'Premier League', logo: '/epl.png' },
  { leagueId: 2, season: 2025, name: 'Champions League', logo: '/ucl.png' },
  { leagueId: 1, season: 2026, name: 'World Cup', logo: '/fwc.png' },
  { leagueId: 45, season: 2025, name: 'FA Cup', logo: '/fa.png' },
];

export default function Dashboard() {
  const [activeLeague, setActiveLeague] = useState<League>(LEAGUES[0]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);

  const {
    data: fixturesData,
    isLoading: fixturesLoading,
    error: fixturesError,
  } = useQuery({
    queryKey: ['fixtures', activeLeague.leagueId, activeLeague.season],
    queryFn: () => fetchFixtures(activeLeague.leagueId, activeLeague.season),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: standingsData,
    isLoading: standingsLoading,
    error: standingsError,
  } = useQuery({
    queryKey: ['standings', activeLeague.leagueId, activeLeague.season],
    queryFn: () => fetchStandings(activeLeague.leagueId, activeLeague.season),
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (fixturesData) {
      setFixtures(Array.isArray(fixturesData) ? fixturesData : []);
    }
  }, [fixturesData]);

  useEffect(() => {
    if (standingsData) {
      setStandings(Array.isArray(standingsData) ? standingsData : []);
    }
  }, [standingsData]);

  useEffect(() => {
    subscribeLiveMatches(activeLeague.leagueId, activeLeague.season);

    const unsubscribe = onLiveMatchUpdate((updatedMatch: Fixture) => {
      setFixtures((prev) =>
        prev.map((match) =>
          match.fixtureId === updatedMatch.fixtureId ? updatedMatch : match
        )
      );
    });

    return unsubscribe;
  }, [activeLeague]);

  const liveMatches = fixtures.filter((match) =>
    ['1H', '2H', 'HT'].includes(match.status)
  );
  const finishedMatches = fixtures.filter((match) => match.status === 'FT');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                <Trophy className="h-8 w-8 text-blue-600" />
                AURA Football
              </h1>
              <p className="text-gray-600">Live Fixtures & Standings</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                <RadioTower className="h-3 w-3" />
                Real-time Enabled
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <LeagueTabs
            leagues={LEAGUES}
            activeLeague={activeLeague}
            onLeagueChange={(leagueId: number, season: number) => {
              const nextLeague = LEAGUES.find((league) => league.leagueId === leagueId && league.season === season);

              if (nextLeague) {
                setActiveLeague(nextLeague);
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {liveMatches.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold">Live Now</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    {liveMatches.length}
                  </span>
                </div>
                <div className="grid gap-4">
                  {liveMatches.map((match) => (
                    <MatchCard key={match.fixtureId} match={match} />
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">
                Recent Results ({finishedMatches.length})
              </h2>
              {finishedMatches.length > 0 ? (
                <div className="grid gap-4">
                  {finishedMatches.slice(0, 5).map((match) => (
                    <MatchCard key={match.fixtureId} match={match} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No finished matches yet</p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Fixtures</span>
                  <span className="font-bold text-lg">{fixtures.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Live Matches</span>
                  <span className="font-bold text-lg text-red-600">{liveMatches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Finished</span>
                  <span className="font-bold text-lg">{finishedMatches.length}</span>
                </div>
              </div>
            </div>

            {(fixturesLoading || standingsLoading) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="flex items-center gap-2 text-blue-700 text-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Fetching latest data...
                </p>
              </div>
            )}

            {(fixturesError || standingsError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Error loading data
                </p>
              </div>
            )}

            <Link
              href={`/league/${activeLeague.leagueId}`}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Full Standings
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}