import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, homeFor } from "../../context/AuthContext";
import { paymentApi } from "../../api/services";

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      paymentApi.verifySession(sessionId).catch((err) => {
        console.error("Failed to verify payment session:", err);
      });
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(user ? `${homeFor(user.role)}/appointments` : "/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="payment-result-page">
      <div className="payment-result-card success">
        <div className="payment-result-icon">
          <svg viewBox="0 0 52 52" width="72" height="72">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#22c55e" strokeWidth="2" />
            <path fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" />
          </svg>
        </div>
        <h1>Payment Successful!</h1>
        <p className="muted">Your payment has been processed successfully. Thank you for choosing PetCare Connect.</p>
        <p className="small muted">You will be redirected to your appointments in a few seconds…</p>
        <button
          className="btn btn-accent"
          onClick={() => navigate(user ? `${homeFor(user.role)}/appointments` : "/login")}
        >
          Go to Appointments
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
