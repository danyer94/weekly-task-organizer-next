"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { Mail, User, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, loginWithUsername, signupWithEmail, signupWithUsername } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Tabs: 'google', 'email', 'username'
  const [method, setMethod] = useState<'google' | 'email' | 'username'>('google');
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (username.trim()) {
          await signupWithUsername(username, email, password);
        } else {
          await signupWithEmail(email, password);
        }
      } else {
        if (method === 'google') {
          await loginWithGoogle();
        } else if (method === 'email') {
          await loginWithEmail(email, password);
        } else if (method === 'username') {
          await loginWithUsername(username, password);
        }
      }
      router.push("/");
    } catch (err: any) {
      const fallbackMessage = isSignUp
        ? "We couldn't create your account. Please try again."
        : "We couldn't sign you in. Please check your details and try again.";
      setError(getAuthErrorMessage(err, fallbackMessage));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
    setError(null);
    if (!isSignUp) setMethod('email'); // Default to email for signup
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(820px_circle_at_14%_-12%,_rgba(96,165,250,0.16),_transparent_60%),radial-gradient(720px_circle_at_88%_-8%,_rgba(59,130,246,0.14),_transparent_58%)]"></div>
      <div className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-45 bg-[linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:160px_160px]"></div>
      <div className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(circle_at_50%_0%,_rgba(96,165,250,0.2),_transparent_44%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel border border-border-subtle/70 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-main/60 border border-border-subtle rounded-2xl mb-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-border-brand" />
            </div>
            <h1 className="text-3xl font-semibold text-text-primary mb-2 tracking-tight">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-text-secondary">
              {isSignUp ? "Start organizing your week today" : "Manage your weekly tasks with ease"}
            </p>
          </div>

          {!isSignUp && (
            <div className="flex bg-bg-main/60 p-1 rounded-xl mb-8 border border-border-subtle/70">
              <button 
                onClick={() => setMethod('google')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  method === 'google'
                    ? 'bg-bg-surface text-text-primary shadow-sm border border-border-subtle/70'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Google
              </button>
              <button 
                onClick={() => setMethod('username')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  method === 'username'
                    ? 'bg-bg-surface text-text-primary shadow-sm border border-border-subtle/70'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                User
              </button>
              <button 
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  method === 'email'
                    ? 'bg-bg-surface text-text-primary shadow-sm border border-border-subtle/70'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Email
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignUp && method === 'google' ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 px-4 bg-bg-surface/90 hover:bg-bg-surface text-text-primary font-semibold rounded-2xl transition-colors border border-border-subtle shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" /> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-subtle"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-surface px-2 text-text-tertiary">Or use another method</span>
                  </div>
                </div>
              </div>
            ) : null}

            {isSignUp && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Username (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      name="username"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="w-full bg-bg-surface/80 border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-border-brand/40 focus:border-border-brand transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isSignUp && method === 'username' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      name="username"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="w-full bg-bg-surface/80 border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-border-brand/40 focus:border-border-brand transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {(isSignUp || method === 'email') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      name="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="w-full bg-bg-surface/80 border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-border-brand/40 focus:border-border-brand transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {(isSignUp || method === 'email' || method === 'username') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-xs text-border-brand hover:text-text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    name="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    autoCapitalize="none"
                    className="w-full bg-bg-surface/80 border border-border-subtle rounded-2xl py-4 pl-4 pr-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-border-brand/40 focus:border-border-brand transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {(isSignUp || method === 'email' || method === 'username') && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-sapphire-700 hover:bg-sapphire-600 text-white font-semibold rounded-2xl transition-colors transition-transform shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" /> : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-4" role="alert">
                <p className="text-xs text-red-600 text-center font-medium">{error}</p>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-text-tertiary">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-border-brand font-medium hover:text-text-primary"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
