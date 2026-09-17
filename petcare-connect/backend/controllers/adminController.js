const User = require("../models/User");
const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  specialisation: u.specialisation,
  licenseNo: u.licenseNo,
  consultationFee: u.consultationFee,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

// @desc  Create a staff / vet / owner account (FR-12)  @route POST /api/admin/users  @access admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialisation, licenseNo, consultationFee } = req.body;
    if (!["owner", "doctor", "receptionist", "admin"].includes(role)) {
      return res.status(400).json({ message: "Choose a valid role" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "This email is already registered" });

    const user = await User.create({ name, email, password, role, phone, specialisation, licenseNo, consultationFee });
    res.status(201).json({ user: publicUser(user), message: `${role} account created` });
  } catch (err) {
    next(err);
  }
};

// @desc  List users  @route GET /api/admin/users?role=&search=  @access admin
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).sort("-createdAt");
    res.json({ count: users.length, users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a user / change role  @route PUT /api/admin/users/:id  @access admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    ["name", "email", "phone", "address", "role", "specialisation", "licenseNo", "consultationFee"].forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });
    if (req.body.password) user.password = req.body.password;

    await user.save();
    res.json({ user: publicUser(user), message: "Account updated" });
  } catch (err) {
    next(err);
  }
};

// @desc  Activate / deactivate an account  @route PATCH /api/admin/users/:id/status  @access admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: publicUser(user), message: user.isActive ? "Account activated" : "Account deactivated" });
  } catch (err) {
    next(err);
  }
};

// @desc  Dashboard counters  @route GET /api/admin/stats  @access admin
const getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [owners, doctors, receptionists, pets, todayCount, scheduled, completed, noShow, cancelled, records] =
      await Promise.all([
        User.countDocuments({ role: "owner" }),
        User.countDocuments({ role: "doctor" }),
        User.countDocuments({ role: "receptionist" }),
        Pet.countDocuments({ isActive: true }),
        Appointment.countDocuments({ date: today }),
        Appointment.countDocuments({ status: "Scheduled" }),
        Appointment.countDocuments({ status: "Completed" }),
        Appointment.countDocuments({ status: "No-Show" }),
        Appointment.countDocuments({ status: "Cancelled" }),
        MedicalRecord.countDocuments(),
      ]);

    const total = scheduled + completed + noShow + cancelled;
    res.json({
      stats: {
        owners, doctors, receptionists, pets,
        todayAppointments: todayCount,
        scheduled, completed, noShow, cancelled,
        totalAppointments: total,
        noShowRate: total ? Number(((noShow / total) * 100).toFixed(1)) : 0,
        medicalRecords: records,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Operational report (FR-13)  @route GET /api/admin/reports?from=&to=  @access admin
const getReports = async (req, res, next) => {
  try {
    const from = req.query.from || "0000-01-01";
    const to = req.query.to || "9999-12-31";

    const appointments = await Appointment.find({ date: { $gte: from, $lte: to } })
      .populate("doctor", "name specialisation")
      .populate("pet", "name species");

    const byStatus = appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const byDoctorMap = {};
    appointments.forEach((a) => {
      const key = a.doctor?.name || "Unassigned";
      byDoctorMap[key] = byDoctorMap[key] || { doctor: key, total: 0, completed: 0, noShow: 0 };
      byDoctorMap[key].total += 1;
      if (a.status === "Completed") byDoctorMap[key].completed += 1;
      if (a.status === "No-Show") byDoctorMap[key].noShow += 1;
    });

    const byDayMap = {};
    appointments.forEach((a) => {
      byDayMap[a.date] = (byDayMap[a.date] || 0) + 1;
    });

    const total = appointments.length;
    res.json({
      range: { from, to },
      total,
      byStatus,
      noShowRate: total ? Number((((byStatus["No-Show"] || 0) / total) * 100).toFixed(1)) : 0,
      byDoctor: Object.values(byDoctorMap).sort((a, b) => b.total - a.total),
      byDay: Object.entries(byDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, updateUser, toggleUserStatus, getStats, getReports };
