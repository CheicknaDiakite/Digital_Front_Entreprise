import React, { ReactNode } from 'react';
import {
  Box,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { useAppSettings } from '../../themes/AppSettingsContext';

export type DatePreset = 'all' | 'today' | '7d' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (start: string, end: string) => void;
  extraFilters?: ReactNode;
  onReset?: () => void;
  showPresets?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  startDate = '',
  endDate = '',
  onDateRangeChange,
  extraFilters,
  onReset,
  showPresets = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // Determine which preset matches current dates
  const activePreset: DatePreset = React.useMemo(() => {
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

    const yearStart = format(startOfYear(now), 'yyyy-MM-dd');
    if (startDate === yearStart && (endDate === todayStr || endDate === format(now, 'yyyy-12-31'))) return 'this_year';

    return 'custom';
  }, [startDate, endDate]);

  const handleApplyPreset = (preset: DatePreset) => {
    if (!onDateRangeChange) return;
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    switch (preset) {
      case 'all':
        onDateRangeChange('', '');
        break;
      case 'today':
        onDateRangeChange(todayStr, todayStr);
        break;
      case '7d':
        onDateRangeChange(format(subDays(now, 7), 'yyyy-MM-dd'), todayStr);
        break;
      case 'this_month':
        onDateRangeChange(format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last_month': {
        const prev = subMonths(now, 1);
        onDateRangeChange(format(startOfMonth(prev), 'yyyy-MM-dd'), format(endOfMonth(prev), 'yyyy-MM-dd'));
        break;
      }
      case 'this_year':
        onDateRangeChange(format(startOfYear(now), 'yyyy-MM-dd'), todayStr);
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = Boolean(searchTerm || startDate || endDate);

  const handleResetAll = () => {
    onSearchChange('');
    if (onDateRangeChange) onDateRangeChange('', '');
    if (onReset) onReset();
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(14px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.03)',
      }}
    >
      <Stack spacing={1.5}>
        {/* Row 1: Search + Dates + Reset */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* Search Field */}
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flex: 1,
              maxWidth: { md: 360 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Date range inputs */}
          {onDateRangeChange && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <CalendarMonthIcon sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 20, display: { xs: 'none', sm: 'block' } }} />
              <TextField
                type="date"
                size="small"
                label="Du"
                value={startDate}
                onChange={(e) => onDateRangeChange(e.target.value, endDate)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: 'calc(50% - 4px)', sm: 145 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
                  },
                }}
              />
              <TextField
                type="date"
                size="small"
                label="Au (inclus)"
                value={endDate}
                onChange={(e) => onDateRangeChange(startDate, e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: 'calc(50% - 4px)', sm: 145 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
                  },
                }}
              />

              {hasActiveFilters && (
                <Tooltip title="Réinitialiser les filtres">
                  <Button
                    size="small"
                    variant="text"
                    color="secondary"
                    onClick={handleResetAll}
                    startIcon={<FilterAltOffIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      ml: { xs: 0, sm: 1 },
                    }}
                  >
                    {!isMobile && 'Effacer'}
                  </Button>
                </Tooltip>
              )}
            </Stack>
          )}

          {extraFilters && <Box>{extraFilters}</Box>}
        </Stack>

        {/* Row 2: Date presets chips */}
        {showPresets && onDateRangeChange && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              overflowX: 'auto',
              py: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
            }}
          >
            {[
              { id: 'all', label: 'Toutes les dates' },
              { id: 'today', label: "Aujourd'hui" },
              { id: '7d', label: '7 derniers jours' },
              { id: 'this_month', label: 'Ce mois' },
              { id: 'last_month', label: 'Mois dernier' },
              { id: 'this_year', label: 'Cette année' },
            ].map((p) => {
              const selected = activePreset === p.id;
              return (
                <Chip
                  key={p.id}
                  label={p.label}
                  size="small"
                  clickable
                  onClick={() => handleApplyPreset(p.id as DatePreset)}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: selected ? 700 : 500,
                    fontSize: '0.75rem',
                    bgcolor: selected
                      ? isDark
                        ? 'rgba(99, 102, 241, 0.25)'
                        : 'rgba(99, 102, 241, 0.15)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    color: selected ? (isDark ? '#c7d2fe' : '#4338ca') : isDark ? '#94a3b8' : '#64748b',
                    border: '1px solid',
                    borderColor: selected
                      ? isDark
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'rgba(99, 102, 241, 0.3)'
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.12)',
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default FilterBar;
