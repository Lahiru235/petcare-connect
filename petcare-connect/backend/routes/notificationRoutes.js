const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getNotifications, markRead, markAllRead, runReminders } = require("../controllers/notificationController");

const router = express.Router();
router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.post("/run-reminders", authorize("admin"), runReminders);

module.exports = router;
