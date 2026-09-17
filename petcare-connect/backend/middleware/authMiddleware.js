const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT and attach the user (FR-02)
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorised, no token provided" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account not found or deactivated" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
};

// Role based access control: authorize("admin", "receptionist")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have access to this resource" });
  }
  next();
};

module.exports = { protect, authorize };
