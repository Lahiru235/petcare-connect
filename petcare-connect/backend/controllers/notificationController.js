const Notification = require("../models/Notification");
const Appointment = require("../models/Appointment");

// @desc  My notifications  @route GET /api/notifications  @access Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(50);
    const unread = notifications.filter((n) => !n.isRead).length;
    res.json({ count: notifications.length, unread, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark one as read  @route PATCH /api/notifications/:id/read  @access Private
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark all as read  @route PATCH /api/notifications/read-all  @access Private
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// @desc  Generate reminders for tomorrow's visits (FR-11)  @route POST /api/notifications/run-reminders
// @access admin
const runReminders = async (req, res, next) => {
  try {
    const target = new Date();
    target.setDate(target.getDate() + Number(req.body.daysAhead ?? 1));
    const date = target.toISOString().slice(0, 10);

    const appointments = await Appointment.find({ date, status: "Scheduled" })
      .populate("pet", "name")
      .populate("doctor", "name");

    const created = await Promise.all(
      appointments.map((a) =>
        Notification.create({
          user: a.owner,
          title: "Visit reminder",
          message: `${a.pet.name} sees Dr. ${a.doctor.name} tomorrow at ${a.startTime}.`,
          type: "reminder",
        })
      )
    );

    res.json({ message: `${created.length} reminders sent for ${date}`, date, sent: created.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead, runReminders };
