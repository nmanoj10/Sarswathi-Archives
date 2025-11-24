import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { User, AlertCircle, ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // views: 'login' | 'forgot-request' | 'forgot-verify'
  const [view, setView] = useState<'login' | 'forgot-request' | 'forgot-verify'>('login');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { checkUserExists, requestOtp, verifyOtp, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!contact || !password) {
        setError('Please enter your email and password.');
        setIsLoading(false);
        return;
    }

    try {
        const success = await login(contact, password);
        if (success) {
            navigate('/gallery');
        } else {
            setError('Invalid credentials. Please check your email and password.');
        }
    } catch (e) {
        setError('An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!contact) {
        setError('Please enter your email address');
        setIsLoading(false);
        return;
    }

    const exists = await checkUserExists(contact);
    if (!exists) {
        setError('Account not found. Please register first.');
        setIsLoading(false);
        return;
    }

    try {
        const code = await requestOtp(contact);
        if (code) {
          setOtp(''); 
          setView('forgot-verify');
        } else {
          setError('Failed to send reset code. Please try again.');
        }
    } catch (err) {
        setError('Failed to send reset code. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      if (verifyOtp(contact, otp)) {
          const success = await resetPassword(contact, newPassword);
          if (success) {
              navigate('/gallery');
          } else {
              setError("Failed to reset password.");
          }
      } else {
          setError("Invalid verification code.");
      }
      setIsLoading(false);
  };

  const renderLoginView = () => (
    <form onSubmit={handleLogin} className="space-y-5">
        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
            </div>
            <input
                type="email"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                placeholder="scholar@archives.com"
            />
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <button 
                    type="button" 
                    onClick={() => {
                        setError('');
                        setView('forgot-request');
                    }}
                    className="text-xs text-arch-accent hover:underline"
                >
                    Forgot Password?
                </button>
            </div>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-400" />
            </div>
            <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                placeholder="********"
            />
            </div>
        </div>

        <Button type="submit" className="w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
    </form>
  );

  const renderForgotRequestView = () => (
    <form onSubmit={handleRequestReset} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
         <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-stone-800">Reset Password</h3>
            <p className="text-sm text-stone-500">Enter your email to receive a verification code.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
            </div>
            <input
                type="email"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                placeholder="scholar@archives.com"
            />
            </div>
        </div>

        <Button type="submit" className="w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
        </Button>

        <button 
            type="button" 
            onClick={() => setView('login')}
            className="w-full text-sm text-stone-500 hover:text-stone-800 py-2"
        >
            Back to Sign In
        </button>
    </form>
  );

  const renderForgotVerifyView = () => (
      <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-stone-800">New Password</h3>
            <p className="text-sm text-stone-500">Enter the code sent to {contact} and your new password.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Verification Code</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-stone-400" />
                </div>
                <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all tracking-widest font-mono"
                    placeholder="XXXXXX"
                    maxLength={6}
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                    placeholder="********"
                    minLength={6}
                />
            </div>
        </div>

        <Button type="submit" className="w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Processing...' : <>Reset & Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>

        <button 
            type="button" 
            onClick={() => {
                setView('forgot-request');
            }}
            className="w-full text-sm text-stone-500 hover:text-stone-800 py-2"
        >
            Back
        </button>
    </form>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-arch-bg bg-paper-texture px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-stone-200">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-stone-500 mt-2">Sign in to access your archives</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {view === 'login' && renderLoginView()}
        {view === 'forgot-request' && renderForgotRequestView()}
        {view === 'forgot-verify' && renderForgotVerifyView()}

        {view === 'login' && (
            <div className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-arch-accent hover:text-arch-accentHover">
                Register here
            </Link>
            </div>
        )}
      </div>
    </div>
  );
};