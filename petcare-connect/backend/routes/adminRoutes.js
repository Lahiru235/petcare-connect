const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createUser, getUsers, updateUser, toggleUserStatus, getStats, getReports } = require("../controllers/adminController");

const router = express.Router();
router.use(protect, authorize("admin"));

router
  .route("/users")
  .get(getUsers)
  .post(
    [
      body("name").trim().notEmpty().withMessage("Enter a name"),
      body("email").isEmail().withMessage("Enter a valid email"),
      body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/).withMessage("Password must contain at least one special character (!@#$%^&*)"),
      body("role").notEmpty().withMessage("Choose a role"),
    ],
    validate,
    createUser
  );

router.put("/users/:id", updateUser);
router.patch("/users/:id/status", toggleUserStatus);
router.get("/stats", getStats);
router.get("/reports", getReports);

module.exports = router;
