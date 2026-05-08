import io from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  
  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners
export const onLiveMatchUpdate = (callback) => {
  const socket = getSocket();
  socket.on('match:update', callback);
};

export const onLeagueStandingsUpdate = (callback) => {
  const socket = getSocket();
  socket.on('standings:update', callback);
};

export const onFixturesUpdate = (callback) => {
  const socket = getSocket();
  socket.on('fixtures:update', callback);
};

// Event emitters
export const subscribeLiveMatches = (leagueId, season) => {
  const socket = getSocket();
  socket.emit('subscribe:live', { leagueId, season });
};

export const subscribeStandings = (leagueId, season) => {
  const socket = getSocket();
  socket.emit('subscribe:standings', { leagueId, season });
};

export const subscribeFixtures = (leagueId, season) => {
  const socket = getSocket();
  socket.emit('subscribe:fixtures', { leagueId, season });
};
