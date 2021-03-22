const jwt = require('jsonwebtoken');
const User = require('../models/User');

function create(req, res) {
  User.findOne({ email: req.body.email })
    .then(emailExist => {
      if (emailExist) return res.status(400).send("Email already exists.");

      User.create(req.body)
        .then(savedUser => res.send(savedUser))
        .catch(error => res.status(500).send(error));
    });
}

function login(req, res) {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) return res.status(400).send("Email doesn't exist.");

      user.comparePassword(req.body.password, (e, isMatch) => {
        if (isMatch) {
          const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
          res.send({ "auth-token": token });
        } else {
          return res.status(400).send("Password doesn't match.");
        }
      });
    });
}

function remove(req, res) {
  User.deleteOne({ _id: req.params.id })
    .then(() => res.send("User deleted successfully"))
    .catch(error => res.status(500).send(error));
}

module.exports = { create, login, remove };