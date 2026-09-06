import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'registration';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const code = [...newOtp.slice(0, 5), value.slice(-1)].join('');
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    setError('');
    try {
      setLoading(true);
      await verifyOTP(email, code, purpose);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendOTP({ email, purpose });
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) handleVerify(code);
  };

  return (
    <main className="auth-page">
      <div className="auth-card" data-aos="fade-up">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--cta-light)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Mail size={24} style={{ color: 'var(--cta-hover)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>Verify Your Email</h1>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            We've sent a 6-digit code to
          </p>
          <p style={{ fontWeight: 600, color: 'var(--text)' }}>{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && <div className="form-error" style={{ textAlign: 'center', marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-cta btn-full btn-lg" disabled={loading || otp.join('').length < 6}>
            {loading ? <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Didn't receive the code?{' '}
          {resendTimer > 0 ? (
            <span>Resend in {resendTimer}s</span>
          ) : (
            <button onClick={handleResend} style={{ color: 'var(--secondary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </main>
  );
}
