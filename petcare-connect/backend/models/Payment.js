const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "LKR" },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "cancelled", "charged_back"],
      default: "pending",
    },
    method: { type: String, default: "" }, // e.g. VISA, MASTER, AMEX, Card…
    payherePaymentId: { type: String, default: "" },
    stripeSessionId: { type: String, default: "" },
    cardHolderName: { type: String, default: "" },
    cardNo: { type: String, default: "" }, // masked last-4 digits
    statusMessage: { type: String, default: "" },
    items: { type: String, default: "" },
    customerFirstName: { type: String, default: "" },
    customerLastName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ appointment: 1 });
paymentSchema.index({ owner: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
