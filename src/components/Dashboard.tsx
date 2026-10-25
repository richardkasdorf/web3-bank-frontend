import { useEffect, useState } from 'react';
import type { UserBalance, Transaction } from '../types';
import TransferForm from './TransferForm';
import CryptoChat from './CryptoChat';
import Header from './Header';
import AccountStatement from './statement/AccountStatement';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [account, setAccount] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Novo estado para controlar a abertura do chat lateral
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const resBalance = await fetch(`${baseUrl}/accounts/balance`, { 
        credentials: 'include' 
      });
      if (resBalance.status === 401) { handleSessionExpired(); return; }
      if (!resBalance.ok) throw new Error(`Erro ao buscar saldo: ${resBalance.status}`);
      const accountData = await resBalance.json();
      setAccount(accountData); 

      // Small DELAY 50ms - Just for browser reorganize threads
      await new Promise(resolve => setTimeout(resolve, 50));

      const resTx = await fetch(`${baseUrl}/accounts/statement`, { 
        credentials: 'include' 
      });
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
    alert("Your session has expired! Please log in again..");
    onLogout();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Loading data...</div>;
  }

  if (apiError) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto', padding: '20px', border: '1px solid red', borderRadius: '8px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3 style={{ color: 'red' }}>⚠️ Server communication failedr</h3>
        <p>{apiError}</p>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to login</button>
      </div>
    );
  }

  const safeBalanceETH = account && account.eth_balance ? Number(account.eth_balance) : 0;
  const safeBalanceUSD = account && account.balance ? Number(account.balance) : 0;
  const blockchainName = account?.blockchain || 'Network not specified';
  const walletAddress = account?.wallet_address || 'Address not generated';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      <Header>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Log Out
        </button>
      </Header>

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        
        <aside style={{
          width: isChatOpen ? '33.33vw' : '60px',
          height: '100%',
          backgroundColor: 'rgba(18, 18, 22, 0.8)',
          borderRight: '1px solid rgba(18, 18, 22, 0.8)',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
            <div style={{ display: isChatOpen ? 'flex' : 'none', flexDirection: 'column', height: '100%', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(18, 18, 22, 0.8)', backgroundColor: 'rgba(18, 18, 22, 0.8)' }}>
                <h3 style={{ margin: 0, fontFamily: 'sans-serif', color: '#ffffff' }}>Crypto Chat AI</h3>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ffffff' }}
                >
                  ❌
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <CryptoChat />
              </div>
            </div>

            <div style={{ 
              display: !isChatOpen ? 'flex' : 'none', 
              width: '100%', 
              justifyContent: 'center', 
              paddingTop: '20px' 
            }}>
              <button onClick={() => setIsChatOpen(true)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}title="Abrir Chat">
                💬
              </button>
            </div>
        </aside>

        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 40px', 
          backgroundColor: '#000102',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'sans-serif' }}>

            <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: '1px 0 0 0', fontSize: '14px', opacity: 0.6 }}>Blockchain Address: {walletAddress}</p>
                <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'rgb(243, 243, 248)', border: 'none', borderRadius: '6px', color: 'black', padding: '7px 11px', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                  {refreshing ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Your balance ({blockchainName})</p>
              </div>
              <h2 style={{ margin: '1px 0 0 0', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="https://cdn3d.iconscout.com/3d/premium/thumb/usdc-coin-3d-icon-png-download-6044475.png?f=webp"
                  alt="USDC Logo" 
                  style={{ width: '36px', height: '35px', objectFit: 'contain' }} 
                />
                <span>
                  {safeBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 18 })} <span style={{ fontSize: '20px' }}>USDC</span>
                </span>
              </h2>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Crypto Wallet ({blockchainName})</p>
              </div>
              <h2 style={{ margin: '1px 0 0 0', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1280px-Ethereum_logo_2014.svg.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
                  alt="ETH Logo" 
                  style={{ width: '36px', height: '32px', objectFit: 'contain' }} 
                />
                <span>
                  {safeBalanceETH.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 18 })} <span style={{ fontSize: '20px' }}>ETH</span>
                </span>
              </h2>
            </div>

            <TransferForm onTransferSuccess={fetchData} />

            <AccountStatement
              transactions={transactions}
              currentUserId={account?.user_id}
              onRefresh={fetchData}
            />
          </div>
        </main>

      </div>
    </div>
  );
}















/* 
import { useEffect, useState } from 'react';
import type { UserBalance, Transaction } from '../types';
import TransferForm from './TransferForm';
import CryptoChat from './CryptoChat';
import Header from './Header';
import AccountStatement from './statement/AccountStatement';
import ethLogo from '../img/eth_logo.png';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [account, setAccount] = useState<UserBalance | null>(null);
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
      const accountData = await resBalance.json();
      setAccount(accountData); 

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

  const safeBalanceETH = account && account.eth_balance ? Number(account.eth_balance) : 0;
  const safeBalanceUSD = account && account.balance ? Number(account.balance) : 0;
  const blockchainName = account?.blockchain || 'Rede não informada';
  const walletAddress = account?.wallet_address || 'Endereço não gerado';

  return (
    <>
      <Header>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair
        </button>
      </Header>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>

        <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: '1px 0 0 0', fontSize: '14px', opacity: 0.6 }}>Endereço: {walletAddress}</p>
            <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'rgba(25, 25, 27, 0.7)', border: 'none', borderRadius: '6px', color: 'white', padding: '7px 11px', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Disponível ({blockchainName})</p>
          </div>
          <h2 style={{ margin: '1px 0 0 0', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="https://cdn3d.iconscout.com/3d/premium/thumb/usdc-coin-3d-icon-png-download-6044475.png?f=webp"
              alt="ETH Logo" 
              style={{ width: '36px', height: '35px', objectFit: 'contain' }} 
            />
            <span>
              {safeBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 18 })} <span style={{ fontSize: '20px' }}>USDC</span>
            </span>
          </h2>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0c0c13 0%, #04366e 100%)', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(119, 130, 141, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Carteira cripto ({blockchainName})</p>
          </div>
          <h2 style={{ margin: '1px 0 0 0', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1280px-Ethereum_logo_2014.svg.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
              alt="ETH Logo" 
              style={{ width: '36px', height: '32px', objectFit: 'contain' }} 
            />
            <span>
              {safeBalanceETH.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 18 })} <span style={{ fontSize: '20px' }}>ETH</span>
            </span>
          </h2>
        </div>

        <TransferForm token={token} onTransferSuccess={fetchData} />

        <AccountStatement
          transactions={transactions}
          currentUserId={account?.user_id}
          onRefresh={fetchData}
        />

        <CryptoChat />
      </div>
    </>
  );
}
*/
