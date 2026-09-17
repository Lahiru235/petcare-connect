/**
 * Demo data for the viva: run `npm run seed` after setting MONGO_URI.
 * Creates one account per role, a few pets, vet schedules and appointments.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Notification = require("../models/Notification");

const dayString = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

(async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(), Pet.deleteMany(), Schedule.deleteMany(),
    Appointment.deleteMany(), MedicalRecord.deleteMany(), Notification.deleteMany(),
  ]);

  const admin = await User.create({ name: "Bihan Perera", email: "admin@petcare.lk", password: "admin123", role: "admin", phone: "0771234567" });
  const reception = await User.create({ name: "Nadeesha Silva", email: "reception@petcare.lk", password: "reception123", role: "receptionist", phone: "0772234567" });
  const drFernando = await User.create({ name: "Kasun Fernando", email: "kasun@petcare.lk", password: "doctor123", role: "doctor", specialisation: "Surgery", licenseNo: "VET-1021", consultationFee: 2500 });
  const drJayasinghe = await User.create({ name: "Ishara Jayasinghe", email: "ishara@petcare.lk", password: "doctor123", role: "doctor", specialisation: "Dermatology", licenseNo: "VET-1044", consultationFee: 2000 });
  const owner = await User.create({ name: "Amal Dias", email: "owner@petcare.lk", password: "owner123", role: "owner", phone: "0761234567", address: "12 Lake Road, Nuwara Eliya" });

  const bruno = await Pet.create({ owner: owner._id, name: "Bruno", species: "Dog", breed: "Labrador", gender: "Male", age: 3, weight: 27, colour: "Golden" });
  const kiki = await Pet.create({ owner: owner._id, name: "Kiki", species: "Cat", breed: "British Shorthair", gender: "Female", age: 2, weight: 4.5, colour: "Grey" });

  // Keep enough future availability for demo bookings and date-picker testing.
  for (let i = 0; i < 30; i++) {
    for (const vet of [drFernando, drJayasinghe]) {
      await Schedule.create({ doctor: vet._id, date: dayString(i), startTime: "09:00", endTime: "12:00", slotMinutes: 30 });
      await Schedule.create({ doctor: vet._id, date: dayString(i), startTime: "14:00", endTime: "17:00", slotMinutes: 30 });
    }
  }

  const past = await Appointment.create({
    pet: bruno._id, owner: owner._id, doctor: drFernando._id, date: dayString(-5),
    startTime: "09:30", endTime: "10:00", reason: "Limping on the front leg", status: "Completed", createdBy: owner._id,
  });

  await MedicalRecord.create({
    pet: bruno._id, appointment: past._id, doctor: drFernando._id,
    diagnosis: "Mild sprain in the right foreleg",
    treatment: "Rest for 7 days, anti-inflammatory course",
    prescription: "Meloxicam 1.5 mg/ml, 0.1 ml/kg once daily for 5 days",
    vaccination: "Rabies booster given",
    followUpDate: dayString(9),
  });

  await Appointment.create({ pet: kiki._id, owner: owner._id, doctor: drJayasinghe._id, date: dayString(1), startTime: "10:00", endTime: "10:30", reason: "Itching and hair loss", createdBy: owner._id });
  await Appointment.create({ pet: bruno._id, owner: owner._id, doctor: drFernando._id, date: dayString(2), startTime: "14:30", endTime: "15:00", reason: "Follow-up check", createdBy: reception._id, bookingChannel: "phone" });

  await Notification.create({ user: owner._id, title: "Welcome to PetCare Connect", message: "Your pets, visits and medical history now live in one place.", type: "system" });

  console.log(`Seeded.
  Admin        admin@petcare.lk / admin123
  Receptionist reception@petcare.lk / reception123
  Doctor       kasun@petcare.lk / doctor123
  Doctor       ishara@petcare.lk / doctor123
  Pet owner    owner@petcare.lk / owner123`);
  process.exit(0);
})();
