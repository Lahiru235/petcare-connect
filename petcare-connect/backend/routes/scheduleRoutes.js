const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createSchedule, getSchedules, updateSchedule, deleteSchedule, getAvailability, getVets,
} = require("../controllers/scheduleController");

const router = express.Router();
router.use(protect);

router.get("/vets", getVets);
router.get("/availability", getAvailability);

router
  .route("/")
  .get(getSchedules)
  .post(authorize("admin", "receptionist", "doctor"), createSchedule);

router
  .route("/:id")
  .put(authorize("admin", "receptionist", "doctor"), updateSchedule)
  .delete(authorize("admin", "receptionist", "doctor"), deleteSchedule);

module.exports = router;
