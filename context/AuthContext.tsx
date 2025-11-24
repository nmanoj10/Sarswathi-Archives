
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  requestOtp: (contact: string) => Promise<string | null>;
  verifyOtp: (contact: string, code: string) => boolean;
  login: (contact: string, password?: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  resetPassword: (contact: string, newPass: string) => Promise<boolean>;
  logout: () => void;
  checkUserExists: (contact: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeOtps, setActiveOtps] = useState<Record<string, string>>({});

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      updateLastActivity();
    }
  }, []);

  // Update last activity timestamp
  const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  // Auto-logout logic
  useEffect(() => {
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      const currentUser = localStorage.getItem('currentUser');
      
      if (currentUser && lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity, 10);
        const TEN_MINUTES = 10 * 60 * 1000;
        
        if (inactiveTime > TEN_MINUTES) {
          logout();
          alert("You have been logged out due to inactivity.");
        }
      }
    };

    const intervalId = setInterval(checkInactivity, 60000); // Check every minute

    const handleUserInteraction = () => {
      if (user) updateLastActivity();
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, [user]);

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const requestOtp = async (contact: string): Promise<string | null> => {
    const otp = generateOtp();
    setActiveOtps(prev => ({ ...prev, [contact]: otp }));
    
    // Simulate network delay for sending email/SMS
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real production app, this is where you would call your backend API (e.g. Twilio/SendGrid).
    // Since this is a client-side demo, we simulate the delivery to the user's "device" via an alert.
    alert(`[Message Service]\n\nSent to: ${contact}\nFrom: Saraswati Archives\n\nYour verification code is: ${otp}`);
    
    return otp;
  };

  const verifyOtp = (contact: string, code: string): boolean => {
    if (activeOtps[contact] === code) {
      const newOtps = { ...activeOtps };
      delete newOtps[contact];
      setActiveOtps(newOtps);
      return true;
    }
    return false;
  };

  const checkUserExists = async (contact: string): Promise<boolean> => {
    const user = await db.users.findOne({ 
      [contact.includes('@') ? 'email' : 'phoneNumber']: contact 
    });
    return !!user;
  };

  const login = async (contact: string, password?: string): Promise<boolean> => {
    // Query by email OR phone
    const allUsers = await db.users.find({});
    const foundUser = allUsers.find(u => u.email === contact || u.phoneNumber === contact);
    
    if (foundUser) {
      if (password && foundUser.password !== password) {
        return false;
      }

      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      updateLastActivity();
      return true;
    }
    return false;
  };

  const register = async (newUser: Omit<User, 'id'>): Promise<boolean> => {
    const userWithId = { ...newUser, id: Date.now().toString() };
    return await db.users.insertOne(userWithId);
  };

  const resetPassword = async (contact: string, newPass: string): Promise<boolean> => {
    const allUsers = await db.users.find({});
    const foundUser = allUsers.find(u => u.email === contact || u.phoneNumber === contact);
    
    if (foundUser) {
      const success = await db.users.updateOne({ id: foundUser.id }, { password: newPass });
      if (success) {
          const updatedUser = { ...foundUser, password: newPass };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          updateLastActivity();
          return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastActivity');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      requestOtp, 
      verifyOtp, 
      login, 
      register, 
      resetPassword,
      logout,
      checkUserExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
