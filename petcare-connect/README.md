# PetCare Connect — MERN implementation

Pet Care & Veterinary Appointment System — ICT2232 Software Engineering, University of Ruhuna, Group 4.

Stack: **MongoDB + Express + React (Vite) + Node.js**, JWT auth with role claims, bcrypt password hashing, axios on the client.

```
petcare-connect/
├── backend/          Express REST API (controllers in their own files)
│   ├── config/db.js
│   ├── models/       User, Pet, Appointment, MedicalRecord, Schedule, Notification
│   ├── controllers/  auth, pet, appointment, record, schedule, notification, admin
│   ├── routes/       one router per controller
│   ├── middleware/   authMiddleware (protect + authorize), validate, errorMiddleware
│   ├── utils/        generateToken, timeUtils, seed
│   └── server.js
└── frontend/         React + Vite SPA
    └── src/
        ├── api/      axios.js (instance + interceptors), services.js (all endpoints)
        ├── context/  AuthContext.jsx
        ├── components/ DashboardLayout, ProtectedRoute, UI.jsx
        ├── pages/    auth · owner · doctor · reception · admin
        └── styles/global.css   theme tokens
```

## Running it

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm run seed                # demo accounts + pets + schedules
npm run dev                 # http://localhost:5000
```

**2. Frontend**
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

MongoDB: local `mongod`, or paste an Atlas connection string into `MONGO_URI`.

## Demo logins (after `npm run seed`)

| Role         | Email                  | Password      |
|--------------|------------------------|---------------|
| Admin        | admin@petcare.lk       | admin123      |
| Receptionist | reception@petcare.lk   | reception123  |
| Doctor       | kasun@petcare.lk       | doctor123     |
| Doctor       | ishara@petcare.lk      | doctor123     |
| Pet owner    | owner@petcare.lk       | owner123      |

## API endpoints

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public (creates an owner) |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/forgot-password` · `/api/auth/reset-password/:token` | public |
| GET/PUT | `/api/auth/me` | any signed-in user |
| GET/POST | `/api/pets` | owner, receptionist, admin |
| GET/PUT/DELETE | `/api/pets/:id` | owner (own), receptionist, admin |
| GET/POST | `/api/appointments` | owner, receptionist, admin |
| PUT | `/api/appointments/:id` | reschedule |
| PATCH | `/api/appointments/:id/cancel` · `/status` | cancel · doctor/reception mark status |
| GET/POST | `/api/records` | owner/doctor read · doctor, admin write |
| PUT | `/api/records/:id` | assigned doctor or admin |
| GET/POST | `/api/schedules` · `/availability` · `/vets` | availability search, working hours |
| GET/PATCH | `/api/notifications` | own notifications |
| POST | `/api/notifications/run-reminders` | admin |
| GET/POST/PUT/PATCH | `/api/admin/users` · `/stats` · `/reports` | admin |

## How the requirements are covered

- **FR-01/02** role-based register and login — `authController`, `authMiddleware.authorize`, `ProtectedRoute`
- **FR-03** pet CRUD and deactivate — `petController`, `pages/owner/MyPets.jsx`
- **FR-04/05/15** availability search, filter by specialisation — `scheduleController.getAvailability` / `getVets`
- **FR-06/07** book, reschedule, cancel, no double-booking — `appointmentController.isSlotFree` plus a unique index on `(doctor, date, startTime)`
- **FR-08** vet schedule view — `pages/doctor/MySchedule.jsx`, `pages/reception/AllSchedules.jsx`
- **FR-09** diagnosis/treatment recorded, appointment auto-completed and timestamped; only the assigned vet or admin may edit — `recordController`
- **FR-10** chronological medical history — `pages/owner/MedicalHistory.jsx`
- **FR-11** reminders — `Notification` model plus `POST /api/notifications/run-reminders` (simulated delivery, triggered from System settings)
- **FR-12/13** staff accounts, roles, deactivation, reports with no-show rate — `adminController`
- **FR-14** password reset by email token (link logged to the console in demo mode)
- **FR-16** validation with express-validator on every write route
- **NFR-02** responsive layout down to mobile; **NFR-04** bcrypt hashing in the `User` pre-save hook; **NFR-05** helmet, CORS allow-list, Mongoose query casting; **NFR-06** modular REST API

## Theme

Colours taken from the clinic reference design: leaf green `#2FA95C`, forest `#17713C`, carrot `#FF6B3D`, cream `#FDF7E4`, mint `#EAF7EE`, soft sky `#CFE3F7`. Type: Fredoka for headings, Manrope for body, Caveat for the wordmark. All tokens live at the top of `frontend/src/styles/global.css` — change them there and the whole app follows.

## Left for your team

- Swap the simulated reminders for real email/SMS (Nodemailer or Twilio)
- Deploy: API on Render/Railway, SPA on Netlify/Vercel, database on MongoDB Atlas
- Add Jest + Supertest cases for the booking-conflict rule before the testing stage
