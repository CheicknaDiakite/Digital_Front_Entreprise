import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  TextField,
  Chip,
  Paper,
  Typography,
  Grid,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Stack,
  Skeleton
} from '@mui/material';
import { Link } from 'react-router-dom';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded';

import { useFetchEntreprise, useStockEntreprise } from '../../../../../usePerso/fonction.user';
import { useGetAllEntre, useGetAllSortie } from '../../../../../usePerso/fonction.entre';
import { useStoreUuid } from '../../../../../usePerso/store';
import { RecupType } from '../../../../../typescript/DataType';
import { formatNumberWithSpaces } from '../../../../../usePerso/fonctionPerso';

// ───────────────────────────────
// Utils
// ───────────────────────────────
function isLicenceExpired(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ───────────────────────────────
// Custom Hook: Logic Controller
// ───────────────────────────────
const useCompanyStats = (uuid: string | null) => {
  const { stockEntreprise, isLoading: stockLoading, isError: stockError } = useStockEntreprise(uuid || '');
  const { sortiesEntreprise = [] } = useGetAllSortie(uuid!);
  const { entresEntreprise = [] } = useGetAllEntre(uuid!);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  const filteredSorties = useMemo(() => {
    return sortiesEntreprise.filter((item: RecupType) => {
      if (!item.date) return false;
      const itemDate = item.date.split('T')[0];
      if (dateRange.start && itemDate < dateRange.start) return false;
      if (dateRange.end && itemDate > dateRange.end) return false;
      return true;
    });
  }, [sortiesEntreprise, dateRange]);

  const totalCA = useMemo(() => {
    return filteredSorties
      .filter((item) => item.is_remise === false)
      .reduce((acc, row) => acc + (row.qte && row.pu ? row.qte * row.pu : 0), 0);
  }, [filteredSorties]);

  const filteredEntres = useMemo(() => {
    return entresEntreprise.filter((item: RecupType) => {
      if (!item.date) return false;
      const itemDate = item.date.split('T')[0];
      if (dateRange.start && itemDate < dateRange.start) return false;
      if (dateRange.end && itemDate > dateRange.end) return false;
      return true;
    });
  }, [entresEntreprise, dateRange]);

  const totalExpenses = useMemo(() => {
    return filteredEntres.reduce((acc, row) => acc + (row.qte && row.pu_achat ? row.qte * row.pu_achat : 0), 0);
  }, [filteredEntres]);

  const estimatedProfit = totalCA - totalExpenses;
  const isLoss = estimatedProfit < 0;
  const marginPercent = totalCA > 0 ? ((estimatedProfit / totalCA) * 100).toFixed(1) : '0';
  const licenceExpired = unEntreprise ? isLicenceExpired(unEntreprise.licence_date_expiration) : false;

  return {
    loading: stockLoading,
    error: stockError,
    stockEntreprise,
    unEntreprise,
    metrics: { totalCA, totalExpenses, estimatedProfit, isLoss, marginPercent },
    filters: {
      start: dateRange.start,
      end: dateRange.end,
      setStart: (date: string) => setDateRange((prev) => ({ ...prev, start: date })),
      setEnd: (date: string) => setDateRange((prev) => ({ ...prev, end: date })),
      clear: () => setDateRange({ start: '', end: '' }),
      isActive: !!(dateRange.start || dateRange.end)
    },
    licenceExpired
  };
};

export default function EtatProduit() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { loading, error, stockEntreprise, metrics, filters, licenceExpired } = useCompanyStats(uuid);

  const handlePreset = (preset: 'today' | 'month' | 'year' | 'all') => {
    const now = new Date();
    if (preset === 'all') {
      filters.clear();
      return;
    }
    const end = now.toISOString().split('T')[0];
    let start = '';
    if (preset === 'today') {
      start = end;
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
    } else if (preset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      start = firstDay.toISOString().split('T')[0];
    }
    filters.setStart(start);
    filters.setEnd(end);
  };

  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !stockEntreprise) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '16px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()} sx={{ fontWeight: 600 }}>
              Réessayer
            </Button>
          }
        >
          Problème de connexion lors de la récupération des statistiques de stock.
        </Alert>
      </Box>
    );
  }

  const statsCards = [
    {
      title: 'Quantités sorties',
      subtitle: 'Volume total débité',
      value: stockEntreprise.somme_sortie_qte,
      icon: <TrendingDownRoundedIcon />,
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.08),
      border: alpha(theme.palette.error.main, 0.22),
    },
    {
      title: 'Quantités en stock',
      subtitle: 'Volume total réceptionné',
      value: stockEntreprise.somme_entrer_qte,
      icon: <Inventory2RoundedIcon />,
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.08),
      border: alpha(theme.palette.success.main, 0.22),
    },
    {
      title: 'Sorties effectuées',
      subtitle: 'Transactions de vente',
      value: stockEntreprise.nombre_sortie,
      icon: <ShoppingCartRoundedIcon />,
      color: theme.palette.primary.main,
      bg: alpha(theme.palette.primary.main, 0.08),
      border: alpha(theme.palette.primary.main, 0.22),
      link: '/sortie'
    },
    {
      title: 'Entrées effectuées',
      subtitle: 'Opérations de réappro.',
      value: stockEntreprise.nombre_entrer,
      icon: <MoveToInboxRoundedIcon />,
      color: '#06b6d4',
      bg: alpha('#06b6d4', 0.08),
      border: alpha('#06b6d4', 0.22),
      link: '/entre'
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header section */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                p: 1.25,
                borderRadius: '14px',
                color: theme.palette.primary.main,
                display: 'flex'
              }}
            >
              <AssessmentRoundedIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                Performance & Flux de Stock
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Indicateurs financiers et suivi des flux d'entrées et de sorties
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Date Filter Bar & Presets */}
      <Fade in timeout={400}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3.5,
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(8px)',
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.9),
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          {/* Top row: presets and active status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Période d'analyse :
              </Typography>
              {filters.isActive && (
                <Chip
                  label="Filtre personnalisé actif"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                />
              )}
            </Box>

            {/* Quick Presets */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label="Tout"
                size="small"
                onClick={() => handlePreset('all')}
                variant={!filters.isActive ? 'filled' : 'outlined'}
                color={!filters.isActive ? 'primary' : 'default'}
                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
              />
              <Chip
                label="Aujourd'hui"
                size="small"
                onClick={() => handlePreset('today')}
                variant="outlined"
                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
              />
              <Chip
                label="Ce mois"
                size="small"
                onClick={() => handlePreset('month')}
                variant="outlined"
                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
              />
              <Chip
                label="Cette année"
                size="small"
                onClick={() => handlePreset('year')}
                variant="outlined"
                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
              />
            </Stack>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                size="small"
                value={filters.start}
                onChange={(e) => filters.setStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayRoundedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                size="small"
                value={filters.end}
                onChange={(e) => filters.setEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayRoundedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearRoundedIcon />}
                onClick={filters.clear}
                disabled={!filters.isActive}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: 40,
                  color: theme.palette.error.main,
                  borderColor: alpha(theme.palette.error.main, 0.4),
                  '&:hover': {
                    borderColor: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.06)
                  }
                }}
              >
                Effacer
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Financial Metrics Ribbon (3 High-Impact Cards) */}
      <Fade in timeout={500}>
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {/* Chiffre d'Affaires */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '20px',
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, #ffffff 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                borderLeft: `5px solid ${theme.palette.primary.main}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 28px -10px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Chiffre d'Affaires Brut
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.8, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(metrics.totalCA)} <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>F</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.6, display: 'block' }}>
                    Ventes enregistrées (hors remises)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    p: 1.25,
                    borderRadius: '14px',
                    color: theme.palette.primary.main,
                    display: 'flex'
                  }}
                >
                  <AccountBalanceWalletRoundedIcon />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Coût d'Achats */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '20px',
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha('#f59e0b', 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                  : `linear-gradient(135deg, ${alpha('#f59e0b', 0.08)} 0%, #ffffff 100%)`,
                border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                borderLeft: '5px solid #f59e0b',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 28px -10px ${alpha('#f59e0b', 0.3)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Coût des Marchandises (Achats)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.8, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(metrics.totalExpenses)} <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>F</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.6, display: 'block' }}>
                    Cumul des approvisionnements
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha('#f59e0b', 0.12),
                    p: 1.25,
                    borderRadius: '14px',
                    color: '#d97706',
                    display: 'flex'
                  }}
                >
                  <ShoppingBagRoundedIcon />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Bénéfice Estimé & Marge */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '20px',
                background: metrics.isLoss
                  ? theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, #ffffff 100%)`
                  : theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, #ffffff 100%)`,
                border: `1px solid ${metrics.isLoss ? alpha(theme.palette.error.main, 0.25) : alpha(theme.palette.success.main, 0.25)}`,
                borderLeft: `5px solid ${metrics.isLoss ? theme.palette.error.main : theme.palette.success.main}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: metrics.isLoss
                    ? `0 12px 28px -10px ${alpha(theme.palette.error.main, 0.3)}`
                    : `0 12px 28px -10px ${alpha(theme.palette.success.main, 0.3)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: metrics.isLoss ? theme.palette.error.main : theme.palette.success.main,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6
                      }}
                    >
                      {metrics.isLoss ? 'Perte estimée' : 'Bénéfice estimé'}
                    </Typography>
                    {metrics.totalCA > 0 && (
                      <Chip
                        label={`${metrics.isLoss ? '' : '+'}${metrics.marginPercent}%`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: metrics.isLoss ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15),
                          color: metrics.isLoss ? theme.palette.error.main : theme.palette.success.main,
                          borderRadius: '6px'
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.8, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(Math.abs(metrics.estimatedProfit))} <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>F</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.6, display: 'block' }}>
                    {metrics.isLoss ? 'Solde négatif sur la période' : 'Marge commerciale brute estimée'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: metrics.isLoss ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.success.main, 0.12),
                    p: 1.25,
                    borderRadius: '14px',
                    color: metrics.isLoss ? theme.palette.error.main : theme.palette.success.main,
                    display: 'flex'
                  }}
                >
                  {metrics.isLoss ? <TrendingDownRoundedIcon /> : <MonetizationOnRoundedIcon />}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Stock Flow Telemetry (4 Interactive KPI Cards) */}
      <Grid container spacing={2.5}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Zoom in timeout={400 + index * 100}>
              <Paper
                elevation={0}
                component={stat.link && !licenceExpired ? (Link as any) : 'div'}
                to={stat.link || ''}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: stat.link && !licenceExpired ? 'pointer' : 'default',
                  opacity: licenceExpired ? 0.65 : 1,
                  '&:hover': stat.link && !licenceExpired ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px -8px ${stat.color}50`,
                    borderColor: stat.color
                  } : {}
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      bgcolor: alpha(stat.color, 0.15),
                      p: 1.1,
                      borderRadius: '12px',
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {React.cloneElement(stat.icon as React.ReactElement, { sx: { fontSize: 24 } })}
                  </Box>
                  {stat.link && !licenceExpired && (
                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.72rem' }}>
                      Voir liste →
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.3, letterSpacing: '-0.02em' }}>
                    {formatNumberWithSpaces(stat.value ?? 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Licence Expirée Alert */}
      {licenceExpired && (
        <Fade in timeout={700}>
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: theme.palette.warning.main, mt: 0.25, fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.warning.main, mb: 0.5 }}>
                Licence de gestion expirée
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Certaines opérations et accès directs aux formulaires de saisie sont restreints. Veuillez renouveler votre abonnement dans l'onglet <strong>Paramètres</strong> pour débloquer l'ensemble des modules.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
}

