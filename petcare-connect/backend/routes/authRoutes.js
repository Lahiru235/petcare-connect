const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const {
  register, login, getMe, updateMe, forgotPassword, resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Enter your name"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password needs at least 6 characters"),
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
  [body("password").isLength({ min: 6 }).withMessage("Password needs at least 6 characters")],
  validate,
  resetPassword
);

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
