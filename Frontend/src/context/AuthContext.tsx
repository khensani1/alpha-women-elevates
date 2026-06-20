import React, { createContext, useContext, useState, useEffect } from 'react';

// Define a simple structure so the rest of your components don't crash
interface AuthContextType {
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We mock a null user and false loading state so the UI bypasses Firebase checks
  const [user] = useState<any>(null);
  const [loading] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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