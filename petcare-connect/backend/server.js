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

// Allow every configured origin instead of a single hardcoded one, so that
// localhost, 127.0.0.1 and ::1 are all accepted.
const allowedOrigins = (
  process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header means curl, Postman or a native client.
      if (!origin) return callback(null, true);
      const normalised = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalised)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && isLocalDevOrigin(normalised)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "PetCare Connect API" }));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

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
