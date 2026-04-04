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
  Fade,
  Zoom
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import React, { useEffect, useState, useMemo, cloneElement, isValidElement } from 'react';
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

  // Filter Sorties
  const filteredSorties = useMemo(() => {
    return sortiesEntreprise.filter((item: RecupType) => {
      if (!item.date) return false;
      const itemDate = item.date.split('T')[0];
      if (dateRange.start && itemDate < dateRange.start) return false;
      if (dateRange.end && itemDate > dateRange.end) return false;
      return true;
    });
  }, [sortiesEntreprise, dateRange]);

  // Calculate Revenue (CA)
  const totalCA = useMemo(() => {
    return filteredSorties
      .filter((item) => item.is_remise === false)
      .reduce((acc, row) => acc + (row.qte && row.pu ? row.qte * row.pu : 0), 0);
  }, [filteredSorties]);

  // Filter Entrees
  const filteredEntres = useMemo(() => {
    return entresEntreprise.filter((item: RecupType) => {
      if (!item.date) return false;
      const itemDate = item.date.split('T')[0];
      if (dateRange.start && itemDate < dateRange.start) return false;
      if (dateRange.end && itemDate > dateRange.end) return false;
      return true;
    });
  }, [entresEntreprise, dateRange]);

  // Calculate Expenses (Achats)
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
    metrics: {
      totalCA,
      totalExpenses,
      estimatedProfit,
      isLoss
    },
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, background: '#111827' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#60a5fa' }} />
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>Chargement des statistiques...</Typography>
      </Box>
    );
  }

  if (error || !stockEntreprise) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#111827', pt: 8, px: 2 }}>
        <Alert severity="error" variant="filled" action={<Button color="inherit" onClick={() => window.location.reload()}>Réessayer</Button>}>
          Problème de connexion. Veuillez rafraîchir la page.
        </Alert>
      </Box>
    );
  }

  // Stats Configuration
  const statsCards = [
    {
      title: 'Quantités sorties',
      value: stockEntreprise.somme_sortie_qte,
      icon: <TrendingDownIcon />,
      color: '#f87171', // red-400
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)'
    },
    {
      title: 'Quantités en stock',
      value: stockEntreprise.somme_entrer_qte,
      icon: <InventoryIcon />,
      color: '#34d399', // emerald-400
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.2)'
    },
    {
      title: 'Sorties effectuées',
      value: stockEntreprise.nombre_sortie,
      icon: <ShoppingCartIcon />,
      color: '#60a5fa', // blue-400
      bg: 'rgba(96, 165, 250, 0.1)',
      border: 'rgba(96, 165, 250, 0.2)',
      link: '/sortie'
    },
    {
      title: 'Entrées effectuées',
      value: stockEntreprise.nombre_entrer,
      icon: <TrendingUpIcon />,
      color: '#22d3ee', // cyan-400
      bg: 'rgba(34, 238, 48, 0.1)',
      border: 'rgba(34, 211, 238, 0.2)',
      link: '/entre'
    }
  ];

  return (
    
    <Container>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <AssessmentIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
            <Typography variant="h3"
              className='text-gray-50'
            >
              Statistiques
            </Typography>
          </Box>
          <Typography variant="body1" className='text-gray-200' sx={{ ml: 7, color: '#94a3b8' }}>
            Vue d'ensemble et indicateurs de performance
          </Typography>
        </Box>
      </Fade>

      {/* Date Filters */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          // className='bg-gray-500'
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'rgba(30, 41, 59, 0.7)', // slate-800 with opacity
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarTodayIcon sx={{ color: '#60a5fa' }} />
            <Typography variant="h6" className='text-gray-50' sx={{ fontWeight: 600, color: '#f1f5f9' }}>
              Période d'analyse
            </Typography>
            {filters.isActive && (
              <Chip label="Filtré" size="small" sx={{ ml: 1, background: '#3b82f6', color: 'white' }} />
            )}
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={filters.start}
                onChange={(e) => filters.setStart(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { color: '#94a3b8' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={filters.end}
                onChange={(e) => filters.setEnd(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { color: '#94a3b8' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                className='bg-yellow-500'
                startIcon={<ClearIcon />}
                onClick={filters.clear}
                disabled={!filters.isActive}

              >
                Effacer
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Financial Metrics */}
      <Fade in timeout={1000}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} md={4}>
            <StatCard
              title="Chiffre d'Affaires"
              value={formatNumberWithSpaces(metrics.totalCA)}
              icon={<LocalAtmIcon sx={{ color: '#60a5fa', fontSize: { xs: 24, sm: 32 } }} />}
              description="Total des ventes (hors remises)"
              backgroundColor="linear-gradient(135deg, #1e3a8a 0%, #172554 100%)"
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <StatCard
              title="Dépenses"
              value={formatNumberWithSpaces(metrics.totalExpenses)}
              icon={<LocalAtmIcon sx={{ color: '#f87171', fontSize: { xs: 24, sm: 32 } }} />}
              description="Total des achats sur la période"
              backgroundColor="linear-gradient(135deg, #064e3b 0%, #022c22 100%)"
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <StatCard
              title={metrics.isLoss ? 'Perte Estimée' : 'Bénéfice Estimé'}
              value={formatNumberWithSpaces(Math.abs(metrics.estimatedProfit))}
              icon={
                metrics.isLoss
                  ? <TrendingDownIcon sx={{ color: '#22d3ee', fontSize: { xs: 24, sm: 32 } }} />
                  : <TrendingUpIcon sx={{ color: '#34d399', fontSize: { xs: 24, sm: 32 } }} />
              }
              description={metrics.isLoss ? 'La société est en perte' : 'La société est en profit'}
              backgroundColor={metrics.isLoss ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)' : 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'}
            />
          </Grid>

          {/* <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Clients"
              value={getClients ? getClients.filter(client => client.role === 1 || client.role === 3).length : '--'}
              icon={<PeopleOutlineRoundedIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />} 
            />
          </Grid> */}
        </Grid>
      </Fade>

      {/* Stats Grid */}
      <Grid container spacing={2}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Zoom in timeout={1200 + index * 100}>
              <Card
                // component={stat.link && !licenceExpired ? Link : 'div'}
                // to={stat.link}
                sx={{
                  height: '100%',
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${stat.border}`,
                  borderRadius: 3,
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: stat.link && !licenceExpired ? 'pointer' : 'default',
                  opacity: licenceExpired ? 0.6 : 1,
                  '&:hover': stat.link && !licenceExpired ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 20px -5px ${stat.color}40`,
                    background: 'rgba(30, 41, 59, 0.6)'
                  } : {}
                }}
              >
                <Link to={stat.link ? stat.link : ""}>
                  <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { xs: 'center', sm: 'space-between' }, mb: { xs: 1.5, sm: 2 }, alignItems: 'center', gap: { xs: 1, sm: 0 } }}>
                      <Typography variant="subtitle2" sx={{ color: stat.color, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                        {stat.title}
                      </Typography>


                      <Box sx={{ p: { xs: 0.75, sm: 1 }, borderRadius: '50%', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', order: { xs: -1, sm: 0 } }}>
                        {/* @ts-ignore */}
                        {stat.icon && typeof stat.icon === 'object' ? React.cloneElement(stat.icon as React.ReactElement, { sx: { fontSize: { xs: 24, sm: 32 } } }) : stat.icon}
                      </Box>

                    </Box>
                    <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                      {stat.value ? stat.value.toLocaleString() : 0}
                    </Typography>
                  </Box>
                </Link>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* License Expired Warning */}
      {licenceExpired && (
        <Fade in timeout={1600}>
          <Alert
            severity="warning"
            variant="filled"
            sx={{
              mt: 4,
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(237, 137, 54, 0.25)',
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
              Licence expirée
            </Typography>
            <Typography variant="body2">
              Certaines fonctionnalités sont désactivées. Veuillez renouveler votre licence pour continuer à utiliser toutes les fonctionnalités.
            </Typography>
          </Alert>
        </Fade>
      )}
    </Container>
    // </Box>
  );
}
