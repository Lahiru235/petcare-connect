import { useEffect, useState } from "react";
import { paymentApi } from "../../api/services";
import { Alert, Chip, Empty, Loader, Modal, Stat, prettyDate, todayStr, addDays } from "../../components/UI";

const statusColor = {
  success: "Completed",
  pending: "Scheduled",
  failed: "Cancelled",
  cancelled: "Cancelled",
  refunded: "No-Show",
  charged_back: "Cancelled",
};

const PaymentManagement = () => {
  const [stats, setStats] = useState(null);
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [range, setRange] = useState({ from: addDays(-90), to: todayStr() });
  const [detail, setDetail] = useState(null);

  const loadStats = () => {
    paymentApi.stats()
      .then(({ data }) => {
        setStats(data.stats);
        setRevenueByDay(data.revenueByDay);
      })
      .catch((err) => setError(err.message));
  };

  const loadPayments = () => {
    setLoading(true);
    const params = {};
    if (filter) params.status = filter;
    if (range.from && range.to) {
      params.from = range.from;
      params.to = range.to;
    }
    paymentApi.list(params)
      .then(({ data }) => setPayments(data.payments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadPayments(); }, [filter, range.from, range.to]);

  const viewDetail = async (id) => {
    try {
      const { data } = await paymentApi.get(id);
      setDetail(data.payment);
    } catch (err) {
      setError(err.message);
    }
  };

  const exportCsv = () => {
    const rows = [["Order ID", "Client", "Email", "Amount", "Currency", "Status", "Method", "Date"]];
    payments.forEach((p) => {
      rows.push([
        p.orderId,
        p.owner?.name || "",
        p.customerEmail || p.owner?.email || "",
        p.amount,
        p.currency,
        p.status,
        p.method || "",
        p.createdAt?.slice(0, 10) || "",
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${range.from}-to-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.total));

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Payment Management</h1>
          <p className="muted">Complete financial overview of all clinic transactions.</p>
        </div>
        <div className="row-actions">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}>Download CSV</button>
        </div>
      </div>

      <Alert>{error}</Alert>

      {/* Stats cards */}
      {stats && (
        <div className="stat-grid">
          <Stat value={`LKR ${stats.totalRevenue?.toLocaleString() || 0}`} label="Total Revenue" tone="accent" />
          <Stat value={stats.success || 0} label="Successful Payments" tone="sky" />
          <Stat value={stats.pending || 0} label="Pending" tone="warn" />
          <Stat value={stats.failed || 0} label="Failed / Cancelled" />
        </div>
      )}

      {/* Revenue chart */}
      {revenueByDay.length > 0 && (
        <div className="card">
          <h2>Revenue (Last 30 Days)</h2>
          {revenueByDay.map((d) => (
            <div className="bar-row" key={d.date}>
              <span className="small muted" style={{ minWidth: 90 }}>{prettyDate(d.date)}</span>
              <div className="bar accent" style={{ width: `${(d.total / maxRevenue) * 100}%` }} />
              <span className="small"><strong>LKR {d.total.toLocaleString()}</strong> ({d.count})</span>
            </div>
          ))}
        </div>
      )}

      {/* Payments table */}
      <div className="card">
        <div className="card-head">
          <h2>All Transactions</h2>
          <div className="row-actions">
            <input type="date" style={{ width: 150 }} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            <input type="date" style={{ width: 150 }} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
            <select style={{ width: 130 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? <Loader /> : payments.length === 0 ? (
          <Empty title="No transactions found" hint="Payment records will appear here when clients pay online." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Pet</th>
                  <th>Vet</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td><code className="small">{p.orderId}</code></td>
                    <td>
                      <strong>{p.owner?.name}</strong>
                      <div className="small muted">{p.owner?.email}</div>
                    </td>
                    <td>{p.appointment?.pet?.name || "—"}</td>
                    <td className="small">Dr. {p.appointment?.doctor?.name || "—"}</td>
                    <td><strong>{p.currency} {p.amount.toLocaleString()}</strong></td>
                    <td className="small">{p.method || "—"}</td>
                    <td><Chip status={statusColor[p.status] || p.status} /></td>
                    <td className="small">{prettyDate(p.createdAt?.slice(0, 10))}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(p._id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <Modal title="Payment Details" onClose={() => setDetail(null)}>
          <div className="payment-detail-modal">
            <div className="payment-detail-section">
              <h3>Transaction</h3>
              <div className="payment-details-grid">
                <div className="payment-detail-row"><span className="muted">Order ID</span><code>{detail.orderId}</code></div>
                <div className="payment-detail-row"><span className="muted">Payment ID</span><span>{detail.stripeSessionId || detail.payherePaymentId || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Amount</span><strong>{detail.currency} {detail.amount.toLocaleString()}</strong></div>
                <div className="payment-detail-row"><span className="muted">Status</span><Chip status={statusColor[detail.status] || detail.status} /></div>
                <div className="payment-detail-row"><span className="muted">Method</span><span>{detail.method || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Card</span><span>{detail.cardNo ? `**** **** **** ${detail.cardNo}` : "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Cardholder</span><span>{detail.cardHolderName || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Items</span><span>{detail.items || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Paid At</span><span>{detail.paidAt ? new Date(detail.paidAt).toLocaleString() : "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Created</span><span>{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}</span></div>
              </div>
            </div>

            <div className="payment-detail-section">
              <h3>Customer</h3>
              <div className="payment-details-grid">
                <div className="payment-detail-row"><span className="muted">Name</span><span>{detail.owner?.name}</span></div>
                <div className="payment-detail-row"><span className="muted">Email</span><span>{detail.customerEmail || detail.owner?.email}</span></div>
                <div className="payment-detail-row"><span className="muted">Phone</span><span>{detail.customerPhone || detail.owner?.phone || "—"}</span></div>
              </div>
            </div>

            {detail.appointment && (
              <div className="payment-detail-section">
                <h3>Appointment</h3>
                <div className="payment-details-grid">
                  <div className="payment-detail-row"><span className="muted">Pet</span><span>{detail.appointment.pet?.name}</span></div>
                  <div className="payment-detail-row"><span className="muted">Vet</span><span>Dr. {detail.appointment.doctor?.name}</span></div>
                  <div className="payment-detail-row"><span className="muted">Date</span><span>{prettyDate(detail.appointment.date)}</span></div>
                  <div className="payment-detail-row"><span className="muted">Time</span><span>{detail.appointment.startTime} – {detail.appointment.endTime}</span></div>
                  <div className="payment-detail-row"><span className="muted">Appt Status</span><Chip status={detail.appointment.status} /></div>
                </div>
              </div>
            )}

            {detail.statusMessage && (
              <div className="payment-detail-section">
                <h3>Gateway Response</h3>
                <p className="small muted">{detail.statusMessage}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default PaymentManagement;
