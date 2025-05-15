const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user');  // Assuming user data is in a simple file or database

const SECRET_KEY = 'your_secret_key';  // Should be an environment variable in production

// User Registration
async function registerUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashedPassword });
  return newUser;
}

// User Login
async function loginUser(username, password) {
  const user = await User.findByUsername(username);
  if (!user) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Incorrect password');
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  return token;
}

module.exports = {
  registerUser,
  loginUser
};
