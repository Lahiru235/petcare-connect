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

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",").map((s) => s.trim()) : []),
  "https://petcare-connect-w58z.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .filter(Boolean)
  .map((o) => o.replace(/\/+$/, ""));

const corsOptions = {
  origin: [...new Set(allowedOrigins)],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get(["/api/health", "/health"], (req, res) =>
  res.json({ status: "ok", service: "PetCare Connect API" })
);

// Route groups registered BOTH with and without '/api' prefix
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/pets", petRoutes);
app.use("/pets", petRoutes);

app.use("/api/appointments", appointmentRoutes);
app.use("/appointments", appointmentRoutes);

app.use("/api/records", recordRoutes);
app.use("/records", recordRoutes);

app.use("/api/schedules", scheduleRoutes);
app.use("/schedules", scheduleRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);

app.use("/api/payments", paymentRoutes);
app.use("/payments", paymentRoutes);

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
