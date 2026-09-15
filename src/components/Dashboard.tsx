import { useEffect, useState } from 'react';
import type { UserBalance, Transaction } from '../types';
import TransferForm from './TransferForm';
import CryptoChat from './CryptoChat';
import Header from './Header';
import AccountStatement from './statement/AccountStatement';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const resBalance = await fetch(`${baseUrl}/accounts/balance`, { headers });
      if (resBalance.status === 401) { handleSessionExpired(); return; }
      if (!resBalance.ok) throw new Error(`Erro ao buscar saldo: ${resBalance.status}`);
      setBalance(await resBalance.json());

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
    if (token) fetchData();
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
    <>
      <Header>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair
        </button>
      </Header>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>

        <div style={{ background: 'linear-gradient(135deg, #2775CA 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Disponível ({blockchainName})</p>
            <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'rgba(35, 52, 202, 0.7)', border: 'none', borderRadius: '6px', color: 'white', padding: '6px 10px', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold' }}>
            {safeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <span style={{ fontSize: '20px' }}>USDC</span>
          </h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.6 }}>Endereço: {walletAddress}</p>
        </div>

        <TransferForm token={token} onTransferSuccess={fetchData} />

        <AccountStatement
          transactions={transactions}
          currentUserId={balance?.user_id}
          onRefresh={fetchData}
        />

        <CryptoChat />
      </div>
    </>
  );
}