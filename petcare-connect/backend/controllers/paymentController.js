const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

const notify = (user, title, message, type) =>
  Notification.create({ user, title, message, type }).catch(() => {});

// ── POST /api/payments/create ─────────────────────────────────────────
// Creates a Stripe Checkout session for the appointment payment.
const createPayment = async (req, res, next) => {
  try {
    const { appointmentId, serviceName, items, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "appointmentId and amount are required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const itemName = serviceName || items || "Veterinary Consultation";
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: itemName,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: req.user?.email || undefined,
      client_reference_id: appointment._id.toString(),
      metadata: {
        appointmentId: appointment._id.toString(),
        serviceName: itemName,
      },
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment-cancel`,
    });

    // Create or update pending payment record in database
    const order_id = `PCC-${appointment._id.toString().slice(-8)}-${Date.now()}`;
    await Payment.findOneAndUpdate(
      { appointment: appointment._id },
      {
        appointment: appointment._id,
        owner: req.user._id,
        orderId: order_id,
        stripeSessionId: session.id,
        amount: Number(amount),
        currency: "LKR",
        items: itemName,
        customerFirstName: req.user?.name ? req.user.name.split(" ")[0] : "",
        customerLastName: req.user?.name ? req.user.name.split(" ").slice(1).join(" ") : "",
        customerEmail: req.user?.email || "",
        customerPhone: req.user?.phone || "",
        status: "pending",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/verify-session/:sessionId ──────────────────────
const verifySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.payment_status === "paid") {
      const payment = await Payment.findOne({
        $or: [
          { stripeSessionId: sessionId },
          { appointment: session.client_reference_id },
          { appointment: session.metadata?.appointmentId },
        ],
      });

      if (payment && payment.status !== "success") {
        payment.status = "success";
        payment.stripeSessionId = sessionId;
        payment.paidAt = new Date();
        payment.method = "Card";
        await payment.save();

        notify(
          payment.owner,
          "Payment received",
          `Your payment of LKR ${payment.amount} was successful.`,
          "payment"
        );
      }
    }

    res.json({ status: session.payment_status, session });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payments/notify  (PayHere server-to-server callback) ────
// PayHere sends this as application/x-www-form-urlencoded
const handleNotify = async (req, res, next) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
      method,
      card_holder_name,
      card_no,
      status_message,
    } = req.body;

    // Verify the integrity hash
    const merchant_secret = (process.env.PAYHERE_MERCHANT_SECRET || "").trim();
    const merchantSecretHash = crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase();
    const localSig = crypto.createHash("md5").update(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      merchantSecretHash
    ).digest("hex").toUpperCase();

    if (localSig !== md5sig?.toUpperCase()) {
      console.error("[PayHere Notify] Invalid md5sig – possible tampering", { order_id });
      return res.status(400).send("Invalid signature");
    }

    // Find the payment record
    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      console.error("[PayHere Notify] No payment found for order_id:", order_id);
      return res.status(404).send("Order not found");
    }

    // Map PayHere status_code to our enum
    const statusMap = {
      "2": "success",       // payment received
      "0": "pending",       // started but not completed
      "-1": "cancelled",    // cancelled by buyer
      "-2": "failed",       // failed / declined
      "-3": "charged_back", // chargeback
    };

    payment.status = statusMap[status_code] || "failed";
    payment.payherePaymentId = payment_id || "";
    payment.method = method || "";
    payment.cardHolderName = card_holder_name || "";
    payment.cardNo = card_no || "";
    payment.statusMessage = status_message || "";
    if (status_code === "2") payment.paidAt = new Date();

    await payment.save();

    // If the payment is successful, notify the owner
    if (status_code === "2") {
      notify(
        payment.owner,
        "Payment received",
        `Your payment of ${payhere_currency} ${payhere_amount} for order ${order_id} was successful.`,
        "payment"
      );
    }

    console.log(`[PayHere Notify] Order ${order_id} → status ${payment.status}`);
    res.status(200).send("OK");
  } catch (err) {
    console.error("[PayHere Notify] Error:", err);
    next(err);
  }
};

// ── GET /api/payments  (list payments scoped by role) ─────────────────
const getPayments = async (req, res, next) => {
  try {
    const filter = {};
    // Owners only see their own payments
    if (req.user.role === "owner") filter.owner = req.user._id;

    if (req.query.status) filter.status = req.query.status;
    if (req.query.from && req.query.to) {
      filter.createdAt = { $gte: new Date(req.query.from), $lte: new Date(req.query.to + "T23:59:59") };
    }

    const payments = await Payment.find(filter)
      .populate({ path: "appointment", select: "date startTime endTime reason status", populate: [
        { path: "pet", select: "name species" },
        { path: "doctor", select: "name specialisation" },
      ]})
      .populate("owner", "name email phone")
      .sort("-createdAt");

    res.json({ count: payments.length, payments });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/:id  (single payment detail) ───────────────────
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: "appointment", select: "date startTime endTime reason status", populate: [
        { path: "pet", select: "name species breed" },
        { path: "doctor", select: "name specialisation" },
        { path: "owner", select: "name email phone address" },
      ]})
      .populate("owner", "name email phone");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Owners can only view their own
    if (req.user.role === "owner" && String(payment.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not have access to this payment" });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/by-appointment/:appointmentId ──────────────────
const getPaymentByAppointment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ appointment: req.params.appointmentId })
      .populate({ path: "appointment", select: "date startTime endTime reason status", populate: [
        { path: "pet", select: "name species" },
        { path: "doctor", select: "name specialisation" },
      ]})
      .populate("owner", "name email phone");

    if (!payment) return res.status(404).json({ message: "No payment for this appointment" });

    if (req.user.role === "owner" && String(payment.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not have access to this payment" });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/stats  (admin dashboard stats) ─────────────────
const getPaymentStats = async (req, res, next) => {
  try {
    const [total, success, pending, failed, cancelled] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: "success" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "failed" }),
      Payment.countDocuments({ status: "cancelled" }),
    ]);

    // Total revenue (only successful payments)
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const revenueByDay = await Payment.aggregate([
      { $match: { status: "success", paidAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: { total, success, pending, failed, cancelled, totalRevenue },
      revenueByDay: revenueByDay.map((d) => ({ date: d._id, total: d.total, count: d.count })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  verifySession,
  handleNotify,
  getPayments,
  getPaymentById,
  getPaymentByAppointment,
  getPaymentStats,
};
