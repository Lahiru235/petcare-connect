const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMessage, clearHistory } = require("../controllers/chatController");

const router = express.Router();

// Optional auth — attaches user if a valid token is present, but doesn't block
const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch {
    // token invalid/expired — continue as anonymous
  }
  next();
};

router.post("/", optionalAuth, sendMessage);
router.delete("/clear", optionalAuth, clearHistory);

module.exports = router;
