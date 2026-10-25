import React, { useState, useEffect } from 'react';
import Header from './Header';

interface LoginProps {
  onLoginSuccess: () => void;
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

  if (!/^\d+$/.test(username.trim())) {
    setError('Account must have only numbers.');
    setLoading(false);
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: new URLSearchParams({
        username: username.trim(),
        password: password,
      }),
    });

    if (!response.ok) {
      let detail = 'Account or password incorrect.';
      try {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') detail = errorData.detail;
      } catch {
      }
      throw new Error(detail);
    }

    onLoginSuccess();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
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
      {/* HEADER */}
      <Header>
        <button 
          onClick={onCreateAccountClick}
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
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e5e5e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Create Account
        </button>
      </Header>

      {/* LOGIN CENTER AREA*/}
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
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 600 }}>Login information</h2>
          <p style={{ color: '#888893', margin: '0 0 30px 0', fontSize: '14px' }}>** Test environment **</p>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#888893', fontWeight: 500 }}>Account number</label>
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
              {loading ? 'Authenticating...' : 'Login'}
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
