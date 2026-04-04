const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Playlist = require('../models/playlists');

// GET /artists/featured
router.get('/featured', async (req, res) => {
  try {
    const artists = await User.find(
      { isFeatured: true },
      'username firstName lastName'
    ).limit(5);

    // For each artist, fetch their playlists
    const artistsWithPlaylists = await Promise.all(
      artists.map(async (artist) => {
        const playlists = await Playlist.find({ username: artist.username });
        return {
          _id: artist._id,
          username: artist.username,
          firstName: artist.firstName,
          lastName: artist.lastName,
          playlists,
        };
      })
    );

    res.json(artistsWithPlaylists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch featured artists.' });
  }
});

module.exports = router;
