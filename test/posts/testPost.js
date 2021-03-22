process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');

function create(title, body, authToken) {
  return request(app)
    .post('/api/posts')
    .send({ title: title, body: body })
    .set("auth-token", authToken)
}

function find(query) {
  return request(app).get('/api/posts/').query(query)
}

function get(id) {
  return request(app).get('/api/posts/' + id)
}

function update(id, title, body, authToken) {
  return request(app)
    .put('/api/posts/' + id)
    .send({ title: title, body: body })
    .set("auth-token", authToken);
}

function remove(id, authToken) {
  return request(app)
    .delete('/api/posts/' + id)
    .set("auth-token", authToken);
}

module.exports = { create, find, get, update, remove };