import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())                       e.name     = 'Name is required';
    if (!form.email)                             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Enter a valid email';
    if (!form.password)                          e.password = 'Password is required';
    else if (form.password.length < 6)           e.password = 'At least 6 characters';
    if (form.confirm !== form.password)          e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to JobTrackr! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const getStrength = () => {
    const p = form.password;
    if (!p)           return { width: '0%',   color: 'transparent', label: '' };
    if (p.length < 6) return { width: '25%',  color: '#DC2626',  label: 'Too short' };
    if (p.length < 8) return { width: '50%',  color: '#D97706',  label: 'Weak' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p))
                      return { width: '75%',  color: '#166534',  label: 'Good' };
    return             { width: '100%', color: '#14532D', label: 'Strong' };
  };

  const strength = getStrength();

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar">
        <div className="auth-topbar-logo">
          <div className="auth-topbar-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          JobTrackr
        </div>
      </div>

      {/* Body */}
      <div className="auth-body">
        {/* Left */}
        <div className="auth-left-content">
          <h1>Land your<br /><span>dream job</span><br />faster.</h1>
          <p>Join job seekers using JobTrackr to stay organised, confident, and ahead in their job search.</p>
          <div className="auth-feature-list">
            {[
              'Free forever — no credit card needed',
              'Track applications from any job board',
              'AI cover letter tips for every role',
              'Know your response rate and trends',
            ].map((f, i) => (
              <div key={i} className="auth-feature-item">
                <div className="auth-feature-check">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="auth-form-wrap">
          <h2>Create account</h2>
          <p className="auth-sub">Already have one? <Link to="/login">Sign in</Link></p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text"
                placeholder="Jamie Doe"
                value={form.name} onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                autoComplete="name" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email"
                placeholder="you@email.com"
                value={form.email} onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password"
                placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="new-password" />
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type="password"
                placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange}
                className={errors.confirm ? 'input-error' : ''}
                autoComplete="new-password" />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}