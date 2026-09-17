const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm (24h)
    endTime: { type: String, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-Show"],
      default: "Scheduled",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingChannel: { type: String, enum: ["online", "walk-in", "phone"], default: "online" },
  },
  { timestamps: true }
);

// FR-07: no double booking of the same vet slot
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
