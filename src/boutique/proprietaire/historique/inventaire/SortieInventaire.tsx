import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchUser, useStockEntreprise } from '../../../../usePerso/fonction.user';
import { formatNumberWithSpaces } from '../../../../usePerso/fonctionPerso';
import AnalyticEcommerce from '../../../../components/cards/statistics/AnalyticEcommerce';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';

interface MonthlyDetail {
  somme_qte: number;
  somme_prix_total: string | number;
}

// Skeletons de chargement modernes
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', py: 2 }}>
    <Skeleton variant="text" width={260} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={105} sx={{ borderRadius: '16px' }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2.5}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Skeleton variant="rectangular" height={130} sx={{ borderRadius: '16px' }} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default function SortieInventaire() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unUser } = useFetchUser();
  const { stockEntreprise, isLoading, isError } = useStockEntreprise(uuid || '');

  const [selectedYear, setSelectedYear] = useState<string>('all');

  const detailsSortie = (stockEntreprise?.details_sortie_par_mois || {}) as unknown as Record<string, MonthlyDetail>;
  const hasRawSales = detailsSortie && Object.keys(detailsSortie).length > 0;

  // Tri antichronologique
  const allMonths = useMemo(() => {
    if (!hasRawSales) return [];
    return Object.entries(detailsSortie).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [detailsSortie, hasRawSales]);

  // Liste des années disponibles
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    allMonths.forEach(([month]) => {
      try {
        const y = new Date(month).getFullYear().toString();
        if (y && !isNaN(Number(y))) yearsSet.add(y);
      } catch {
        // Ignorer date invalide
      }
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [allMonths]);

  // Mois filtrés par l'année choisie
  const filteredMonths = useMemo(() => {
    if (selectedYear === 'all') return allMonths;
    return allMonths.filter(([month]) => {
      try {
        return new Date(month).getFullYear().toString() === selectedYear;
      } catch {
        return false;
      }
    });
  }, [allMonths, selectedYear]);

  // Métriques de synthèse globales
  const stats = useMemo(() => {
    if (!filteredMonths.length) {
      return { totalCA: 0, totalQte: 0, avgCA: 0, bestMonth: null as [string, MonthlyDetail] | null };
    }

    let totalCA = 0;
    let totalQte = 0;
    let best = filteredMonths[0];

    filteredMonths.forEach(([month, details]) => {
      const ca = Number(details.somme_prix_total) || 0;
      const qte = Number(details.somme_qte) || 0;
      totalCA += ca;
      totalQte += qte;
      if (ca > (Number(best[1].somme_prix_total) || 0)) {
        best = [month, details];
      }
    });

    const avgCA = Math.round(totalCA / filteredMonths.length);
    return { totalCA, totalQte, avgCA, bestMonth: best };
  }, [filteredMonths]);

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <Stack sx={{ width: '100%', py: 4 }} spacing={2}>
        <Alert severity="error" sx={{ borderRadius: '14px' }}>
          Une erreur est survenue lors de la récupération des données de ventes. Veuillez réessayer ultérieurement.
        </Alert>
      </Stack>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* En-tête avec titre et sélecteur d'année */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
            Ventes Mensuelles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi du chiffre d’affaires et des volumes d'articles vendus par mois.
          </Typography>
        </Box>

        {availableYears.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Select
              size="small"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{
                borderRadius: '12px',
                minWidth: 140,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <MenuItem value="all">Toutes les années</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  Année {year}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Box>

      {/* Cartes Synthétiques KPIs */}
      {filteredMonths.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Chiffre d’Affaires Total
                  </Typography>
                  <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ color: '#10b981' }}>
                  {formatNumberWithSpaces(stats.totalCA)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sur {filteredMonths.length} mois d'activité
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Articles Vendus
                  </Typography>
                  <ShoppingBagOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main' }}>
                  {formatNumberWithSpaces(stats.totalQte)} <Typography component="span" variant="caption">unités</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Volume total distribué
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Moyenne Mensuelle
                  </Typography>
                  <SignalCellularAltOutlinedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ color: '#8b5cf6' }}>
                  {formatNumberWithSpaces(stats.avgCA)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CA moyen par mois
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Mois Record
                  </Typography>
                  <EmojiEventsOutlinedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ color: '#f59e0b' }}>
                  {stats.bestMonth ? format(new Date(stats.bestMonth[0]), 'MMMM yyyy', { locale: fr }) : '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.bestMonth ? `${formatNumberWithSpaces(Number(stats.bestMonth[1].somme_prix_total) || 0)} FCFA` : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Grille des mois */}
      {!filteredMonths.length ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            Aucune vente enregistrée pour cette période.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Les sorties et encaissements enregistrés apparaîtront automatiquement ici.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredMonths.map(([month, details], index) => {
            const saleDate = new Date(month);
            const formattedCA = formatNumberWithSpaces(Number(details.somme_prix_total) || 0);
            const isBest = stats.bestMonth && stats.bestMonth[0] === month && filteredMonths.length > 1;

            return (
              <Grid item key={`${month}-${index}`} xs={12} sm={6} md={4} lg={3}>
                <Box sx={{ position: 'relative', height: '100%' }}>
                  {isBest && (
                    <Chip
                      icon={<EmojiEventsOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                      label="Record"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 12,
                        zIndex: 2,
                        bgcolor: '#f59e0b',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.675rem',
                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
                        height: 22,
                      }}
                    />
                  )}
                  <AnalyticEcommerce
                    title={format(saleDate, 'MMMM yyyy', { locale: fr })}
                    count={`${formattedCA} FCFA`}
                    pied="Chiffre d'affaires"
                    pied_qte="Quantité vendue :"
                    qte={details.somme_qte || 0}
                    className="mobile-glass"
                    user={unUser.role}
                    color="primary"
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
