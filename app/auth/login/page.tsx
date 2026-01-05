"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { LogIn, Github, Mail, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, loginWithUsername, signupWithEmail, signupWithUsername } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
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
      setError(err.message || (isSignUp ? "Signup failed." : "Login failed."));
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.1),_transparent_60%)]"></div>
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-slate-400">
              {isSignUp ? "Start organizing your week today" : "Manage your weekly tasks with ease"}
            </p>
          </div>

          {!isSignUp && (
            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-700/50">
              <button 
                onClick={() => setMethod('google')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${method === 'google' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Google
              </button>
              <button 
                onClick={() => setMethod('username')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${method === 'username' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                User
              </button>
              <button 
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${method === 'email' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
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
                  className="w-full py-4 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all border border-slate-200 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
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
                    <span className="w-full border-t border-slate-800"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or use another method</span>
                  </div>
                </div>
              </div>
            ) : null}

            {isSignUp && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Username (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isSignUp && method === 'username' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {(isSignUp || method === 'email') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {(isSignUp || method === 'email' || method === 'username') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  {!isSignUp && <a href="#" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Forgot password?</a>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  required
                />
              </div>
            )}

            {(isSignUp || method === 'email' || method === 'username') && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-xs text-red-400 text-center font-medium">{error}</p>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <a 
              href="#" 
              onClick={toggleMode}
              className="text-sky-400 font-medium hover:text-sky-300"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
