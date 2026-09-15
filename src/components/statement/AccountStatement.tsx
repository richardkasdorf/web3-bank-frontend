import { useState, useMemo } from 'react';
import type { Transaction } from '../../types';

interface AccountStatementProps {
  transactions: Transaction[];
  currentUserId: number | string | undefined;
  onRefresh: () => Promise<void>;
}

export default function AccountStatement({ transactions, currentUserId }: AccountStatementProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [transactions]);

  const displayedTransactions = useMemo(() => {
    if (!startDate && !endDate) {
      return sortedTransactions.slice(0, 5);
    }
    return sortedTransactions.filter(tx => {
      if (!tx.created_at) return false;
      const txDate = new Date(tx.created_at);
      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
      return true;
    });
  }, [sortedTransactions, startDate, endDate]);

  const clearFilter = () => { setStartDate(''); setEndDate(''); };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Extrato da Conta</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', margin: '15px 0', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>De</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Até</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        {(startDate || endDate) && (
          <button onClick={clearFilter} style={{ padding: '8px 14px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
            Limpar filtro
          </button>
        )}
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
        {displayedTransactions.length === 0 ? (
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
              {displayedTransactions.map(tx => {
                if (!tx) return null;
                const isDeposit = tx.type ? tx.type.toLowerCase() : '';
                const isIncoming = isDeposit === 'deposit' || (isDeposit === 'transfer' && tx.to_account_id === currentUserId);
                const safeAmount = tx.amount ? Number(tx.amount) : 0;

                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {isIncoming ? '➕ Depósito' : '➖ Transferência'}
                      </div>
                      {tx.tx_hash ? (
                        <div
                          title={tx.tx_hash}
                          onClick={() => copyHash(tx.tx_hash!)}
                          style={{
                            fontSize: '11px',
                            color: copiedHash === tx.tx_hash ? '#2e7d32' : '#999',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            fontWeight: copiedHash === tx.tx_hash ? 'bold' : 'normal',
                            transition: 'color 0.2s'
                          }}
                        >
                          {copiedHash === tx.tx_hash ? '✅ Hash copiado!' : `${tx.tx_hash.substring(0, 10)}... 📋`}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>Interna</div>
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
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
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
    </div>
  );
}