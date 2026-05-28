import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)                            e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                         e.password = 'Password is required';
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
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

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
          <h1>Your job search,<br /><span>organised.</span></h1>
          <p>Track every application across every platform. Get AI-powered interview prep and cover letter tips. Never lose track of an opportunity again.</p>
          <div className="auth-feature-list">
            {[
              'Track applications from LinkedIn, Seek, Indeed and more',
              'AI-powered interview prep for every role',
              'Automated follow-up reminders',
              'Analytics to understand what\'s working',
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
          <h2>Sign in</h2>
          <p className="auth-sub">Don't have an account? <Link to="/register">Sign up free</Link></p>

          <form onSubmit={handleSubmit} noValidate>
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
                placeholder="••••••••"
                value={form.password} onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign in →'}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}