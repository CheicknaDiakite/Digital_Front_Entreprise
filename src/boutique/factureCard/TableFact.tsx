import React from 'react';
import { Typography } from '@mui/material';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso'

interface TableFactProps {
  list: {
    categorie_libelle: string;
    qte: number;
    unite?: string;
    pu: number;
    prix_total: number;
    date: string;
    ref: string;
    mode_paiement?: string;
  }[];
  total: number;
  discountedTotal: number;
  payerTotal: number;
  payDiscount?: number | string;
  printFormat?: string;
  modePaiement?: string;
}

const TableFact: React.FC<TableFactProps> = ({ list, total, discountedTotal, payerTotal, payDiscount, printFormat = 'A4', modePaiement }) => {
  const isThermal = printFormat === 'Thermal';
  const resteAPayer = (total - ((total - discountedTotal) + (Number(payDiscount))));
  const effectiveModePaiement = modePaiement || list?.[0]?.mode_paiement;

  return (
    <div style={{
      borderRadius: isThermal ? 0 : '12px',
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.08)',
      marginBottom: '2rem',
      boxShadow: isThermal ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} className="print-table">
          {/* Table Header */}
          <thead className="print-table-header">
            <tr style={{
              background: isThermal
                ? '#f3f4f6'
                : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderBottom: '2px solid rgba(0,0,0,0.15)',
            }}>
              {[
                { label: 'Désignation', align: 'left' },
                { label: 'Qté', align: 'right' },
                { label: 'P.U', align: 'right' },
                { label: 'Total', align: 'right' },
              ].map((col) => (
                <th
                  key={col.label}
                  style={{
                    textAlign: col.align as 'left' | 'right',
                    padding: isThermal ? '6px 8px' : '14px 20px',
                    color: isThermal ? '#374151' : '#e2e8f0',
                    fontWeight: 700,
                    fontSize: isThermal ? '0.7rem' : '0.8rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRight: col.label !== 'Total' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="print-table-body">
            {list.map((post, index) => (
              <tr
                key={index}
                style={{
                  background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'background 0.15s ease',
                  borderBottom: '1px solid #e2e8f0',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc')}
              >
                <td style={{
                  padding: isThermal ? '5px 8px' : '12px 20px',
                  borderRight: '1px solid #e2e8f0',
                }}>
                  <Typography
                    variant={isThermal ? 'caption' : 'body2'}
                    style={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}
                  >
                    {post.categorie_libelle}
                  </Typography>
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: isThermal ? '5px 8px' : '12px 20px',
                  color: '#475569',
                  fontSize: isThermal ? '0.7rem' : '0.85rem',
                  fontVariantNumeric: 'tabular-nums',
                  borderRight: '1px solid #e2e8f0',
                }}>
                  {post.qte} {post.unite === 'kilos' ? '' : post.unite}
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: isThermal ? '5px 8px' : '12px 20px',
                  color: '#475569',
                  fontSize: isThermal ? '0.7rem' : '0.85rem',
                  fontVariantNumeric: 'tabular-nums',
                  borderRight: '1px solid #e2e8f0',
                }}>
                  {formatNumberWithSpaces(post.pu)}
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: isThermal ? '5px 8px' : '12px 20px',
                  fontWeight: 600,
                  color: '#1e293b',
                  fontSize: isThermal ? '0.7rem' : '0.9rem',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatNumberWithSpaces(post.prix_total)}
                </td>
              </tr>
            ))}

            {/* Sous-total */}
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <td rowSpan={4 + (effectiveModePaiement ? 1 : 0)} style={{ borderRight: '1px solid #e2e8f0' }} />
              <td colSpan={2} style={{
                textAlign: 'right',
                padding: isThermal ? '6px 8px' : '12px 20px',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '0.03em',
                borderRight: '1px solid #e2e8f0',
              }}>
                Sous-total
              </td>
              <td style={{
                textAlign: 'right',
                padding: isThermal ? '6px 8px' : '12px 20px',
                fontWeight: 600,
                color: '#1e293b',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatNumberWithSpaces(total)}
              </td>
            </tr>

            {/* Remise */}
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={2} style={{
                textAlign: 'right',
                padding: isThermal ? '6px 8px' : '12px 20px',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRight: '1px solid #e2e8f0',
              }}>
                Remise
              </td>
              <td style={{
                textAlign: 'right',
                padding: isThermal ? '6px 8px' : '12px 20px',
                fontWeight: 700,
                color: '#dc2626',
                fontVariantNumeric: 'tabular-nums',
              }}>
                – {formatNumberWithSpaces(total - discountedTotal)}
              </td>
            </tr>

            {/* Mode de règlement */}
            {effectiveModePaiement && (
              <tr style={{ background: '#f8fafc' }}>
                <td colSpan={2} style={{
                  textAlign: 'right',
                  padding: isThermal ? '6px 8px' : '12px 20px',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRight: '1px solid #e2e8f0',
                }}>
                  Règlement
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: isThermal ? '6px 8px' : '12px 20px',
                  fontWeight: 700,
                  color: '#4f46e5',
                  fontSize: isThermal ? '0.72rem' : '0.85rem',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {effectiveModePaiement}
                </td>
              </tr>
            )}

            {/* Montant Payé */}
            {(total - payerTotal) > 0 && (
              <tr style={{ background: '#f8fafc' }}>
                <td colSpan={2} style={{
                  textAlign: 'right',
                  padding: isThermal ? '6px 8px' : '12px 20px',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRight: '1px solid #e2e8f0',
                }}>
                  Montant Payé
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: isThermal ? '6px 8px' : '12px 20px',
                  fontWeight: 700,
                  color: '#059669',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatNumberWithSpaces(payDiscount)}
                </td>
              </tr>
            )}

            {/* Total final */}
            <tr style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderTop: '2px solid rgba(0,0,0,0.15)',
            }}>
              <td colSpan={2} style={{
                textAlign: 'right',
                padding: isThermal ? '8px 8px' : '16px 20px',
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,255,255,0.1)',
              }}>
                {resteAPayer > 0 && 'Reste à payer'}
                {resteAPayer === 0 && 'Total'}
                {resteAPayer < 0 && 'Total'}
              </td>
              <td style={{
                textAlign: 'right',
                padding: isThermal ? '8px 8px' : '16px 20px',
                fontWeight: 800,
                color: '#ffffff',
                fontSize: isThermal ? '0.95rem' : '1.2rem',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}>
                {resteAPayer > 0 && formatNumberWithSpaces(resteAPayer)}
                {resteAPayer === 0 && formatNumberWithSpaces(payDiscount)}
                {resteAPayer < 0 && formatNumberWithSpaces(discountedTotal)}
                {' '}F
              </td>
            </tr>
          </tbody>
        </table>

        {/* Badge monnaie à rendre */}
        {resteAPayer < 0 && (
          <div style={{
            margin: '12px 16px',
            padding: '10px 20px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #fbbf24',
            color: '#92400e',
            fontWeight: 700,
            fontSize: '0.85rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            💰 Monnaie à rendre : {formatNumberWithSpaces(Math.abs(resteAPayer))} F
          </div>
        )}
      </div>
    </div>
  );
};

export default TableFact;
