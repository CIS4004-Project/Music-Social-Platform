const express = require('express');
const router = express.Router();
const User = require('../models/User');

function isAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  if (!req.session.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
}

router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', isAdmin, async (req, res) => {
  const { firstName, lastName, email, username } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, username },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated!', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;