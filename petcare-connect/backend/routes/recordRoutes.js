const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createRecord, getRecords, updateRecord } = require("../controllers/recordController");

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(getRecords)
  .post(
    authorize("doctor", "admin"),
    [
      body("appointment").notEmpty().withMessage("Select the visit"),
      body("diagnosis").trim().notEmpty().withMessage("Enter the diagnosis"),
      body("treatment").trim().notEmpty().withMessage("Enter the treatment"),
    ],
    validate,
    createRecord
  );

router.put("/:id", authorize("doctor", "admin"), updateRecord);

module.exports = router;
