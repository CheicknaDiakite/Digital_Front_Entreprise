import React from 'react';
import {
  Box,
  Chip,
  Paper,
  TextField,
  Typography,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export type DashboardPreset = 'today' | '7d' | 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';

export interface DashboardPeriodSelectorProps {
  startDate: string;
  endDate: string;
  onChangeRange: (start: string, end: string) => void;
}

export const DashboardPeriodSelector: React.FC<DashboardPeriodSelectorProps> = ({
  startDate,
  endDate,
  onChangeRange,
}) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // Active preset detection
  const activePreset: DashboardPreset = React.useMemo(() => {
    if (!startDate && !endDate) return 'all';
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    if (startDate === todayStr && endDate === todayStr) return 'today';

    const sevenDaysAgoStr = format(subDays(now, 7), 'yyyy-MM-dd');
    if (startDate === sevenDaysAgoStr && endDate === todayStr) return '7d';

    const thisMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const thisMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    if (startDate === thisMonthStart && (endDate === thisMonthEnd || endDate === todayStr)) return 'this_month';

    const prevMonth = subMonths(now, 1);
    const lastMonthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd');
    if (startDate === lastMonthStart && endDate === lastMonthEnd) return 'last_month';

    const thisYearStart = format(startOfYear(now), 'yyyy-MM-dd');
    if (startDate === thisYearStart && (endDate === todayStr || endDate === format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd'))) return 'this_year';

    return 'custom';
  }, [startDate, endDate]);

  const handleSelectPreset = (preset: DashboardPreset) => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    switch (preset) {
      case 'today':
        onChangeRange(todayStr, todayStr);
        break;
      case '7d':
        onChangeRange(format(subDays(now, 7), 'yyyy-MM-dd'), todayStr);
        break;
      case 'this_month':
        onChangeRange(format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last_month': {
        const prev = subMonths(now, 1);
        onChangeRange(format(startOfMonth(prev), 'yyyy-MM-dd'), format(endOfMonth(prev), 'yyyy-MM-dd'));
        break;
      }
      case 'this_year':
        onChangeRange(format(startOfYear(now), 'yyyy-MM-dd'), todayStr);
        break;
      case 'all':
        onChangeRange('', '');
        break;
      case 'custom':
        // Keep current or set to this month if empty
        if (!startDate) {
          onChangeRange(format(startOfMonth(now), 'yyyy-MM-dd'), todayStr);
        }
        break;
    }
  };

  const presets: { id: DashboardPreset; label: string }[] = [
    { id: 'today', label: "Aujourd'hui" },
    { id: '7d', label: '7 derniers jours' },
    { id: 'this_month', label: 'Ce mois-ci' },
    { id: 'last_month', label: 'Mois dernier' },
    { id: 'this_year', label: 'Cette année' },
    { id: 'all', label: 'Tout l’historique' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: '18px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)',
        boxShadow: isDark
          ? '0 6px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(99, 102, 241, 0.06)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      {/* Boutons de présélections */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 0.5 }}>
          <CalendarMonthIcon sx={{ color: '#6366f1', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
            Période :
          </Typography>
        </Box>

        {presets.map((p) => {
          const isSelected = activePreset === p.id;
          return (
            <Chip
              key={p.id}
              label={p.label}
              onClick={() => handleSelectPreset(p.id)}
              clickable
              size="small"
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                transition: 'all 0.2s ease',
                bgcolor: isSelected
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(241, 245, 249, 0.85)',
                color: isSelected ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.85)' : '#475569',
                backgroundColor: isSelected ? '#6366f1' : undefined,
                border: '1px solid',
                borderColor: isSelected
                  ? '#6366f1'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(226, 232, 240, 0.8)',
                '&:hover': {
                  bgcolor: isSelected ? '#4f46e5' : isDark ? 'rgba(99, 102, 241, 0.18)' : '#e0e7ff',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Date Pickers & Reset */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
        <TextField
          type="date"
          label="Du"
          size="small"
          value={startDate}
          onChange={(e) => onChangeRange(e.target.value, endDate)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: { xs: 135, sm: 145 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.8rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
            },
          }}
        />
        <TextField
          type="date"
          label="Au"
          size="small"
          value={endDate}
          onChange={(e) => onChangeRange(startDate, e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: { xs: 135, sm: 145 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.8rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
            },
          }}
        />

        {(startDate || endDate) && (
          <Tooltip title="Réinitialiser (Tout l'historique)">
            <IconButton
              size="small"
              onClick={() => handleSelectPreset('all')}
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: '#ef4444', color: '#ffffff' },
              }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
};
