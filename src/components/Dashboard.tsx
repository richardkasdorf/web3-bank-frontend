import React, { useEffect, useState } from 'react';
import type { UserBalance, Transaction } from '../types';
import TransferForm from './TransferForm';
import CryptoChat from './CryptoChat';


interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const resBalance = await fetch(`${baseUrl}/accounts/balance`, { headers });
      if (resBalance.status === 401) { handleSessionExpired(); return; }
      if (!resBalance.ok) throw new Error(`Erro ao buscar saldo: ${resBalance.status}`);
      const dataBalance = await resBalance.json();
      setBalance(dataBalance);

      const resTx = await fetch(`${baseUrl}/accounts/statement`, { headers });
      if (!resTx.ok) throw new Error(`Erro ao buscar extrato: ${resTx.status}`);
      const dataTx = await resTx.json();
      setTransactions(Array.isArray(dataTx) ? dataTx : []);

    } catch (error: any) {
      console.error("Erro na API:", error);
      setApiError(error.message || "Erro desconhecido ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    alert("Sua sessão expirou! Por favor, faça login novamente.");
    onLogout();
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);


  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Carregando dados do banco...</div>;
  }

  if (apiError) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto', padding: '20px', border: '1px solid red', borderRadius: '8px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3 style={{ color: 'red' }}>⚠️ Falha na Comunicação com o Servidor</h3>
        <p>{apiError}</p>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Voltar para o Login</button>
      </div>
    );
  }


  const safeBalance = balance && balance.balance ? Number(balance.balance) : 0;
  const blockchainName = balance?.blockchain || 'Rede não informada';
  const walletAddress = balance?.wallet_address || 'Endereço não gerado';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Minha Conta Circle 💲</h1>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
      </header>

      {/* Card de Saldo USDC */}
      <div style={{ background: 'linear-gradient(135deg, #2775CA 0%, #1A4F8B 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(39, 117, 202, 0.3)' }}>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Disponível ({blockchainName})</p>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold' }}>

          {safeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <span style={{ fontSize: '20px' }}>USDC</span>
        </h2>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.6 }}>Endereço: {walletAddress}</p>
      </div>

      <TransferForm token={token} onTransferSuccess={fetchData} />

      {/* Lista de Transações */}
      <h3>Extrato da Conta</h3>
      <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
        {transactions.length === 0 ? (
          <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>Nenhuma transação encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px' }}>Tipo / Hash</th>
                <th style={{ padding: '12px' }}>Valor</th>
                <th style={{ padding: '12px' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                if (!tx) return null;
                const isDeposit = tx.type ? tx.type.toLowerCase() : '';
                
                const isIncoming = isDeposit === 'deposit' || (isDeposit === 'transfer' && tx.to_account_id === balance?.user_id);
                const safeAmount = tx.amount ? Number(tx.amount) : 0;

                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {isIncoming ? '➕ Depósito' : '➖ Transferência'}
                      </div>
                      {tx.tx_hash ? (
                        <div style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                          {tx.tx_hash.substring(0, 10)}...
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>
                          Interna
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: isIncoming ? '#2e7d32' : '#c62828' }}>
                      {isIncoming ? '+' : '-'} {safeAmount < 0.01 ? safeAmount.toFixed(6) : safeAmount.toFixed(2)} USDC
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                      {tx.created_at ? (() => {

                        const dateStr = String(tx.created_at).endsWith('Z') || String(tx.created_at).includes('+')
                          ? tx.created_at 
                          : `${tx.created_at}Z`;

                        return new Date(dateStr).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Sao_Paulo' 
                        });
                      })() : '---'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <CryptoChat />
    </div>

  );
}
