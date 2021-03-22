const User = require('../../models/User');
const Post = require('../../models/Post');
const dotenv = require('dotenv');
const fs = require('fs');
const conn = require('../db');

dotenv.config();

let rawdata = fs.readFileSync('./db/migrations/MOCK_DATA.json');
let posts = JSON.parse(rawdata);

conn.connect().then(() => {
  User.create({ email: "admin@email.com", password: "123123" })
    .then(createPosts)
    .then(() => {
      console.log('Done');
      process.exit(1);
    });
});

function createPosts(user) {
  const reqs = posts.map(post => {
    console.log(JSON.stringify(post));
    return Post.create({ title: post.title, body: post.body, userId: user._id });
  });
  return Promise.all(reqs);
}
