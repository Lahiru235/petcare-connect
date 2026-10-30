// Helpers for slot generation and overlap checks
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

// Build slots from a working block, e.g. 09:00-12:00 every 30 min
const buildSlots = (startTime, endTime, slotMinutes = 30) => {
  const slots = [];
  for (let t = toMinutes(startTime); t + slotMinutes <= toMinutes(endTime); t += slotMinutes) {
    slots.push({ startTime: toHHMM(t), endTime: toHHMM(t + slotMinutes) });
  }
  return slots;
};

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);

// Sri Lanka timezone helpers (Asia/Colombo UTC+05:30)
const getSriLankaToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const getSriLankaCurrentTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
};

module.exports = {
  toMinutes,
  toHHMM,
  buildSlots,
  overlaps,
  getSriLankaToday,
  getSriLankaCurrentTime,
};
