import express from 'express';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';

dotenv.config();

const app = express();

// Middleware (add more as needed)
app.use(express.json());

// Basic route to test server
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
connectDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
