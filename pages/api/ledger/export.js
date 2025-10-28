import { query } from '../../../lib/db';
import { getWalletFromRequest } from '../../../lib/auth';

/**
 * Export points ledger for transparency
 * Returns CSV of all points transactions for a wallet or all users (admin)
 * This allows users to independently verify their points history
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, format = 'csv' } = req.query;
  const authenticatedWallet = getWalletFromRequest(req);

  // If wallet param provided, verify it matches authenticated wallet (or admin)
  if (wallet && wallet !== authenticatedWallet) {
    // In production, add admin check here
    return res.status(403).json({ error: 'Unauthorized - can only export your own ledger' });
  }

  try {
    let ledgerQuery;
    let params = [];

    if (wallet) {
      // Export for specific wallet
      ledgerQuery = `
        SELECT
          pl.id,
          pl.wallet,
          pl.delta,
          pl.reason,
          pl.battle_id,
          b.token_a,
          b.token_b,
          ta.symbol as token_a_symbol,
          tb.symbol as token_b_symbol,
          pl.hmac,
          pl.created_at
        FROM points_ledger pl
        LEFT JOIN battles b ON pl.battle_id = b.id
        LEFT JOIN tokens ta ON b.token_a = ta.mint
        LEFT JOIN tokens tb ON b.token_b = tb.mint
        WHERE pl.wallet = $1
        ORDER BY pl.created_at ASC
      `;
      params = [wallet];
    } else if (authenticatedWallet) {
      // Export for authenticated user
      ledgerQuery = `
        SELECT
          pl.id,
          pl.wallet,
          pl.delta,
          pl.reason,
          pl.battle_id,
          b.token_a,
          b.token_b,
          ta.symbol as token_a_symbol,
          tb.symbol as token_b_symbol,
          pl.hmac,
          pl.created_at
        FROM points_ledger pl
        LEFT JOIN battles b ON pl.battle_id = b.id
        LEFT JOIN tokens ta ON b.token_a = ta.mint
        LEFT JOIN tokens tb ON b.token_b = tb.mint
        WHERE pl.wallet = $1
        ORDER BY pl.created_at ASC
      `;
      params = [authenticatedWallet];
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await query(ledgerQuery, params);

    if (format === 'json') {
      return res.status(200).json({
        wallet: wallet || authenticatedWallet,
        totalEntries: result.rows.length,
        totalPoints: result.rows.reduce((sum, row) => sum + parseInt(row.delta, 10), 0),
        ledger: result.rows,
      });
    }

    // CSV export
    const csv = generateCSV(result.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="points-ledger-${wallet || authenticatedWallet}-${Date.now()}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting ledger:', error);
    return res.status(500).json({ error: 'Failed to export ledger' });
  }
}

function generateCSV(rows) {
  const headers = [
    'ID',
    'Wallet',
    'Delta',
    'Reason',
    'Battle ID',
    'Token A',
    'Token B',
    'HMAC',
    'Timestamp',
  ];

  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const values = [
      row.id,
      row.wallet,
      row.delta,
      row.reason,
      row.battle_id || '',
      row.token_a_symbol || '',
      row.token_b_symbol || '',
      row.hmac,
      new Date(row.created_at).toISOString(),
    ];

    // Escape commas and quotes in CSV
    const escapedValues = values.map((val) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });

    csvRows.push(escapedValues.join(','));
  }

  return csvRows.join('\n');
}
