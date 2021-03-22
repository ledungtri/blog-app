const Post = require('../models/Post');
var ObjectId = require('mongoose').Types.ObjectId;

function load(req, res, next, id) {
  if (!ObjectId.isValid(id))
    return res.status(400).send("Invalid id.");

  Post.findById(id)
    .then((post) => {
      if (!post) {
        return res.status(404).send("Post not found");
      }
      req.post = post;
      return next();
    }, (e) => next(e));
}

function create(req, res) {
  Post.create({
    title: req.body.title,
    body: req.body.body,
    userId: req.user._id
  })
    .then(savedPost => res.send(savedPost))
}

function find(req, res) {
  const query = buildQuery(req);
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const offset = (page - 1) * size;

  Post.find(query).limit(size).skip(offset).sort({ title: 'asc' })
    .then(posts => res.send(posts))
    .catch(error => res.status(500).send(error));
}

function get(req, res) {
  res.send(req.post);
}

function update(req, res) {
  req.post.set({ title: req.body.title, body: req.body.body });
  req.post.save()
    .then(savedPost => res.send(savedPost))
    .catch(error => res.status(500).send(error));
}

function remove(req, res) {
  req.post.remove()
    .then(() => res.send("Post deleted successfully"))
    .catch(error => res.status(500).send(error));
}

function buildQuery(req) {
  const keyword = req.query.keyword;
  return (keyword) ? { $or: [{ title: { $regex: keyword } }, { body: { $regex: keyword } }] } : {};
}

module.exports = { load, create, get, find, update, remove };