const { validationResult } = require("express-validator");

// FR-16: input validation everywhere
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = validate;
