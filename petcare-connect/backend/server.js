require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const recordRoutes = require("./routes/recordRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

connectDB();

const app = express();

app.use(
  helmet({
    // The API is called cross-origin by the dev server, so the default
    // same-origin resource policy makes the browser discard the response.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Never let a plain-HTTP localhost dev server get pinned to HTTPS.
    strictTransportSecurity: false,
  })
);

// Resilient CORS and preflight OPTIONS handler
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://petcare-connect-w58z.vercel.app",
    "http://localhost:5173",
    "http://localhost:5000",
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",").map((s) => s.trim()) : []),
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get(["/api/health", "/health"], (req, res) =>
  res.json({ status: "ok", service: "PetCare Connect API" })
);

// Route groups registered BOTH with and without '/api' prefix
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use("/pets", petRoutes);
app.use("/api/pets", petRoutes);

app.use("/appointments", appointmentRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/records", recordRoutes);
app.use("/api/records", recordRoutes);

app.use("/schedules", scheduleRoutes);
app.use("/api/schedules", scheduleRoutes);

app.use("/notifications", notificationRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

app.use("/chat", chatRoutes);
app.use("/api/chat", chatRoutes);

app.use("/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);

// --- Root Route (Add this here!) ---
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "PetCare Connect Backend API is up and running!"
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PetCare Connect API running on port ${PORT}`));
