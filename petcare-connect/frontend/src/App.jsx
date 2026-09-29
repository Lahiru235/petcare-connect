import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, homeFor } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MyPets from "./pages/owner/MyPets";
import BookAppointment from "./pages/owner/BookAppointment";
import MyAppointments from "./pages/owner/MyAppointments";
import MedicalHistory from "./pages/owner/MedicalHistory";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import MySchedule from "./pages/doctor/MySchedule";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import PatientRecords from "./pages/doctor/PatientRecords";
import RecordVisit from "./pages/doctor/RecordVisit";

import ReceptionDashboard from "./pages/reception/ReceptionDashboard";
import AllSchedules from "./pages/reception/AllSchedules";
import ManageAppointments from "./pages/reception/ManageAppointments";
import RegisterWalkIn from "./pages/reception/RegisterWalkIn";
import VetAvailability from "./pages/reception/VetAvailability";
import SearchPatients from "./pages/reception/SearchPatients";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import VetManagement from "./pages/admin/VetManagement";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";

const ownerMenu = [
  { to: "/owner", label: "Dashboard", icon: "🏠", end: true },
  { to: "/owner/pets", label: "My pets", icon: "🐾" },
  { to: "/owner/book", label: "Book appointment", icon: "📅" },
  { to: "/owner/appointments", label: "My appointments", icon: "🗓" },
  { to: "/owner/history", label: "Medical history", icon: "📋" },
  { to: "/owner/notifications", label: "Notifications", icon: "🔔" },
  { to: "/owner/profile", label: "Profile", icon: "👤" },
];

const doctorMenu = [
  { to: "/doctor", label: "Dashboard", icon: "🏠", end: true },
  { to: "/doctor/schedule", label: "My schedule", icon: "🗓" },
  { to: "/doctor/appointments", label: "Appointments", icon: "📅" },
  { to: "/doctor/patients", label: "Patient records", icon: "📋" },
  { to: "/doctor/record", label: "Record visit", icon: "🩺" },
  { to: "/doctor/notifications", label: "Notifications", icon: "🔔" },
  { to: "/doctor/profile", label: "Profile", icon: "👤" },
];

const receptionMenu = [
  { to: "/reception", label: "Dashboard", icon: "🏠", end: true },
  { to: "/reception/schedules", label: "All schedules", icon: "🗓" },
  { to: "/reception/appointments", label: "Book / manage", icon: "📅" },
  { to: "/reception/walk-in", label: "Register walk-in", icon: "🚶" },
  { to: "/reception/availability", label: "Vet availability", icon: "⏰" },
  { to: "/reception/patients", label: "Search patients", icon: "🔍" },
  { to: "/reception/notifications", label: "Notifications", icon: "🔔" },
  { to: "/reception/profile", label: "Profile", icon: "👤" },
];

const adminMenu = [
  { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
  { to: "/admin/users", label: "User management", icon: "👥" },
  { to: "/admin/vets", label: "Veterinarians", icon: "🩺" },
  { to: "/admin/reports", label: "Reports", icon: "📈" },
  { to: "/admin/settings", label: "System settings", icon: "⚙️" },
  { to: "/admin/profile", label: "Profile", icon: "👤" },
];

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Home />} />
      <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Pet owner */}
      <Route path="/owner" element={<ProtectedRoute allow={["owner"]}><DashboardLayout menu={ownerMenu} /></ProtectedRoute>}>
        <Route index element={<OwnerDashboard />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Veterinarian */}
      <Route path="/doctor" element={<ProtectedRoute allow={["doctor"]}><DashboardLayout menu={doctorMenu} /></ProtectedRoute>}>
        <Route index element={<DoctorDashboard />} />
        <Route path="schedule" element={<MySchedule />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<PatientRecords />} />
        <Route path="record" element={<RecordVisit />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Receptionist */}
      <Route path="/reception" element={<ProtectedRoute allow={["receptionist"]}><DashboardLayout menu={receptionMenu} /></ProtectedRoute>}>
        <Route index element={<ReceptionDashboard />} />
        <Route path="schedules" element={<AllSchedules />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="walk-in" element={<RegisterWalkIn />} />
        <Route path="availability" element={<VetAvailability />} />
        <Route path="patients" element={<SearchPatients />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><DashboardLayout menu={adminMenu} /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="vets" element={<VetManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
