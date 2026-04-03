const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const playlistsRoute = require('./routes/playlistsRoute');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('DB Error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/playlists', require('./routes/playlistsRoute'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
