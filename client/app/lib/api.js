import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error(`❌ API Error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Fixtures API
export const fetchFixtures = async (leagueId, season) => {
  return apiClient.get(`/fixtures/${leagueId}/${season}`);
};

export const fetchStandings = async (leagueId, season) => {
  return apiClient.get(`/fixtures/standings/${leagueId}/${season}`);
};

// Batch fetch multiple leagues
export const fetchAllLeaguesData = async (leagues) => {
  const promises = leagues.map(({ leagueId, season }) =>
    Promise.all([
      fetchFixtures(leagueId, season),
      fetchStandings(leagueId, season),
    ])
  );

  return Promise.all(promises);
};

export default apiClient;
