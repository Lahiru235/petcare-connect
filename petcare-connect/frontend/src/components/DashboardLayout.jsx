import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../api/services";

const roleLabel = {
  owner: "Pet owner",
  doctor: "Veterinarian",
  receptionist: "Reception",
  admin: "Administrator",
};

const DashboardLayout = ({ menu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.list().then(({ data }) => setUnread(data.unread)).catch(() => {});
  }, []);

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div>
          <span className="logo">PetCare<span>Connect</span></span>
          <span className="role-tag">{roleLabel[user?.role]}</span>
        </div>

        <nav className="side-nav">
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)}>
              <span className="ic">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          <button className="btn btn-ghost btn-block" onClick={signOut}>Log out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">☰</button>
          <div style={{ flex: 1 }} />
          <div className="who">
            {user?.role !== "admin" && (
              <button className="bell" onClick={() => navigate("notifications")} aria-label="Notifications">
                🔔{unread > 0 && <b>{unread}</b>}
              </button>
            )}
            <div className="avatar">{initials}</div>
            <div className="small">
              <strong>{user?.name}</strong>
              <div className="muted">{user?.email}</div>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
