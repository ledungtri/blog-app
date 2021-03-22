process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');

function register(email, password) {

  return request(app)
    .post('/api/users/register')
    .send({ email: email, password: password });
}

function login(email, password) {
  return request(app)
    .post('/api/users/login')
    .send({ email: email, password: password });
}

function remove(userId, authToken) {
  return request(app)
    .delete('/api/users/' + userId)
    .set("auth-token", authToken);
}

function createAndReturnAuth(email, password) {
  return register(email, password)
    .then(() => login(email, password))
    .then(res => res.body['auth-token']);
}

module.exports = { register, login, remove, createAndReturnAuth };