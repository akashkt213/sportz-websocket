import express from 'express'
import { matchRouter } from './routes/matches.js';
import http from 'http'
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arckjet.js';

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0'

const app = express();
const server = http.createServer(app)

// JSON middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Server is up and running 🚀",
  });
});

app.use(securityMiddleware())

app.use('/matches',matchRouter)

const {broadcastMatchCreated} = attachWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated;  //app.locals is express's global object accessible from any request.

// Start server
server.listen(PORT,HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running  on ${baseUrl.replace('http','ws')}/ws`);
});
