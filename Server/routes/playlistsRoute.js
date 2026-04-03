// routes/playlistsRoute.js

const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlists');

// GET /playlists/:username — fetch all playlists for a user
router.get('/:username', async (req, res) => {
  try {
    const playlists = await Playlist.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch playlists.' });
  }
});

// POST /playlists — create a new playlist
router.post('/', async (req, res) => {
  const { name, username, songs } = req.body;

  if (!name || !username || !songs?.length) {
    return res.status(400).json({ message: 'Name, username, and at least one song are required.' });
  }

  try {
    const existing = await Playlist.findOne({ name, username });
        if (existing) {
        return res.status(409).json({ message: `You already have a playlist named "${name}".` });
        }
    
    const playlist = new Playlist({ name, username, songs });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save playlist.' });
  }
});

// DELETE /playlists/:id — delete a playlist by its MongoDB _id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id === 'undefined') {
    return res.status(400).json({ message: 'Invalid playlist ID.' });
  }

  try {
    await Playlist.findByIdAndDelete(id);
    res.json({ message: 'Playlist deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete playlist.' });
  }
});

module.exports = router;
