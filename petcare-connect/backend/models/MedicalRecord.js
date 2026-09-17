const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    prescription: { type: String, default: "" },
    vaccination: { type: String, default: "" },
    followUpDate: { type: String, default: "" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
