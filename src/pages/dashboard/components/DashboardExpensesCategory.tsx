import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface ExpenseCategorySlice {
  name: string;
  value: number; // Montant total
  count: number;
}

interface DashboardExpensesCategoryProps {
  data: ExpenseCategorySlice[];
}

const EXPENSE_PALETTE = [
  '#f43f5e', // Rose vif
  '#f97316', // Orange
  '#eab308', // Jaune
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Émeraude
  '#64748b', // Slate
  '#d946ef', // Fuchsia
  '#3b82f6', // Bleu
];

export const DashboardExpensesCategory: React.FC<DashboardExpensesCategoryProps> = ({ data }) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const totalExpenses = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(244, 63, 94, 0.25)' : 'rgba(244, 63, 94, 0.18)',
        boxShadow: isDark
          ? '0 8px 30px rgba(0, 0, 0, 0.35)'
          : '0 4px 20px rgba(244, 63, 94, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
                bgcolor: '#f43f5e',
                borderRadius: 4,
              },
            }}
          >
            Répartition des Dépenses par Famille
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Structure des coûts d'exploitation de la période
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f43f5e' }}>
          Total : {formatNumberWithSpaces(totalExpenses)} F
        </Typography>
      </Box>

      {data.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', my: 'auto' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 52, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Aucune dépense enregistrée sur cette période
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ width: '100%', height: 230, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_PALETTE[index % EXPENSE_PALETTE.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as ExpenseCategorySlice;
                        const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0;
                        return (
                          <Box
                            sx={{
                              bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                              backdropFilter: 'blur(12px)',
                              p: 1.2,
                              borderRadius: '12px',
                              border: '1px solid rgba(244,63,94,0.3)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#f43f5e', fontWeight: 800, display: 'block' }}>
                              {formatNumberWithSpaces(item.value)} F ({pct}%)
                            </Typography>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                              {item.count} opération{item.count > 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.88rem', lineHeight: 1.1 }}>
                  {formatNumberWithSpaces(totalExpenses)} F
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.map((item, index) => {
                const color = EXPENSE_PALETTE[index % EXPENSE_PALETTE.length];
                const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0;

                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 0.8,
                      borderRadius: '10px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.8)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                      <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {item.name}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color }}>
                        {pct}%
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', fontSize: '0.68rem' }}>
                        {formatNumberWithSpaces(item.value)} F
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};
