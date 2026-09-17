const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createPet, getPets, getPetById, updatePet, deactivatePet } = require("../controllers/petController");

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(getPets)
  .post(
    authorize("owner", "receptionist", "admin"),
    [
      body("name").trim().notEmpty().withMessage("Enter the pet's name"),
      body("species").trim().notEmpty().withMessage("Enter the species"),
      body("age").optional().isFloat({ min: 0 }).withMessage("Age cannot be negative"),
    ],
    validate,
    createPet
  );

router
  .route("/:id")
  .get(getPetById)
  .put(authorize("owner", "receptionist", "admin"), updatePet)
  .delete(authorize("owner", "admin"), deactivatePet);

module.exports = router;
