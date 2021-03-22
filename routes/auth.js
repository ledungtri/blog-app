const jwt = require('jsonwebtoken');

function verifySelf(req, res, next) {
  verifyLoggedIn(req, res, () => {
    if (req.user._id !== req.params.id)
      return res.status(401).send('Access Denied.');
    next();
  });
}

function verifyOwner(req, res, next) {
  verifyLoggedIn(req, res, () => {
    if (req.user._id !== req.post.userId)
      return res.status(401).send('Access Denied.');
    next();
  });
}

function verifyLoggedIn(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied.');
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send('Access Denied.');
  }
}

module.exports = { verifySelf, verifyOwner, verifyLoggedIn };