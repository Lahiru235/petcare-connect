const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createPayment,
  verifySession,
  handleNotify,
  getPayments,
  getPaymentById,
  getPaymentByAppointment,
  getPaymentStats,
} = require("../controllers/paymentController");

const router = express.Router();

// Verify Stripe Checkout session
router.get("/verify-session/:sessionId", verifySession);

// Legacy server-to-server notification
router.post("/notify", express.urlencoded({ extended: false }), handleNotify);

// All routes below require authentication
router.use(protect);

// Create payment (owner, receptionist, admin)
router.post("/create", authorize("owner", "receptionist", "admin"), createPayment);

// List all payments (owner sees own, receptionist+admin see all)
router.get("/", authorize("owner", "receptionist", "admin"), getPayments);

// Payment stats (admin only)
router.get("/stats", authorize("admin"), getPaymentStats);

// Get payment by appointment ID
router.get("/by-appointment/:appointmentId", authorize("owner", "receptionist", "admin"), getPaymentByAppointment);

// Single payment detail
router.get("/:id", authorize("owner", "receptionist", "admin"), getPaymentById);

module.exports = router;
