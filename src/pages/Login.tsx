import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { login } from '../store/authSlice';
import logo from '../assets/logo.png';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import './Login.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authError = useSelector((state: RootState) => state.auth.error);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const validateEmail = (value: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!email) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Not a valid email.');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }
    if (!valid) return;
    dispatch(login({ email, password }));
  };

  // Only disable the button while loading; validations occur on submit
  const isButtonDisabled = authStatus === 'loading';

  return (
    <div className="login-container">
      <div className="login-left">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2 className='main-heading'>Welcome back</h2>
          <p className='main-paragraph text-center'>Step into our shopping metaverse for an unforgettable shopping experience</p>
          {authError && <div className="error">{authError}</div>}
          <div className="form-group">
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" aria-hidden="true" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
            </div>
            {emailError && <div className="error">{emailError}</div>}
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
              />
            </div>
            {passwordError && <div className="error">{passwordError}</div>}
          </div>
        <button type="submit" className="login-button" disabled={isButtonDisabled}>
          {authStatus === 'loading' ? 'Logging in...' : 'Login'}
        </button>
        <div className="signup-text">
          Don't have an account? <span className="fake-link">Sign up</span>
        </div>
        </form>
      </div>
      <div className="login-right">
       <div className="login-logo-stack">
        <img src={logo1} alt="Logo Base" className="logo-layer logo-base" />
        <img src={logo} alt="Logo Overlay" className="logo-layer logo-top" />
        <img src={logo2} alt="Logo Text" className="logo-layer logo-text" />
      </div>
      </div>
    </div>
  );
};

export default LoginPage;