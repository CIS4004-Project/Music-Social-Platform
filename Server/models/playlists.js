// models/playlists.js

const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String, // stores username
      required: true,
    },
    songs: [
        {
            id: { type: Number },
            title: { type: String },
            artist: { type: String },
            preview: { String },
            artwork: { type: String },
            _id: false
      },
    ],
  },
);

module.exports = mongoose.model('Playlist', PlaylistSchema);
