import React, { useState, useEffect } from 'react';
import TransferStatusBanner from './TransferStatusBanner';

interface TransferFormProps {
  token: string;
  onTransferSuccess: () => void; 
}

export default function TransferForm({ token, onTransferSuccess }: TransferFormProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const ACTIVE_TX_TTL_MS = 10 * 60 * 1000;

  const [activeTxId, setActiveTxId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('activeTxId');
    const savedAt = localStorage.getItem('activeTxIdSavedAt');
    if (savedId && savedAt && Date.now() - Number(savedAt) < ACTIVE_TX_TTL_MS) {
      return savedId;
    }
    localStorage.removeItem('activeTxId');
    localStorage.removeItem('activeTxIdSavedAt');
    return null;
  });

  useEffect(() => {
    if (activeTxId) {
      localStorage.setItem('activeTxId', activeTxId);
      localStorage.setItem('activeTxIdSavedAt', String(Date.now()));
    } else {
      localStorage.removeItem('activeTxId');
      localStorage.removeItem('activeTxIdSavedAt');
    }
  }, [activeTxId]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // AJUSTE SEGURO: Substitui vírgula por ponto caso o usuário digite no padrão PT-BR (ex: 0,00005)
    const normalizedAmount = amount.replace(',', '.');
    const numericAmount = Number(normalizedAmount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage({ type: 'error', text: 'O valor da transferência deve ser maior que zero.' });
      setLoading(false);
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const response = await fetch(`${baseUrl}/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          amount: numericAmount, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao realizar transferência.');
      }

      const data = await response.json();
      setActiveTxId(data.circle_transaction_id);

      setDestination('');
      setAmount('');
      onTransferSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao conectar ao servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '1px solid #eef0f2', marginBottom: '30px', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Transferir USDC</h3>

      {message && (
        <div style={{ padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee', color: message.type === 'success' ? '#2e7d32' : '#c62828' }}>
          {message.text}
        </div>
      )}

      {activeTxId && (
        <TransferStatusBanner
          txId={activeTxId}
          token={token}
          onFinalized={() => setActiveTxId(null)}
        />
      )}

      <form onSubmit={handleTransfer}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Destinatário:</label>
          <input
            type="text"
            placeholder="Nº da conta (ex: 588306) ou endereço Wallet (0x...)"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Valor (USDC):</label>
          <input
            type="number"
            step="0.000001"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9bc5f4' : '#2775CA', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Processando transação...' : 'Confirmar Transferência'}
        </button>
      </form>
    </div>
  );
}