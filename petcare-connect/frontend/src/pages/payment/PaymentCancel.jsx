import { useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../../context/AuthContext";

const PaymentCancel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="payment-result-page">
      <div className="payment-result-card cancel">
        <div className="payment-result-icon">
          <svg viewBox="0 0 52 52" width="72" height="72">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#ef4444" strokeWidth="2" />
            <path fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" d="M18 18l16 16M34 18l-16 16" />
          </svg>
        </div>
        <h1>Payment Cancelled</h1>
        <p className="muted">Your payment was cancelled. No charges were made to your account.</p>
        <p className="small muted">You can try again from your appointments page or book a new visit.</p>
        <div className="payment-result-actions">
          <button
            className="btn btn-accent"
            onClick={() => navigate(user ? `${homeFor(user.role)}/appointments` : "/login")}
          >
            My Appointments
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate(user ? `${homeFor(user.role)}/book` : "/login")}
          >
            Book Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
