const Joi = require('@hapi/joi');

function validateUser(req, res, next) {
  let schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
  });
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);
  next();
}

function validatePost(req, res, next) {
  let schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required()
  });
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);
  next();
}

module.exports = { validateUser, validatePost };
