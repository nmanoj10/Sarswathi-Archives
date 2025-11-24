import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { checkUserExists, register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // Basic Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        const exists = await checkUserExists(email);
        if (exists) {
            setError('This email is already registered. Please sign in.');
            setIsLoading(false);
            return;
        }

        const newUser = {
            name,
            email,
            password
        };
        
        const success = await register(newUser);
        if (success) {
            // Auto-redirect to login or allow immediate login
            navigate('/login');
        } else {
            setError("Registration failed. Please try again.");
        }
    } catch (e) {
         setError("An unexpected error occurred. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-arch-bg bg-paper-texture px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-stone-200">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Join the Archives</h1>
          <p className="text-stone-500 mt-2">Create an account to preserve history</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                        placeholder="Jane Scholar"
                    />
                </div>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none transition-all"
                        placeholder="scholar@archives.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Create Password</label>
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
                        minLength={6}
                    />
                </div>
                <p className="text-xs text-stone-500 mt-1">Must be at least 6 characters</p>
            </div>

            <Button type="submit" className="w-full py-2.5 mt-2" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-arch-accent hover:text-arch-accentHover">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};