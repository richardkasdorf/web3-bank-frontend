import { useEffect, useState } from 'react';

export function useTransactionStatus(txId: string) {
  const [status, setStatus] = useState<'pending' | 'complete'>('pending');

  useEffect(() => {
    if (!txId) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const source = new EventSource(`${baseUrl}/transactions/${txId}/stream`);

    source.onmessage = (event) => {
      if (event.data === 'complete') {
        setStatus('complete');
        source.close();
      }
    };

    source.onerror = () => source.close();

    return () => source.close();
  }, [txId]);

  return status;
}