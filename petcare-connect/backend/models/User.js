const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["owner", "doctor", "receptionist", "admin"],
      default: "owner",
    },
    // doctor-only fields
    specialisation: { type: String, default: "" },
    licenseNo: { type: String, default: "" },
    consultationFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash password before save (NFR-04)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
