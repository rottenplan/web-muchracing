'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset logic
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Container */}
        <div className="w-full flex justify-center mb-8">
          <Link href="/" className="relative w-[300px] h-[100px] group">
            <h1 className="sr-only">Much Racing</h1>
            <img
              src="/logo.png"
              alt="Much Racing Logo"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div className="carbon-bg backdrop-blur-md border border-border-color rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-primary text-white py-4 px-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <h2 className="text-xl font-racing text-center">RESET PASSWORD</h2>
          </div>

          {/* Content */}
          <div className="p-8">
            {!isSubmitted ? (
              <>
                <p className="text-text-secondary text-sm mb-6 text-center italic">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background-secondary border border-border-color rounded-lg px-4 py-3 pr-12 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
                        placeholder="Enter your registered email"
                        required
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-white font-racing px-8 py-3 rounded-lg transition shadow-lg hover:shadow-xl shadow-primary/20"
                    >
                      SEND RESET LINK
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success Message */
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-racing text-white mb-2 tracking-wide">CHECK YOUR EMAIL</h3>
                <p className="text-text-secondary text-sm mb-6">
                  We've sent a password reset link to <br />
                  <span className="text-primary font-bold">{email}</span>
                </p>
                <p className="text-text-secondary/60 text-xs">
                  Didn't receive the email? <br /> Check your spam folder or try again.
                </p>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-border-color">
              <Link
                href="/login"
                className="flex items-center justify-center space-x-2 text-primary hover:text-primary-hover transition group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-racing text-xs">BACK TO SIGN IN</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-text-secondary text-xs opacity-50">
            © Copyright 2024. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
