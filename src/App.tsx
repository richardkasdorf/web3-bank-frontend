import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateAccount from './components/CreateAccount'; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      await fetch(`${apiUrl}/logout`, { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (err) {
      console.error("Error logging out of the server", err);
    } finally {
      setIsAuthenticated(false);
      setCurrentView('login');
    }
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentView === 'register') {
    return <CreateAccount onBackToLogin={() => setCurrentView('login')} />;
  }

  return (
    <Login 
      onLoginSuccess={() => setIsAuthenticated(true)} 
      onCreateAccountClick={() => setCurrentView('register')}
    />
  );
}
