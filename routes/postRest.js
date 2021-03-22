const router = require('express').Router();
const { verifyOwner, verifyLoggedIn } = require('./auth');
const { validatePost } = require('../controllers/SchemaValidator');
const PostController = require('../controllers/PostController');

router.route('/')
  .get(PostController.find)
  .post(verifyLoggedIn, validatePost, PostController.create);

router.route("/:id")
  .get(PostController.get)
  .put(verifyOwner, validatePost, PostController.update)
  .delete(verifyOwner, PostController.remove);

/** Load post when API with id route parameter is hit */
router.param('id', PostController.load);

module.exports = router;