import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { RecupType } from '../../../typescript/DataType';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

interface DashboardRecentSalesTableProps {
  sales: RecupType[];
}

export const DashboardRecentSalesTable: React.FC<DashboardRecentSalesTableProps> = ({ sales }) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();

  const recentSales = sales.slice(0, 10);

  const getPaymentChip = (mode?: string) => {
    const m = (mode || 'Caisse').toLowerCase();
    if (m.includes('wave')) return { label: 'Wave', color: '#06b6d4' };
    if (m.includes('orange')) return { label: 'Orange Money', color: '#f97316' };
    if (m.includes('moov')) return { label: 'Moov Money', color: '#3b82f6' };
    if (m.includes('carte')) return { label: 'Carte', color: '#8b5cf6' };
    return { label: 'Espèces', color: '#10b981' };
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)',
        boxShadow: isDark
          ? '0 8px 30px rgba(0, 0, 0, 0.35)'
          : '0 4px 20px rgba(99, 102, 241, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          pb: 1.5,
          mb: 1.5,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                width: 4,
                height: 18,
                bgcolor: '#3b82f6',
                borderRadius: 4,
              },
            }}
          >
            Dernières Ventes Enregistrées
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Flux des encaissements en direct
          </Typography>
        </Box>

        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/sortie')}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: '#6366f1',
          }}
        >
          Voir tout le journal
        </Button>
      </Box>

      {/* Content */}
      {recentSales.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', my: 'auto' }}>
          <ReceiptLongIcon sx={{ fontSize: 52, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Aucune vente récente enregistrée
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 340 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Date & Heure</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Client / Article</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Paiement</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Montant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSales.map((sale, idx) => {
                const dateStr = sale.date || (sale as any).created_at || '';
                const payment = getPaymentChip(sale.mode_paiement);
                const total = sale.prix_total ?? ((sale.qte || 1) * (sale.pu || 0));

                return (
                  <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'block' }}>
                        {dateStr ? dateStr.slice(0, 10) : '--'}
                      </Typography>
                      {dateStr.length > 10 && (
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', fontSize: '0.68rem' }}>
                          {dateStr.slice(11, 16)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {sale.client || sale.clientName || 'Client Comptant'}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                        {sale.libelle || 'Vente directe'} {sale.qte ? `(${sale.qte} ${sale.unite || 'pcs'})` : ''}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={payment.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: `${payment.color}18`,
                          color: payment.color,
                          border: `1px solid ${payment.color}35`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatNumberWithSpaces(total)} F
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
