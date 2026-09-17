import api from "./axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const petApi = {
  list: (params) => api.get("/pets", { params }),
  get: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  toggle: (id) => api.delete(`/pets/${id}`),
};

export const appointmentApi = {
  list: (params) => api.get("/appointments", { params }),
  get: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  reschedule: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  setStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
};

export const recordApi = {
  list: (params) => api.get("/records", { params }),
  create: (data) => api.post("/records", data),
  update: (id, data) => api.put(`/records/${id}`, data),
};

export const scheduleApi = {
  list: (params) => api.get("/schedules", { params }),
  create: (data) => api.post("/schedules", data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  remove: (id) => api.delete(`/schedules/${id}`),
  availability: (params) => api.get("/schedules/availability", { params }),
  vets: (params) => api.get("/schedules/vets", { params }),
};

export const notificationApi = {
  list: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  runReminders: (data) => api.post("/notifications/run-reminders", data),
};

export const adminApi = {
  users: (params) => api.get("/admin/users", { params }),
  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUser: (id) => api.patch(`/admin/users/${id}/status`),
  stats: () => api.get("/admin/stats"),
  reports: (params) => api.get("/admin/reports", { params }),
};
