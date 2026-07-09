import React, { useState } from 'react';

interface CreateAccountProps {
  onBackToLogin: () => void;
}

export default function CreateAccount({ onBackToLogin }: CreateAccountProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/accounts/add_accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar a conta.');
      }

      setLoading(false);
      setSuccess('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0070f3' }}></div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>USDC Digital Bank</span>
        </div>
        <button onClick={onBackToLogin} style={navButtonStyle}>Back to Sign In</button>
      </header>

      <div style={contentStyle}>
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Create Account</h2>
          <p style={{ color: '#888893', margin: '0 0 30px 0', fontSize: '14px' }}>Open your new USDC bank account</p>
          
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
              {loading ? 'Criando Conta...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Estilos Compartilhados (Ficou idêntico ao seu modo escuro premium)
const containerStyle: React.CSSProperties = { fontFamily: '-apple-system, sans-serif', minHeight: '100vh', width: '100vw', backgroundColor: '#0a0a0c', color: '#ffffff', display: 'flex', flexDirection: 'column', position: 'absolute', top: 0, left: 0 };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '70px', backgroundColor: 'rgba(18, 18, 22, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #222226', position: 'sticky', top: 0, width: '100%', boxSizing: 'border-box' };
const navButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const contentStyle: React.CSSProperties = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '420px', padding: '40px', border: '1px solid #222226', borderRadius: '12px', backgroundColor: '#121216', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#888893' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', boxSizing: 'border-box', backgroundColor: '#1a1a22', border: '1px solid #33333a', borderRadius: '6px', color: '#ffffff', fontSize: '15px', outline: 'none' };
const errorStyle: React.CSSProperties = { backgroundColor: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' };
const successStyle: React.CSSProperties = { backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', color: '#4caf50', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' };
const submitButtonStyle = (loading: boolean): React.CSSProperties => ({ width: '100%', padding: '14px', backgroundColor: loading ? '#004094' : '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px' });
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#0070f3'; };
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#33333a'; };
