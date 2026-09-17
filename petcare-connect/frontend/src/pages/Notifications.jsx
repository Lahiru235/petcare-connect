import { useEffect, useState } from "react";
import { notificationApi } from "../api/services";
import { Empty, Loader } from "../components/UI";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    notificationApi.list().then(({ data }) => setItems(data.notifications)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const readAll = async () => {
    await notificationApi.markAllRead();
    load();
  };

  const readOne = async (id) => {
    await notificationApi.markRead(id);
    load();
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Booking confirmations, reminders and clinic updates.</p>
        </div>
        {items.some((n) => !n.isRead) && <button className="btn btn-ghost btn-sm" onClick={readAll}>Mark all as read</button>}
      </div>

      {items.length === 0 ? (
        <Empty title="Nothing yet" hint="Reminders and booking updates will land here." />
      ) : (
        <div className="note-list">
          {items.map((n) => (
            <div key={n._id} className={`note ${n.isRead ? "" : "unread"}`} onClick={() => !n.isRead && readOne(n._id)}>
              <strong>{n.title}</strong>
              <div className="small">{n.message}</div>
              <div className="small muted">{new Date(n.createdAt).toLocaleString("en-GB")}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Notifications;
