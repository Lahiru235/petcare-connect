const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { buildSlots, overlaps } = require("../utils/timeUtils");

// @desc  Create a working block or a leave block (FR-08)  @route POST /api/schedules
// @access admin, receptionist, doctor(own)
const createSchedule = async (req, res, next) => {
  try {
    const doctorId = req.user.role === "doctor" ? req.user._id : req.body.doctor;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") return res.status(400).json({ message: "Select a valid veterinarian" });

    const { date, startTime, endTime, slotMinutes = 30, isBlocked = false, note = "" } = req.body;
    if (startTime >= endTime) return res.status(400).json({ message: "End time must be after start time" });

    const schedule = await Schedule.create({ doctor: doctorId, date, startTime, endTime, slotMinutes, isBlocked, note });
    res.status(201).json({ schedule, message: isBlocked ? "Unavailable block saved" : "Working hours saved" });
  } catch (err) {
    next(err);
  }
};

// @desc  List schedules  @route GET /api/schedules?doctor=&from=&to=  @access Private
const getSchedules = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "doctor") filter.doctor = req.user._id;
    else if (req.query.doctor) filter.doctor = req.query.doctor;

    if (req.query.from && req.query.to) filter.date = { $gte: req.query.from, $lte: req.query.to };
    else if (req.query.date) filter.date = req.query.date;

    const schedules = await Schedule.find(filter).populate("doctor", "name specialisation").sort({ date: 1, startTime: 1 });
    res.json({ count: schedules.length, schedules });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a schedule block  @route PUT /api/schedules/:id  @access admin, receptionist, doctor(own)
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule block not found" });
    if (req.user.role === "doctor" && String(schedule.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only change your own schedule" });
    }
    ["date", "startTime", "endTime", "slotMinutes", "isBlocked", "note"].forEach((f) => {
      if (req.body[f] !== undefined) schedule[f] = req.body[f];
    });
    await schedule.save();
    res.json({ schedule, message: "Schedule updated" });
  } catch (err) {
    next(err);
  }
};

// @desc  Remove a schedule block  @route DELETE /api/schedules/:id  @access admin, receptionist, doctor(own)
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule block not found" });
    if (req.user.role === "doctor" && String(schedule.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only change your own schedule" });
    }
    await schedule.deleteOne();
    res.json({ message: "Schedule block removed" });
  } catch (err) {
    next(err);
  }
};

// @desc  Free slots of one vet on one date (FR-05)  @route GET /api/schedules/availability?doctor=&date=
// @access Private
const getAvailability = async (req, res, next) => {
  try {
    const { doctor, date } = req.query;
    if (!doctor || !date) return res.status(400).json({ message: "Choose a veterinarian and a date" });

    const blocks = await Schedule.find({ doctor, date });
    const working = blocks.filter((b) => !b.isBlocked);
    const blocked = blocks.filter((b) => b.isBlocked);

    const booked = await Appointment.find({ doctor, date, status: { $in: ["Scheduled", "Completed"] } });

    let slots = [];
    working.forEach((b) => {
      slots = slots.concat(buildSlots(b.startTime, b.endTime, b.slotMinutes));
    });

    const free = slots.filter((s) => {
      const isBooked = booked.some((a) => overlaps(s.startTime, s.endTime, a.startTime, a.endTime));
      const isBlocked = blocked.some((b) => overlaps(s.startTime, s.endTime, b.startTime, b.endTime));
      return !isBooked && !isBlocked;
    });

    res.json({ date, doctor, count: free.length, slots: free });
  } catch (err) {
    next(err);
  }
};

// @desc  Vets available for booking, filterable by specialisation (FR-15)  @route GET /api/schedules/vets
const getVets = async (req, res, next) => {
  try {
    const filter = { role: "doctor", isActive: true };
    if (req.query.specialisation) filter.specialisation = { $regex: req.query.specialisation, $options: "i" };
    const vets = await User.find(filter).select("name email specialisation licenseNo consultationFee").sort("name");
    res.json({ count: vets.length, vets });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSchedule, getSchedules, updateSchedule, deleteSchedule, getAvailability, getVets };
