const http = require('http');
const WebSocket = require('ws');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

const game = require('./game.js');
const redisUtil = require('./utils/redis.js');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// const gameObjects = {} (redis)

function connectClient(ws) {
  const payload = {
    event: 'connected',
  };
  ws.send(JSON.stringify(payload));
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  console.log('client connected');
  connectClient(ws);
  // Closing connection
  ws.on('close', () => console.log('Closed connection with client'));
  // Checking if connection is alive
  ws.on('pong', () => {
    // console.log('pong');
    ws.isAlive = true;
  });
  // Receiving message from client
  let currentGame;
  let gameList;
  ws.on('message', (event) => {
    const response = JSON.parse(event);
    console.log('Message from server ', response);
    switch (response.requestType) {
      case 'createGame':
        // validation
        currentGame = game.initializeGame(
          response.info.goal,
          response.info.name
        );
        currentGame.handleJoin(ws, true);
        redisUtil.addGame(currentGame);
        break;

      case 'joinGame':
        // validation
        currentGame = redisUtil.getGame(response.gameId);
        currentGame.handleJoin(ws, false);
        redisUtil.updateGame(currentGame);
        break;

      case 'startGame':
        try {
          currentGame = redisUtil.getGame(response.gameId);
          currentGame.handleStart(response.playerId, redisUtil);
          ws.send(
            JSON.stringify({
              event: 'gameStarted',
              status: '200',
            })
          );
          redisUtil.updateGame(currentGame);
        } catch (error) {
          console.error('Error', error.message);
          ws.send(
            JSON.stringify({
              event: 'gameStarted',
              status: '400',
              message: error.message,
            })
          );
        }

        break;

      case 'playCard':
        try {
          currentGame = redisUtil.getGame(response.gameId);
          currentGame.handleSelect(response.playerId, response.cardId);
          ws.send(
            JSON.stringify({
              event: 'playCard',
              status: '200',
            })
          );
          redisUtil.updateGame(currentGame);
        } catch (error) {
          console.log(error);
          ws.send(JSON.stringify({ error: error.message }));
        }
        break;

      case 'pickCard':
        try {
          currentGame = redisUtil.getGame(response.gameId);
          currentGame.handlePickWinningCard(response.playerId, response.cardId);
          ws.send(
            JSON.stringify({
              event: 'pickCard',
              status: '200',
            })
          );
          redisUtil.updateGame(currentGame);
        } catch (error) {
          console.log(error);
          ws.send(JSON.stringify({ error: error.message }));
        }
        break;

      case 'leave':
        currentGame = redisUtil.getGame(response.gameId);
        currentGame.handleLeave(ws, response.playerId);

        redisUtil.updateGame(currentGame);
        break;

      case 'getGameList':
        console.log('games in redis', redisUtil.getAllGames());
        gameList = Object.entries(redisUtil.getAllGames()).map(
          ([gid, obj]) => ({
            gameId: gid,
            name: obj.name,
            goal: obj.goal,
            maxPlayers: obj.maxPlayers,
            numberOfPlayer: obj.players.size,
            players: obj.playersToList(),
          })
        );
        ws.send(
          JSON.stringify({
            event: 'getGameList',
            status: '200',
            gameList,
          })
        );
        break;

      default:
        console.log('Invalid method', response.requestType);
    }
  });
});

// Ping clients every 10 seconds
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    // console.log('ping');
    ws.isAlive = false;
    ws.ping(null, false, true);
  });
}, 10000);

// const port = process.env.PORT || 8080;
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
