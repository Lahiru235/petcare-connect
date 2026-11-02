const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const {
  register, login, getMe, updateMe, forgotPassword, resetPassword,
} = require("../controllers/authController");

const router = express.Router();

const passwordRules = body("password")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
  .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/).withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/).withMessage("Password must contain at least one special character (!@#$%^&*)");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Enter your name"),
    body("email").isEmail().withMessage("Enter a valid email"),
    passwordRules,
  ],
  validate,
  register
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Enter a valid email"), body("password").notEmpty().withMessage("Enter your password")],
  validate,
  login
);

router.post("/forgot-password", [body("email").isEmail().withMessage("Enter a valid email")], validate, forgotPassword);
router.post(
  "/reset-password/:token",
  [passwordRules],
  validate,
  resetPassword
);

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
