const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    slotMinutes: { type: Number, default: 30 },
    isBlocked: { type: Boolean, default: false }, // leave / unavailable block
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

scheduleSchema.index({ doctor: 1, date: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
