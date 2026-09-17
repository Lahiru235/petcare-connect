const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const Schedule = require("../models/Schedule");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { overlaps, toMinutes, toHHMM } = require("../utils/timeUtils");

const notify = (user, title, message, type) =>
  Notification.create({ user, title, message, type }).catch(() => {});

// FR-07: reject a slot that clashes with another booking or a blocked period
const isSlotFree = async ({ doctor, date, startTime, endTime, ignoreId = null }) => {
  const query = { doctor, date, status: "Scheduled" };
  if (ignoreId) query._id = { $ne: ignoreId };

  const existing = await Appointment.find(query);
  if (existing.some((a) => overlaps(startTime, endTime, a.startTime, a.endTime))) return false;

  const blocks = await Schedule.find({ doctor, date });
  const working = blocks.filter((b) => !b.isBlocked);
  const blocked = blocks.filter((b) => b.isBlocked);

  if (working.length && !working.some((b) => toMinutes(startTime) >= toMinutes(b.startTime) && toMinutes(endTime) <= toMinutes(b.endTime))) {
    return false;
  }
  if (blocked.some((b) => overlaps(startTime, endTime, b.startTime, b.endTime))) return false;

  return true;
};

// @desc  Book an appointment (FR-06)  @route POST /api/appointments  @access owner, receptionist, admin
const createAppointment = async (req, res, next) => {
  try {
    const { pet: petId, doctor, date, startTime, reason = "", slotMinutes = 30, bookingChannel } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet || !pet.isActive) return res.status(400).json({ message: "Select an active pet profile" });
    if (req.user.role === "owner" && String(pet.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "This pet is not on your profile" });
    }

    const vet = await User.findById(doctor);
    if (!vet || vet.role !== "doctor" || !vet.isActive) {
      return res.status(400).json({ message: "Select an available veterinarian" });
    }

    const endTime = req.body.endTime || toHHMM(toMinutes(startTime) + Number(slotMinutes));
    if (!(await isSlotFree({ doctor, date, startTime, endTime }))) {
      return res.status(409).json({ message: "That slot is already taken. Pick another time." });
    }

    const appointment = await Appointment.create({
      pet: petId,
      owner: pet.owner,
      doctor,
      date,
      startTime,
      endTime,
      reason,
      createdBy: req.user._id,
      bookingChannel: bookingChannel || (req.user.role === "owner" ? "online" : "walk-in"),
    });

    // FR-11: simulated reminder / confirmation
    notify(pet.owner, "Appointment confirmed", `${pet.name} is booked with Dr. ${vet.name} on ${date} at ${startTime}.`, "booking");
    notify(doctor, "New appointment", `${pet.name} is booked with you on ${date} at ${startTime}.`, "booking");

    const populated = await appointment.populate([
      { path: "pet", select: "name species breed" },
      { path: "doctor", select: "name specialisation" },
      { path: "owner", select: "name phone email" },
    ]);

    res.status(201).json({ appointment: populated, message: "Appointment booked" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That slot is already taken. Pick another time." });
    next(err);
  }
};

// @desc  List appointments, scoped by role  @route GET /api/appointments  @access Private
const getAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "owner") filter.owner = req.user._id;
    if (req.user.role === "doctor") filter.doctor = req.user._id;

    if (req.query.doctor && req.user.role !== "doctor") filter.doctor = req.query.doctor;
    if (req.query.pet) filter.pet = req.query.pet;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.from && req.query.to) filter.date = { $gte: req.query.from, $lte: req.query.to };

    const appointments = await Appointment.find(filter)
      .populate("pet", "name species breed age")
      .populate("doctor", "name specialisation")
      .populate("owner", "name phone email")
      .sort({ date: 1, startTime: 1 });

    res.json({ count: appointments.length, appointments });
  } catch (err) {
    next(err);
  }
};

// @desc  One appointment  @route GET /api/appointments/:id  @access Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("pet", "name species breed age weight notes")
      .populate("doctor", "name specialisation")
      .populate("owner", "name phone email address");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const mine =
      String(appointment.owner._id) === String(req.user._id) ||
      String(appointment.doctor._id) === String(req.user._id);
    if (["owner", "doctor"].includes(req.user.role) && !mine) {
      return res.status(403).json({ message: "You do not have access to this appointment" });
    }
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
};

// @desc  Reschedule (FR-06)  @route PUT /api/appointments/:id  @access owner(own), receptionist, admin
const rescheduleAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "Scheduled") {
      return res.status(400).json({ message: "Only scheduled appointments can be changed" });
    }
    if (req.user.role === "owner" && String(appointment.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not have access to this appointment" });
    }

    const date = req.body.date || appointment.date;
    const startTime = req.body.startTime || appointment.startTime;
    const doctor = req.body.doctor || appointment.doctor;
    const endTime = req.body.endTime || toHHMM(toMinutes(startTime) + Number(req.body.slotMinutes || 30));

    if (!(await isSlotFree({ doctor, date, startTime, endTime, ignoreId: appointment._id }))) {
      return res.status(409).json({ message: "That slot is already taken. Pick another time." });
    }

    Object.assign(appointment, { date, startTime, endTime, doctor, reason: req.body.reason ?? appointment.reason });
    await appointment.save();

    notify(appointment.owner, "Appointment moved", `Your visit is now on ${date} at ${startTime}.`, "booking");
    res.json({ appointment, message: "Appointment rescheduled" });
  } catch (err) {
    next(err);
  }
};

// @desc  Cancel  @route PATCH /api/appointments/:id/cancel  @access owner(own), receptionist, admin
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (req.user.role === "owner" && String(appointment.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not have access to this appointment" });
    }
    if (appointment.status === "Completed") {
      return res.status(400).json({ message: "A completed visit cannot be cancelled" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    notify(appointment.owner, "Appointment cancelled", `The visit on ${appointment.date} at ${appointment.startTime} was cancelled.`, "cancel");
    res.json({ appointment, message: "Appointment cancelled" });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark status (No-Show / Completed)  @route PATCH /api/appointments/:id/status  @access doctor, receptionist, admin
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Scheduled", "Completed", "Cancelled", "No-Show"].includes(status)) {
      return res.status(400).json({ message: "Unknown appointment status" });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (req.user.role === "doctor" && String(appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "This appointment is not on your schedule" });
    }
    appointment.status = status;
    await appointment.save();
    res.json({ appointment, message: `Appointment marked ${status}` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  updateStatus,
};
