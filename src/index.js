import express from 'express'
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Server is up and running 🚀",
  });
});

app.use('/matches',matchRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
