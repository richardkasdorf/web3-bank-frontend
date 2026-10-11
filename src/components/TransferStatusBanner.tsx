import { useEffect } from 'react';
import { useTransactionStatus } from './hooks/useTransactionStatus';

interface TransferStatusBannerProps {
  txId: string;
  onFinalized: () => void;
}

export default function TransferStatusBanner({ txId, onFinalized }: TransferStatusBannerProps) {
  const status = useTransactionStatus(txId);
  const isComplete = status === 'complete';

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(onFinalized, 7000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onFinalized]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 15px',
      borderRadius: '6px',
      marginBottom: '15px',
      fontSize: '13px',
      backgroundColor: isComplete ? '#e8f5e9' : '#fff3e0',
      color: isComplete ? '#2e7d32' : '#e65100'
    }}>
      <span style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: isComplete ? '#2e7d32' : '#ff4d4d',
        boxShadow: isComplete ? 'none' : '0 0 6px #ff4d4d',
        animation: isComplete ? 'none' : 'pulse 1.2s infinite'
      }} />
      {isComplete ? 'Transaction confirmed!' : 'Pending: Transaction in progress!'}
    </div>
  );
}