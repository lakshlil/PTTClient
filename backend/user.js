const users = [];  // In-memory storage for demo purposes. Replace with DB in production

async function create(userData) {
  const user = { id: users.length + 1, ...userData };
  users.push(user);
  return user;
}

async function findByUsername(username) {
  return users.find(user => user.username === username);
}

module.exports = { create, findByUsername };
    