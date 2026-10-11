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
        <h3 style={{ margin: 0 }}>Account Statement</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', margin: '15px 0', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        {(startDate || endDate) && (
          <button onClick={clearFilter} style={{ padding: '8px 14px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
            Clean filters
          </button>
        )}
      </div>

      <div style={{ border: '1px solid #b8c1c9', borderRadius: '8px', overflow: 'hidden' }}>
        {displayedTransactions.length === 0 ? (
          <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>No transactions found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#b8c1c9', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px', color: '#525353' }}>Type / Hash</th>
                <th style={{ padding: '12px', color: '#525353' }}>Amount</th>
                <th style={{ padding: '12px', color: '#525353' }}>Date</th>
              </tr>
            </thead>

            <tbody>
              {displayedTransactions.map(tx => {
                if (!tx) return null;

                const typeLower = tx.type ? tx.type.toLowerCase() : '';
                const safeAmount = tx.amount ? Number(tx.amount) : 0;
                const isDeposit = typeLower.startsWith('deposit');
                const isWithdraw = typeLower.startsWith('withdraw');
                const isIncoming = isDeposit || (typeLower === 'transfer' && tx.to_account_id === currentUserId);
                let typeLabel = '';
                const tokenName = typeLower.includes('eth') ? 'ETH' : 'USDC';

                if (isDeposit) {
                  typeLabel = `➕ Deposit ${tokenName}`;
                } else if (isWithdraw) {
                  typeLabel = `➖ Withdraw ${tokenName}`;
                } else if (typeLower === 'transfer') {
                  typeLabel = isIncoming ? '➕ Transfer Received' : '➖ Transfer Sent';
                } else {
                  typeLabel = `${isIncoming ? '➕' : '➖'} ${tx.type}`;
                }

                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {typeLabel}
                      </div>
                      {tx.tx_hash ? (
                        <div
                          title={tx.tx_hash}
                          onClick={() => copyHash(tx.tx_hash!)}
                          style={{ fontSize: '12px', color: '#666', cursor: 'pointer', fontFamily: 'monospace', marginTop: '4px' }}
                        >
                          {copiedHash === tx.tx_hash ? '✅ Hash copiado!' : `${tx.tx_hash.substring(0, 10)}... 📋 Copy Hash transaction`}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>Interna</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: isIncoming ? '#2e7d32' : '#c62828' }}>
                      {isIncoming ? '+' : '-'} {safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {tokenName}
                    </td>
                    <td style={{ padding: '12px', color: '#8d8d8d', fontSize: '14px' }}>
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')}
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