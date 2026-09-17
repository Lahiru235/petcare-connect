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
      body("password").isLength({ min: 6 }).withMessage("Password needs at least 6 characters"),
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
