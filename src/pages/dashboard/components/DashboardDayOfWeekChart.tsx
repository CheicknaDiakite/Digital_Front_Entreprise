import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface DayOfWeekData {
  dayName: string; // "Lundi", "Mardi", etc.
  revenue: number;
  count: number;
}

interface DashboardDayOfWeekChartProps {
  data: DayOfWeekData[];
}

export const DashboardDayOfWeekChart: React.FC<DashboardDayOfWeekChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // Trouver le jour avec le plus fort CA pour le mettre en valeur
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const bestDay = data.find((d) => d.revenue === maxRevenue && maxRevenue > 0);

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
                bgcolor: '#8b5cf6',
                borderRadius: 4,
              },
            }}
          >
            Activité par Jour de Semaine
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Flux commercial pour organiser vos plannings d'équipe
          </Typography>
        </Box>

        {bestDay && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.15)',
              color: '#8b5cf6',
              px: 1.2,
              py: 0.5,
              borderRadius: '10px',
              fontWeight: 700,
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            Pic d'activité : <strong>{bestDay.dayName}</strong>
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, width: '100%', minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}
              vertical={false}
            />

            <XAxis
              dataKey="dayName"
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DayOfWeekData;
                  return (
                    <Box
                      sx={{
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(12px)',
                        p: 1.2,
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {item.dayName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 800, display: 'block' }}>
                        CA : {formatNumberWithSpaces(item.revenue)} F
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                        {item.count} vente{item.count > 1 ? 's' : ''} enregistrée{item.count > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="revenue" name="Chiffre d’Affaires" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => {
                const isTop = entry.revenue === maxRevenue && maxRevenue > 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isTop ? '#8b5cf6' : isDark ? 'rgba(139, 92, 246, 0.45)' : 'rgba(139, 92, 246, 0.55)'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
