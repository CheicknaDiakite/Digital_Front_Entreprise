import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface MonthlyTrendPoint {
  monthKey: string; // e.g. "2024-01"
  label: string;    // e.g. "Jan 24"
  revenue: number;
  expenses: number;
  netProfit: number;
}

interface DashboardTrendChartProps {
  data: MonthlyTrendPoint[];
  canViewFinancials?: boolean;
}

export const DashboardTrendChart: React.FC<DashboardTrendChartProps> = ({
  data,
  canViewFinancials = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [activeCurve, setActiveCurve] = useState<'all' | 'revenue' | 'expenses' | 'profit'>('all');

  // Totaux globaux sur la période du graphique
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalExpenses = data.reduce((sum, d) => sum + (d.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  const showRevenue = activeCurve === 'all' || activeCurve === 'revenue';
  const showExpenses = canViewFinancials && (activeCurve === 'all' || activeCurve === 'expenses');
  const showProfit = canViewFinancials && (activeCurve === 'all' || activeCurve === 'profit');

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
      {/* Header avec Titre et Filtres de Courbes */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.05rem', sm: '1.2rem' },
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              '&::before': {
                content: '""',
                width: 4,
                height: 18,
                bgcolor: '#6366f1',
                borderRadius: 4,
              },
            }}
          >
            Tendance Financière (12 derniers mois)
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b', mt: 0.3 }}>
            Évolution croisée du Chiffre d'Affaires, des Charges et de la Marge Nette
          </Typography>
        </Box>

        {/* Boutons de sélection de courbes */}
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="Toutes"
            size="small"
            clickable
            onClick={() => setActiveCurve('all')}
            sx={{
              fontWeight: 700,
              bgcolor: activeCurve === 'all' ? '#6366f1' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
              color: activeCurve === 'all' ? '#ffffff' : isDark ? 'rgba(255,255,255,0.8)' : '#475569',
            }}
          />
          <Chip
            label="Chiffre d’Affaires"
            size="small"
            clickable
            onClick={() => setActiveCurve('revenue')}
            sx={{
              fontWeight: 700,
              bgcolor: activeCurve === 'revenue' ? '#6366f1' : isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
              color: activeCurve === 'revenue' ? '#ffffff' : '#6366f1',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          />
          {canViewFinancials && (
            <>
              <Chip
                label="Dépenses"
                size="small"
                clickable
                onClick={() => setActiveCurve('expenses')}
                sx={{
                  fontWeight: 700,
                  bgcolor: activeCurve === 'expenses' ? '#f43f5e' : isDark ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.1)',
                  color: activeCurve === 'expenses' ? '#ffffff' : '#f43f5e',
                  border: '1px solid rgba(244,63,94,0.3)',
                }}
              />
              <Chip
                label="Bénéfice Net"
                size="small"
                clickable
                onClick={() => setActiveCurve('profit')}
                sx={{
                  fontWeight: 700,
                  bgcolor: activeCurve === 'profit' ? '#10b981' : isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                  color: activeCurve === 'profit' ? '#ffffff' : '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              />
            </>
          )}
        </Stack>
      </Box>

      {/* Mini-Badges Totaux de la Tendance */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#6366f1' }} />
          <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
            Total CA : <strong>{formatNumberWithSpaces(totalRevenue)} F</strong>
          </Typography>
        </Box>

        {canViewFinancials && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f43f5e' }} />
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                Total Charges : <strong>{formatNumberWithSpaces(totalExpenses)} F</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                Marge Nette Cumulée : <strong style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>{formatNumberWithSpaces(totalProfit)} F</strong>
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Graphique Recharts */}
      <Box sx={{ flex: 1, width: '100%', minHeight: { xs: 260, sm: 340 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
              axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              tickLine={false}
            />

            <YAxis
              stroke={isDark ? '#94a3b8' : '#64748b'}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
              axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              tickLine={false}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return val;
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Box
                      sx={{
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(14px)',
                        p: 1.5,
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        minWidth: 180,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {label}
                      </Typography>
                      {payload.map((item: any, idx: number) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#475569', fontWeight: 600 }}>
                              {item.name} :
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: item.color }}>
                            {formatNumberWithSpaces(item.value)} F
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                }
                return null;
              }}
            />

            {showRevenue && (
              <Area
                type="monotone"
                dataKey="revenue"
                name="Chiffre d’Affaires"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradientRevenue)"
              />
            )}

            {showExpenses && (
              <Area
                type="monotone"
                dataKey="expenses"
                name="Dépenses"
                stroke="#f43f5e"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#gradientExpenses)"
              />
            )}

            {showProfit && (
              <Area
                type="monotone"
                dataKey="netProfit"
                name="Bénéfice Net"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradientProfit)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
