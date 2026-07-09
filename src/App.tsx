import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateAccount from './components/CreateAccount'; 

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  // Estado para alternar entre as telas de Login e Cadastro quando o usuário deslogado
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentView('login'); // Garante que volta para o login ao deslogar
  };

  // 1. Se o usuário estiver logado (tem token), exibe o Dashboard
  if (token) {
    return <Dashboard token={token} onLogout={handleLogout} />;
  }

  // 2. Se não tem token e a tela atual for 'register', exibe o Cadastro
  if (currentView === 'register') {
    return <CreateAccount onBackToLogin={() => setCurrentView('login')} />;
  }

  // 3. Caso contrário, exibe a tela de Login com a ação para abrir o cadastro
  return (
    <Login 
      onLoginSuccess={(savedToken) => setToken(savedToken)} 
      onCreateAccountClick={() => setCurrentView('register')}
    />
  );
}
