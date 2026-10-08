import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface SellerPerformanceItem {
  userId?: number | string | null;
  username: string;
  totalSales: number;
  totalRevenue: number;
}

interface DashboardSellerPerformanceProps {
  sellers: SellerPerformanceItem[];
}

export const DashboardSellerPerformance: React.FC<DashboardSellerPerformanceProps> = ({ sellers }) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const sorted = [...sellers].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const maxRevenue = sorted.length > 0 ? sorted[0].totalRevenue : 1;

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
                bgcolor: '#ec4899',
                borderRadius: 4,
              },
            }}
          >
            Performance de l’Équipe
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Contribution des vendeurs au chiffre d'affaires
          </Typography>
        </Box>
      </Box>

      {sorted.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', my: 'auto' }}>
          <BadgeIcon sx={{ fontSize: 52, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Aucun historique de vente par collaborateur sur cette période
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sorted.map((seller, index) => {
            const pct = maxRevenue > 0 ? Math.min(100, Math.round((seller.totalRevenue / maxRevenue) * 100)) : 0;
            const avg = seller.totalSales > 0 ? Math.round(seller.totalRevenue / seller.totalSales) : 0;

            return (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.8)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.6)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: index === 0 ? '#ec4899' : index === 1 ? '#8b5cf6' : '#6366f1',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                      }}
                    >
                      {seller.username.slice(0, 2).toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {seller.username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                        {seller.totalSales} vente{seller.totalSales > 1 ? 's' : ''} · Panier moyen : {formatNumberWithSpaces(avg)} F
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ec4899' }}>
                      {formatNumberWithSpaces(seller.totalRevenue)} F
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                      #{index + 1}
                    </Typography>
                  </Box>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
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
