import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Grid,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface DistributionSlice {
  name: string;
  value: number; // Montant en FCFA
  count: number; // Nombre de transactions
}

interface DashboardSalesDistributionProps {
  paymentData: DistributionSlice[];
  categoryData: DistributionSlice[];
}

const PALETTE = [
  '#6366f1', // Indigo
  '#10b981', // Émeraude
  '#f59e0b', // Ambre
  '#ec4899', // Rose
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#14b8a6', // Sarcelle
  '#f97316', // Orange
  '#3b82f6', // Bleu
  '#84cc16', // Lime
];

export const DashboardSalesDistribution: React.FC<DashboardSalesDistributionProps> = ({
  paymentData,
  categoryData,
}) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [activeTab, setActiveTab] = useState<'payment' | 'category'>('payment');

  const currentData = activeTab === 'payment' ? paymentData : categoryData;
  const totalValue = currentData.reduce((acc, cur) => acc + (cur.value || 0), 0);

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
      {/* Header & Switcher */}
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
                bgcolor: '#06b6d4',
                borderRadius: 4,
              },
            }}
          >
            Répartition des Ventes
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Part par mode de règlement et par rayon
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 36,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.9)',
            borderRadius: '12px',
            p: 0.4,
            '& .MuiTabs-indicator': {
              bgcolor: '#06b6d4',
              borderRadius: '8px',
              height: '100%',
              zIndex: 0,
            },
            '& .MuiTab-root': {
              minHeight: 32,
              py: 0.5,
              px: 1.5,
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              zIndex: 1,
              color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab label="Modes de Paiement" value="payment" />
          <Tab label="Par Catégorie" value="category" />
        </Tabs>
      </Box>

      {/* Donut Chart & Légende interactive */}
      {currentData.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', my: 'auto' }}>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Aucune donnée de vente pour cette sélection
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ width: '100%', height: 230, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {currentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DistributionSlice;
                        const pct = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
                        return (
                          <Box
                            sx={{
                              bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                              backdropFilter: 'blur(12px)',
                              p: 1.2,
                              borderRadius: '12px',
                              border: '1px solid rgba(99,102,241,0.3)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                              {data.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700, display: 'block' }}>
                              {formatNumberWithSpaces(data.value)} F ({pct}%)
                            </Typography>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                              {data.count} transaction{data.count > 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centre du Donut */}
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.9rem', lineHeight: 1.1 }}>
                  {formatNumberWithSpaces(totalValue)} F
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Liste Légende détaillée */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentData.map((item, index) => {
                const color = PALETTE[index % PALETTE.length];
                const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;

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
