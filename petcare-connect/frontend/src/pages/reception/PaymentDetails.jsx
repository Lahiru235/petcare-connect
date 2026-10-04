import { useEffect, useState } from "react";
import { paymentApi } from "../../api/services";
import { Alert, Chip, Empty, Field, Loader, Modal, prettyDate, todayStr, addDays } from "../../components/UI";

const statusColor = {
  success: "Completed",
  pending: "Scheduled",
  failed: "Cancelled",
  cancelled: "Cancelled",
  refunded: "No-Show",
  charged_back: "Cancelled",
};

const PaymentDetails = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [range, setRange] = useState({ from: addDays(-30), to: todayStr() });
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    const params = {};
    if (filter) params.status = filter;
    if (range.from && range.to) {
      params.from = range.from;
      params.to = range.to;
    }
    paymentApi
      .list(params)
      .then(({ data }) => setPayments(data.payments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, range.from, range.to]);

  const viewDetail = async (id) => {
    try {
      const { data } = await paymentApi.get(id);
      setDetail(data.payment);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Payment Records</h1>
          <p className="muted">View and track all client payment transactions.</p>
        </div>
        <div className="row-actions">
          <input type="date" style={{ width: 155 }} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <input type="date" style={{ width: 155 }} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          <select style={{ width: 140 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="card">
        {loading ? <Loader /> : payments.length === 0 ? (
          <Empty title="No payments found" hint="Payment records will appear here after clients complete transactions." />
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
                      <div className="small muted">{p.owner?.phone || p.owner?.email}</div>
                    </td>
                    <td>{p.appointment?.pet?.name || "—"}</td>
                    <td className="small">Dr. {p.appointment?.doctor?.name || "—"}</td>
                    <td><strong>{p.currency} {p.amount.toLocaleString()}</strong></td>
                    <td><Chip status={statusColor[p.status] || p.status} /></td>
                    <td className="small">{prettyDate(p.createdAt?.slice(0, 10))}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(p._id)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {detail && (
        <Modal title="Payment Details" onClose={() => setDetail(null)}>
          <div className="payment-detail-modal">
            <div className="payment-detail-section">
              <h3>Transaction Info</h3>
              <div className="payment-details-grid">
                <div className="payment-detail-row"><span className="muted">Order ID</span><code>{detail.orderId}</code></div>
                <div className="payment-detail-row"><span className="muted">Payment ID</span><span>{detail.stripeSessionId || detail.payherePaymentId || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Amount</span><strong>{detail.currency} {detail.amount.toLocaleString()}</strong></div>
                <div className="payment-detail-row"><span className="muted">Status</span><Chip status={statusColor[detail.status] || detail.status} /></div>
                <div className="payment-detail-row"><span className="muted">Method</span><span>{detail.method || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Card</span><span>{detail.cardNo ? `**** **** **** ${detail.cardNo}` : "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Cardholder</span><span>{detail.cardHolderName || "—"}</span></div>
                <div className="payment-detail-row"><span className="muted">Paid At</span><span>{detail.paidAt ? new Date(detail.paidAt).toLocaleString() : "—"}</span></div>
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
                  <div className="payment-detail-row"><span className="muted">Pet</span><span>{detail.appointment.pet?.name} ({detail.appointment.pet?.species})</span></div>
                  <div className="payment-detail-row"><span className="muted">Vet</span><span>Dr. {detail.appointment.doctor?.name}</span></div>
                  <div className="payment-detail-row"><span className="muted">Date</span><span>{prettyDate(detail.appointment.date)}</span></div>
                  <div className="payment-detail-row"><span className="muted">Time</span><span>{detail.appointment.startTime} – {detail.appointment.endTime}</span></div>
                  <div className="payment-detail-row"><span className="muted">Appt Status</span><Chip status={detail.appointment.status} /></div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default PaymentDetails;
