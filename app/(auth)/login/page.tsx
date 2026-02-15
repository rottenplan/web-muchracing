'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, UserPlus, AlertCircle, Zap } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Allowed characters: 0-9, a-z, A-Z, ! # $ % & ' ( ) * + , – . @ : ; =
  const ALLOWED_PASSWORD_CHARS = /^[0-9a-zA-Z!#$%&'()*+,\-.@:;=]*$/;

  const validatePassword = (password: string): string => {
    if (!password) return '';
    if (!ALLOWED_PASSWORD_CHARS.test(password)) {
      return 'Password contains invalid characters. Only allowed: 0-9, a-z, A-Z, ! # $ % & \' ( ) * + , – . @ : ; =';
    }
    return '';
  };

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    setPasswordError(validatePassword(value));
  };


  const router = useRouter();

  // Handle Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setError('');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.ok ? await res.json() : null;

      if (data?.success) {
        setResendCooldown(60); // 1 minute cooldown
        setError(''); // clear any old errors
        alert('A new verification code has been sent to your email.');
      } else {
        setError(data?.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (activeTab === 'register') {
      const passError = validatePassword(formData.password);
      if (passError) {
        setPasswordError(passError);
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      // Use distinct endpoints for sign in and registration
      const endpoint = activeTab === 'signin' ? '/api/auth/login' : '/api/auth/register';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: activeTab === 'register' ? formData.name : undefined,
          username: activeTab === 'register' ? formData.username : undefined
        })
      });

      const data = await res.json();
      console.log('Reg/Login Response:', data);

      console.log('Reg/Login Response:', data);

      if (res.ok && data.success) {
        if (data.requiresVerification) {
          setIsVerifying(true);
          setLoading(false);
          return;
        }

        // Set cookie (valid for 7 days)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}`;

        // Redirect to dashboard (only if verified/success)
        router.push('/dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please check server.');
    } finally {
      if (!isVerifying) setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Set cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}`;
        router.push('/setup-device');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo Container */}
      <div className="w-full flex justify-center mb-8">
        <Link href="/" className="relative w-[600px] h-[200px] group">
          <h1 className="sr-only">Much Racing</h1>
          <img
            src="/logo.png"
            alt="Much Racing Logo"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="carbon-bg backdrop-blur-md border border-border-color rounded-xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-border-color">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition font-racing text-sm ${activeTab === 'signin'
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                : 'bg-background-secondary text-text-secondary hover:text-foreground'
                }`}
            >
              <User className="w-5 h-5" />
              <span>SIGN IN</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition font-racing text-sm ${activeTab === 'register'
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                : 'bg-background-secondary text-text-secondary hover:text-foreground'
                }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>REGISTER</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {isVerifying ? (
              /* Verification Form */
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-racing text-white mb-2">VERIFY EMAIL</h3>
                  <p className="text-text-secondary text-sm">
                    We've sent a 6-digit code to <br />
                    <span className="text-foreground font-medium">{formData.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-3 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-primary focus:outline-none focus:border-primary transition"
                    placeholder="000000"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-racing py-4 rounded-lg transition shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="w-full bg-background-secondary hover:bg-white/5 text-text-secondary hover:text-foreground font-racing py-3 rounded-lg border border-border-color transition disabled:opacity-50 text-xs"
                  >
                    {resendCooldown > 0 ? `SEND AGAIN (${resendCooldown}s)` : 'SEND AGAIN'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsVerifying(false)}
                    className="text-text-secondary hover:text-foreground text-sm transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'signin' ? (
                  /* Sign In Form */
                  <>
                    {/* Username/Email Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Username or Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Enter your username or email"
                          required
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-text-secondary text-sm font-medium">
                          Password
                        </label>
                        <Link href="/forgot-password" className="text-primary hover:text-primary-hover text-sm transition">
                          Lost Password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Enter your password"
                          required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                    </div>

                    {/* Sign In Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-hover text-white font-racing px-8 py-3 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {loading ? 'SIGNING IN...' : 'SIGN IN'}
                      </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center pt-4 border-t border-border-color">
                      <p className="text-text-secondary text-sm">
                        Don't have an account yet?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('register')}
                          className="text-primary hover:text-primary-hover font-racing transition"
                        >
                          REGISTER
                        </button>
                      </p>
                    </div>
                  </>
                ) : (
                  /* Register Form */
                  <>
                    {/* Name Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Enter your full name"
                          required
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                    </div>

                    {/* Username Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Choose a username"
                          required
                        />
                        <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                      <p className="text-text-secondary text-[10px] mt-1 italic">
                        Alphanumeric, underscores, and dots only.
                      </p>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Enter your email"
                          required
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className={`w-full bg-background-secondary border rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none transition ${passwordError ? 'border-warning focus:border-warning' : 'border-border-color focus:border-primary'
                            }`}
                          placeholder="Create a password"
                          required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                      {passwordError && (
                        <div className="flex items-start gap-2 mt-2 text-warning text-xs">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                      <p className="text-text-secondary text-xs mt-2">
                        Allowed: 0-9, a-z, A-Z, ! # $ % &amp; ' ( ) * + , – . @ : ; =
                      </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                          placeholder="Confirm your password"
                          required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      </div>
                    </div>

                    {/* WiFi Notice */}
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                      <p className="text-primary text-xs">
                        <strong>Note:</strong> Your device requires WiFi connection. If your WiFi password contains unsupported characters, create a 2.4 GHz hotspot with a compatible password.
                      </p>
                    </div>

                    {/* Register Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!!passwordError || loading}
                        className="bg-primary hover:bg-primary-hover disabled:bg-background-secondary disabled:cursor-not-allowed text-white font-racing px-8 py-3 rounded-lg transition shadow-lg hover:shadow-xl"
                      >
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                      </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center pt-4 border-t border-border-color">
                      <p className="text-text-secondary text-sm">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signin')}
                          className="text-primary hover:text-primary-hover font-racing transition"
                        >
                          SIGN IN
                        </button>
                      </p>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-warning text-sm">{error}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-text-secondary text-sm">
            © Copyright 2024. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
