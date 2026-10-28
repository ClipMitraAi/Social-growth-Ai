import React from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { User, UsageQuota, UserPreferences } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { user: User; quota: UsageQuota; preferences: UserPreferences }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = React.useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [forgotSent, setForgotSent] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res);
        onClose();
      } else if (mode === 'register') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const res = await api.register(email, password, name);
        onSuccess(res);
        onClose();
      } else if (mode === 'forgot') {
        await api.login(email, 'dummy'); // triggers reset link path
        setForgotSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'creator' | 'admin') => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-3xl border border-slate-800 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Sign In to Social Growth AI' : mode === 'register' ? 'Create Your Account' : 'Recover Account Password'}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access saved creator profiles, custom AI outputs, and calendars.'
              : mode === 'register'
              ? 'Start with 10 daily audits and 15 AI content generations for free.'
              : 'Enter your registered email address to receive a secure reset link.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-3">
            <p>Password recovery instructions dispatched. Please check your inbox.</p>
            <button
              onClick={() => {
                setForgotSent(false);
                setMode('login');
              }}
              className="text-xs text-indigo-400 underline font-semibold"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    required
                    className="w-full bg-slate-900 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-900 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full bg-slate-900 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo One-Click Sign Ins */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <span className="text-[11px] text-slate-400 block text-center font-medium">
            Instant One-Click Demo Access:
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('creator')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-[11px]">Creator Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-[11px]">Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('register')} className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
