const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  songs: [
    {
      trackId: String,
      title: String,
      artist: String,
      album: String,
      duration: Number,
      image: String,
      previewUrl: String,
      dateAdded: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
