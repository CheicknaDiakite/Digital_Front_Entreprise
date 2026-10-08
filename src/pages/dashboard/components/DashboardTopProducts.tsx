import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  useTheme,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface TopProductItem {
  id?: string | number;
  libelle: string;
  categorie?: string;
  totalQte: number;
  totalRevenue: number;
}

interface DashboardTopProductsProps {
  products: TopProductItem[];
}

export const DashboardTopProducts: React.FC<DashboardTopProductsProps> = ({ products }) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [mode, setMode] = useState<'revenue' | 'quantity'>('revenue');

  // Tri selon le mode sélectionné
  const sorted = [...products].sort((a, b) =>
    mode === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalQte - a.totalQte
  ).slice(0, 10);

  const maxValue = sorted.length > 0
    ? mode === 'revenue' ? sorted[0].totalRevenue : sorted[0].totalQte
    : 1;

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    if (index === 1) return { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
    if (index === 2) return { icon: '🥉', color: '#d97706', bg: 'rgba(217,119,6,0.15)' };
    return { icon: `#${index + 1}`, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };
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
      {/* Header & Mode Switcher */}
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
                bgcolor: '#f59e0b',
                borderRadius: 4,
              },
            }}
          >
            Top 10 Produits Vendus
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Articles phares sur la période sélectionnée
          </Typography>
        </Box>

        <Tabs
          value={mode}
          onChange={(_, val) => setMode(val)}
          sx={{
            minHeight: 36,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.9)',
            borderRadius: '12px',
            p: 0.4,
            '& .MuiTabs-indicator': {
              bgcolor: '#6366f1',
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
          <Tab label="Par Chiffre d'Affaires" value="revenue" />
          <Tab label="Par Quantités" value="quantity" />
        </Tabs>
      </Box>

      {/* Liste des Top Produits */}
      {sorted.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', mb: 1 }} />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Aucune vente enregistrée sur cette période
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {sorted.map((item, index) => {
            const badge = getRankBadge(index);
            const relativePercent = maxValue > 0
              ? Math.min(100, Math.round(((mode === 'revenue' ? item.totalRevenue : item.totalQte) / maxValue) * 100))
              : 0;

            return (
              <Box
                key={index}
                sx={{
                  p: 1.2,
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.8)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.6)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
                    borderColor: 'rgba(99,102,241,0.3)',
                    transform: 'translateX(3px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        bgcolor: badge.bg,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        flexShrink: 0,
                      }}
                    >
                      {badge.icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 700,
                          color: isDark ? '#ffffff' : '#0f172a',
                          fontSize: '0.88rem',
                        }}
                      >
                        {item.libelle}
                      </Typography>
                      {item.categorie && (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                            fontSize: '0.72rem',
                          }}
                        >
                          {item.categorie}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: mode === 'revenue' ? '#6366f1' : '#10b981',
                        fontSize: '0.88rem',
                      }}
                    >
                      {mode === 'revenue'
                        ? `${formatNumberWithSpaces(item.totalRevenue)} F`
                        : `${formatNumberWithSpaces(item.totalQte)} unités`}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                        fontSize: '0.72rem',
                      }}
                    >
                      {mode === 'revenue'
                        ? `${formatNumberWithSpaces(item.totalQte)} unités`
                        : `${formatNumberWithSpaces(item.totalRevenue)} F`}
                    </Typography>
                  </Box>
                </Box>

                {/* Barre de proportion relative */}
                <LinearProgress
                  variant="determinate"
                  value={relativePercent}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: mode === 'revenue'
                        ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                        : 'linear-gradient(90deg, #10b981, #34d399)',
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};
