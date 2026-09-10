import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  onCreateAccountClick: () => void;
}

export default function Login({ onLoginSuccess, onCreateAccountClick }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(false);
    setError('');
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isNaN(Number(username.trim()))) {
      setError('O número da conta deve conter apenas números.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'ngrok-skip-browser-warning': 'true'
        },
        body: new URLSearchParams({ 
          username: username.trim(), 
          password: password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Número de conta ou senha incorretos.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      onLoginSuccess(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      minHeight: '100vh', 
      width: '100vw', 
      backgroundColor: '#0a0a0c', 
      color: '#ffffff',
      margin: 0, 
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute', 
      top: 0,
      left: 0
    }}>
      {/* HEADER DE PONTA A PONTA */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        height: '70px',
        backgroundColor: 'rgba(18, 18, 22, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #222226',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0070f3' }}></div>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>USDC Digital Bank</span>
        </div>

        <button 
          onClick={onCreateAccountClick} // Aciona a mudança de tela no App.tsx
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e5e5';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Create Account
        </button>
      </header>

      {/* ÁREA CENTRALIZADA DO LOGIN */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ 
          width: '100%',
          maxWidth: '420px', 
          padding: '40px', 
          border: '1px solid #222226', 
          borderRadius: '12px', 
          backgroundColor: '#121216', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 600 }}>Sign In</h2>
          <p style={{ color: '#888893', margin: '0 0 30px 0', fontSize: '14px' }}>Access account test</p>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#888893', fontWeight: 500 }}>User</label>
              <input 
                type="text" 
                placeholder="000000"
                value={username} 
                onChange={e => { setUsername(e.target.value); if (error) setError(''); }} 
                required 
                style={inputStyle} 
                onFocus={(e) => e.currentTarget.style.borderColor = '#0070f3'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#33333a'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#888893', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={e => { setPassword(e.target.value); if (error) setError(''); }} 
                required 
                style={inputStyle} 
                onFocus={(e) => e.currentTarget.style.borderColor = '#0070f3'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#33333a'}
              />
            </div>

            <button 
              type="submit" 
              /*disabled={loading}*/ 
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: loading ? '#004094' : '#0070f3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#1a85ff'; }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#0070f3'; }}
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', 
  padding: '12px', 
  boxSizing: 'border-box',
  backgroundColor: '#1a1a22',
  border: '1px solid #33333a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s'
};
