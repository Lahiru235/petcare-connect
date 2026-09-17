const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: [true, "Pet name is required"], trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, default: "", trim: true },
    gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
    age: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
    colour: { type: String, default: "" },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
