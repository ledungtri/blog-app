const router = require('express').Router();
const { verifySelf } = require('./auth');
const { validateUser } = require('../controllers/schemaValidator');
const UserController = require('../controllers/userController');

router.post("/register", validateUser, UserController.create);
router.post("/login", validateUser, UserController.login);
router.delete("/:id", verifySelf, UserController.remove);

module.exports = router;