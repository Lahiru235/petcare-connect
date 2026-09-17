const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createAppointment, getAppointments, getAppointmentById,
  rescheduleAppointment, cancelAppointment, updateStatus,
} = require("../controllers/appointmentController");

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(getAppointments)
  .post(
    authorize("owner", "receptionist", "admin"),
    [
      body("pet").notEmpty().withMessage("Choose a pet"),
      body("doctor").notEmpty().withMessage("Choose a veterinarian"),
      body("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Choose a date"),
      body("startTime").matches(/^\d{2}:\d{2}$/).withMessage("Choose a time slot"),
    ],
    validate,
    createAppointment
  );

router.route("/:id").get(getAppointmentById).put(authorize("owner", "receptionist", "admin"), rescheduleAppointment);
router.patch("/:id/cancel", authorize("owner", "receptionist", "admin"), cancelAppointment);
router.patch("/:id/status", authorize("doctor", "receptionist", "admin"), updateStatus);

module.exports = router;
