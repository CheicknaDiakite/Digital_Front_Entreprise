import { useState, useMemo } from 'react';
import { useFetchEntreprise, useStockSemaine } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

export default function EtaVente() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const { stockSemaine, isLoading, isError } = useStockSemaine(unEntreprise.uuid || '');

  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);

  // Traitement et tri chronologique des mois
  const sortedMonths = useMemo(() => {
    if (!stockSemaine?.sorties_par_mois) return [];
    return [...stockSemaine.sorties_par_mois].sort((a, b) => {
      const timeA = new Date(a.month).getTime();
      const timeB = new Date(b.month).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });
  }, [stockSemaine]);

  // Données pour la courbe chronologique (AreaChart)
  const timelineData = useMemo(() => {
    return sortedMonths.map((item) => {
      const d = new Date(item.month);
      const totalQte = (item.details || []).reduce((sum, det) => sum + (det.somme_qte || 0), 0);
      return {
        monthRaw: item.month,
        monthLabel: isNaN(d.getTime())
          ? item.month
          : d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        fullLabel: isNaN(d.getTime())
          ? item.month
          : d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        count: item.count || 0,
        totalQte,
      };
    });
  }, [sortedMonths]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalTransactions = timelineData.reduce((sum, item) => sum + item.count, 0);
    const totalQuantities = timelineData.reduce((sum, item) => sum + item.totalQte, 0);
    const averagePerMonth = timelineData.length > 0 ? Math.round(totalQuantities / timelineData.length) : 0;
    
    let bestMonth = { label: '--', qte: 0 };
    timelineData.forEach((item) => {
      if (item.totalQte > bestMonth.qte) {
        bestMonth = { label: item.fullLabel, qte: item.totalQte };
      }
    });

    return { totalTransactions, totalQuantities, averagePerMonth, bestMonth };
  }, [timelineData]);

  // Top produits consolidés sur l'ensemble des périodes
  const topProductsOverall = useMemo(() => {
    const productMap: Record<string, number> = {};
    sortedMonths.forEach((m) => {
      (m.details || []).forEach((d) => {
        const name = d.libelle || 'Inconnu';
        productMap[name] = (productMap[name] || 0) + (d.somme_qte || 0);
      });
    });

    return Object.entries(productMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [sortedMonths]);

  // Données du mois actuellement sélectionné
  const currentMonthData = sortedMonths[selectedMonthIndex] || sortedMonths[sortedMonths.length - 1];
  const currentMonthProducts = useMemo(() => {
    if (!currentMonthData?.details) return [];
    return [...currentMonthData.details]
      .map((d) => ({ name: d.libelle || 'Inconnu', value: d.somme_qte || 0 }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthData]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Une erreur est survenue lors du chargement des statistiques de vente.
        </Alert>
      </Box>
    );
  }

  if (!sortedMonths || sortedMonths.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '20px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          my: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: isDark ? '#fff' : 'text.primary' }}>
          Aucune vente enregistrée
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
          Les données analytiques et courbes de vente s'afficheront dès vos premières sorties.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, px: { xs: 1, sm: 2, md: 3 }, pt: 2 }}>
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)',
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(99,102,241,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1, px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: '#818cf8' }} />
              <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700 }}>
                Analytique & Tendances
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Évolution des Ventes
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#64748b', mt: 0.5 }}>
              Indicateurs de courbes et répartition des produits vendus par mois
            </Typography>
          </Box>
          <Chip
            label={`${sortedMonths.length} mois analysés`}
            sx={{
              bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
              color: isDark ? '#c7d2fe' : '#4338ca',
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 2,
              px: 1,
              borderRadius: '12px',
            }}
          />
        </Box>
      </Box>

      {/* ── CARTES KPIS RÉSUMÉES ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '18px',
              p: 2,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Quantités Totales
                </Typography>
                <ShoppingBagIcon sx={{ color: '#818cf8', fontSize: 22 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                {formatNumberWithSpaces(stats.totalQuantities)}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                Unités vendues sur la période
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '18px',
              p: 2,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Transactions
                </Typography>
                <EventNoteIcon sx={{ color: '#34d399', fontSize: 22 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                {stats.totalTransactions}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                Opérations de sortie
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '18px',
              p: 2,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Moyenne Mensuelle
                </Typography>
                <TrendingUpIcon sx={{ color: '#fbbf24', fontSize: 22 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                {formatNumberWithSpaces(stats.averagePerMonth)}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                Articles / mois en moyenne
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '18px',
              p: 2,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#f472b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Mois Record
                </Typography>
                <LeaderboardIcon sx={{ color: '#f472b6', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" noWrap title={stats.bestMonth.label} sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a', mt: 0.5 }}>
                {stats.bestMonth.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 600 }}>
                {formatNumberWithSpaces(stats.bestMonth.qte)} unités vendues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── COURBE D'ÉVOLUTION GLOBALE (AREA CHART RECHARTS) ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: '20px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.4)' : '0 8px 28px rgba(0,0,0,0.06)',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
              Courbe d'Évolution Temporelle
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
              Quantités vendues mois par mois avec lissage continu
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: isMobile ? 260 : 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke={isDark ? '#94a3b8' : '#64748b'}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? '#94a3b8' : '#64748b'}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: '14px',
                  color: '#e0e7ff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  padding: '10px 14px',
                }}
                formatter={(value: any) => [`${formatNumberWithSpaces(value)} unités`, 'Volume vendu']}
                labelFormatter={(_label: any, payload: any) => {
                  return payload && payload[0]?.payload?.fullLabel ? payload[0].payload.fullLabel : _label;
                }}
              />
              <Area
                type="monotone"
                dataKey="totalQte"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGradient)"
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#a855f7', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* ── TOP PRODUITS CONSOLIDÉS ET DÉTAIL PAR MOIS ── */}
      <Grid container spacing={3}>
        {/* Top 10 produits */}
        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: '20px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              height: '100%',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                Top 10 Produits Vendus
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
                Classement global sur l'ensemble de l'historique
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsOverall} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    tick={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: '12px',
                    }}
                    formatter={(v: any) => [`${formatNumberWithSpaces(v)} unités`, 'Ventes']}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Détail par mois interactif */}
        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: '20px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                Zoom par Période
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
                Sélectionnez un mois pour voir la répartition de ses produits
              </Typography>
            </Box>

            {/* Onglets scrollables de sélection de mois */}
            <Tabs
              value={selectedMonthIndex}
              onChange={(_, newVal) => setSelectedMonthIndex(newVal)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 38,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  mr: 1,
                  color: isDark ? '#94a3b8' : '#64748b',
                  '&.Mui-selected': {
                    color: '#6366f1',
                    bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                  },
                },
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              {sortedMonths.map((m, idx) => {
                const d = new Date(m.month);
                const label = isNaN(d.getTime())
                  ? m.month
                  : d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
                return <Tab key={idx} label={label} />;
              })}
            </Tabs>

            {/* Graphique des produits du mois sélectionné */}
            {currentMonthProducts.length > 0 ? (
              <Box sx={{ width: '100%', height: 270, flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentMonthProducts.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#94a3b8' : '#64748b'}
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        borderRadius: '12px',
                      }}
                      formatter={(v: any) => [`${formatNumberWithSpaces(v)} unités`, 'Ventes']}
                    />
                    <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, py: 6 }}>
                <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Aucun produit pour ce mois
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
