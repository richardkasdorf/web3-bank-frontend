import type { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
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
      boxSizing: 'border-box',
      color: '#ffffff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0070f3' }}></div>
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>WEB3 Bank</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {children}
      </div>
    </header>
  );
}

