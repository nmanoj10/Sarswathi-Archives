import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path ? "text-arch-accent font-semibold" : "text-stone-600 hover:text-stone-900";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-arch-bg/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-arch-accent" />
          <span className="font-serif text-xl font-bold text-stone-900">Saraswati Archives</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/gallery" className={isActive('/gallery')}>Gallery</Link>
          <Link to="/about" className={isActive('/about')}>About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-stone-700">
                <div className="h-8 w-8 rounded-full bg-arch-accent/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-arch-accent" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-stone-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Join Archives</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};