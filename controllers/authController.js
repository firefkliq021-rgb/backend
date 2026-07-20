const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'password123', 10);
    res.json({ ok: true, passwordHash: hashedPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const token = jwt.sign({ email: req.body.email }, env.jwtSecret, { expiresIn: '1h' });
  res.json({ ok: true, token });
};
