const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const Notification = require("../models/Notification");

// @desc  Record diagnosis/treatment for a visit (FR-09)  @route POST /api/records  @access doctor, admin
const createRecord = async (req, res, next) => {
  try {
    const { appointment: appointmentId, diagnosis, treatment, prescription = "", vaccination = "", followUpDate = "" } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate("pet", "name");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // only the assigned vet or an admin may write the visit notes
    if (req.user.role === "doctor" && String(appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned veterinarian can record this visit" });
    }
    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "This visit was cancelled" });
    }

    const already = await MedicalRecord.findOne({ appointment: appointmentId });
    if (already) return res.status(400).json({ message: "This visit already has a record. Edit it instead." });

    const record = await MedicalRecord.create({
      pet: appointment.pet._id,
      appointment: appointmentId,
      doctor: appointment.doctor,
      diagnosis,
      treatment,
      prescription,
      vaccination,
      followUpDate,
      recordedAt: new Date(),
    });

    appointment.status = "Completed";
    await appointment.save();

    Notification.create({
      user: appointment.owner,
      title: "Visit notes ready",
      message: `${appointment.pet.name}'s visit notes from ${appointment.date} are now in the medical history.`,
      type: "system",
    }).catch(() => {});

    res.status(201).json({ record, message: "Visit recorded and appointment completed" });
  } catch (err) {
    next(err);
  }
};

// @desc  Medical history (FR-10)  @route GET /api/records?pet=  @access Private
const getRecords = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.pet) {
      const pet = await Pet.findById(req.query.pet);
      if (!pet) return res.status(404).json({ message: "Pet not found" });
      if (req.user.role === "owner" && String(pet.owner) !== String(req.user._id)) {
        return res.status(403).json({ message: "This pet is not on your profile" });
      }
      filter.pet = req.query.pet;
    } else if (req.user.role === "owner") {
      const petIds = await Pet.find({ owner: req.user._id }).distinct("_id");
      filter.pet = { $in: petIds };
    } else if (req.user.role === "doctor" && req.query.mine === "true") {
      filter.doctor = req.user._id;
    }

    const records = await MedicalRecord.find(filter)
      .populate("pet", "name species breed")
      .populate("doctor", "name specialisation")
      .populate("appointment", "date startTime reason")
      .sort({ recordedAt: -1 });

    res.json({ count: records.length, records });
  } catch (err) {
    next(err);
  }
};

// @desc  Edit visit notes  @route PUT /api/records/:id  @access assigned doctor, admin
const updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (req.user.role === "doctor" && String(record.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned veterinarian can edit these notes" });
    }
    ["diagnosis", "treatment", "prescription", "vaccination", "followUpDate"].forEach((f) => {
      if (req.body[f] !== undefined) record[f] = req.body[f];
    });
    await record.save();
    res.json({ record, message: "Visit notes updated" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getRecords, updateRecord };
