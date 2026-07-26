import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  Divider,
  Fade,
  Zoom,
  InputAdornment
} from '@mui/material';

import { useFetchEntreprise, useStockEntreprise } from '../../../../../usePerso/fonction.user';
import { useGetAllEntre, useGetAllSortie } from '../../../../../usePerso/fonction.entre';
import { useStoreUuid } from '../../../../../usePerso/store';
import { Link } from 'react-router-dom';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import React, { useEffect, useState, useMemo } from 'react';
import { RecupType } from '../../../../../typescript/DataType';
import { formatNumberWithSpaces } from '../../../../../usePerso/fonctionPerso';

import '../../mobile-admin.css';
import { StatCard } from '../../../../../usePerso/useEntreprise';

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

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
  const licenceExpired = unEntreprise ? isLicenceExpired(unEntreprise.licence_date_expiration) : false;

  return {
    loading: stockLoading,
    error: stockError,
    stockEntreprise,
    unEntreprise,
    metrics: { totalCA, totalExpenses, estimatedProfit, isLoss },
    filters: {
      start: dateRange.start,
      end: dateRange.end,
      setStart: (date: string) => setDateRange(prev => ({ ...prev, start: date })),
      setEnd: (date: string) => setDateRange(prev => ({ ...prev, end: date })),
      clear: () => setDateRange({ start: '', end: '' }),
      isActive: !!(dateRange.start || dateRange.end)
    },
    licenceExpired
  };
};

// ───────────────────────────────
// Component
// ───────────────────────────────
export default function EtatProduit() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { loading, error, stockEntreprise, metrics, filters, licenceExpired } = useCompanyStats(uuid);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Chargement des statistiques...</Typography>
      </Box>
    );
  }

  if (error || !stockEntreprise) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: '12px' }}
          action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Réessayer</Button>}
        >
          Problème de connexion. Veuillez rafraîchir la page.
        </Alert>
      </Box>
    );
  }

  const statsCards = [
    {
      title: 'Quantités sorties',
      value: stockEntreprise.somme_sortie_qte,
      icon: <TrendingDownIcon />,
      color: '#ef4444',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      border: 'rgba(239, 68, 68, 0.2)',
      iconBg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      title: 'Quantités en stock',
      value: stockEntreprise.somme_entrer_qte,
      icon: <InventoryIcon />,
      color: '#10b981',
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: 'rgba(16, 185, 129, 0.2)',
      iconBg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Sorties effectuées',
      value: stockEntreprise.nombre_sortie,
      icon: <ShoppingCartIcon />,
      color: '#3b82f6',
      bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      border: 'rgba(59, 130, 246, 0.2)',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      link: '/sortie'
    },
    {
      title: 'Entrées effectuées',
      value: stockEntreprise.nombre_entrer,
      icon: <TrendingUpIcon />,
      color: '#06b6d4',
      bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      border: 'rgba(6, 182, 212, 0.2)',
      iconBg: 'rgba(6, 182, 212, 0.1)',
      link: '/entre'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      
      {/* Header */}
      <Fade in timeout={400}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1.25, borderRadius: '12px', color: '#3b82f6' }}>
              <AssessmentIcon />
            </Box>
            <Box>
              <Typography 
              variant="h5" 
              sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                Statistiques
              </Typography>
              <Typography variant="caption" className="text-gray-300">
                Vue d'ensemble et indicateurs de performance
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Date Filters */}
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarTodayIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
            <Typography 
            variant="subtitle2" 
            sx={{ fontWeight: 700 }}
            >
              Période d'analyse
            </Typography>
            {filters.isActive && (
              <Chip 
                label="Filtre actif" 
                size="small" 
                sx={{ 
                  ml: 0.5, 
                  bgcolor: 'rgba(59, 130, 246, 0.1)', 
                  color: '#2563eb', 
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22
                }} 
              />
            )}
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
                      <CalendarTodayIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    // bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#cbd5e1' },
                    '&:hover fieldset': { borderColor: '#94a3b8' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
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
                      <CalendarTodayIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    // bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#cbd5e1' },
                    '&:hover fieldset': { borderColor: '#94a3b8' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={filters.clear}
                disabled={!filters.isActive}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#ef4444',
                  borderColor: '#fca5a5',
                  '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.04)' },
                  '&.Mui-disabled': { borderColor: '#e2e8f0' }
                }}
              >
                Effacer
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Financial Metrics */}
      <Fade in timeout={600}>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Chiffre d'Affaires */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px -10px rgba(59, 130, 246, 0.3)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Chiffre d'Affaires
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a', mt: 0.5, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(metrics.totalCA)} F
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3b82f6', mt: 0.5, display: 'block' }}>
                    Total des ventes (hors remises)
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <LocalAtmIcon />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Prix d'Achats */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px -10px rgba(245, 158, 11, 0.3)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Prix d'achats
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#78350f', mt: 0.5, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(metrics.totalExpenses)} F
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b45309', mt: 0.5, display: 'block' }}>
                    Total des sommes des prix d'achats
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)', color: '#d97706' }}>
                  <LocalAtmIcon />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Bénéfice / Perte */}
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                background: metrics.isLoss
                  ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: metrics.isLoss
                  ? '1px solid rgba(239, 68, 68, 0.2)'
                  : '1px solid rgba(16, 185, 129, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { 
                  transform: 'translateY(-3px)', 
                  boxShadow: metrics.isLoss 
                    ? '0 12px 24px -10px rgba(239, 68, 68, 0.3)'
                    : '0 12px 24px -10px rgba(16, 185, 129, 0.3)' 
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: metrics.isLoss ? '#991b1b' : '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {metrics.isLoss ? 'Perte estimée' : 'Bénéfice estimé'}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: metrics.isLoss ? '#7f1d1d' : '#14532d', mt: 0.5, fontFamily: 'monospace' }}>
                    {formatNumberWithSpaces(Math.abs(metrics.estimatedProfit))} F
                  </Typography>
                  <Typography variant="caption" sx={{ color: metrics.isLoss ? '#dc2626' : '#15803d', mt: 0.5, display: 'block' }}>
                    {metrics.isLoss ? 'La société est en perte' : 'La société est en profit'}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: metrics.isLoss ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 4px 12px rgba(16, 185, 129, 0.15)', color: metrics.isLoss ? '#ef4444' : '#10b981' }}>
                  {metrics.isLoss ? <TrendingDownIcon /> : <TrendingUpIcon />}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Activity Stats Grid */}
      <Grid container spacing={2}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Zoom in timeout={600 + index * 100}>
              <Paper
                elevation={0}
                component={stat.link && !licenceExpired ? Link as any : 'div'}
                to={stat.link || ''}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: stat.link && !licenceExpired ? 'pointer' : 'default',
                  opacity: licenceExpired ? 0.6 : 1,
                  '&:hover': stat.link && !licenceExpired ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px -8px ${stat.color}40`,
                  } : {}
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
                  <Box sx={{ bgcolor: stat.iconBg, p: 1, borderRadius: '10px', color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(stat.icon as React.ReactElement, { sx: { fontSize: { xs: 22, sm: 26 } } })}
                  </Box>
                  <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: { xs: 'center', sm: 'left' }, fontSize: '0.7rem' }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stat.value?.toLocaleString() ?? 0}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Licence Expirée */}
      {licenceExpired && (
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: '16px',
              bgcolor: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}
          >
            <WarningAmberIcon sx={{ color: '#f59e0b', mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400e', mb: 0.5 }}>
                Licence expirée
              </Typography>
              <Typography variant="body2" sx={{ color: '#78350f' }}>
                Certaines fonctionnalités sont désactivées. Veuillez renouveler votre licence pour continuer à utiliser toutes les fonctionnalités.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      )}
    </Container>
  );
}
