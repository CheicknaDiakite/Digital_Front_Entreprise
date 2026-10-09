import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { ChartSection } from '../../../pages/dashboard/components/ChartSection';
import { useSortieUserEntreprise, useFetchEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { usePlanAccess } from '../../../hooks/usePlanAccess';
import FeatureGate from '../../../components/FeatureGate';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

interface UserData {
  username: string;
  total_qte: number;
}

interface MonthlyData {
  month: string;
  details: UserData[];
}

const formatMonthTitle = (monthStr: string) => {
  try {
    const date = new Date(monthStr);
    if (!isNaN(date.getTime())) {
      const formatted = format(date, 'MMMM yyyy', { locale: fr });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  } catch {
    // Fallback si la chaîne n'est pas une date ISO
  }
  return monthStr;
};

// Skeletons de chargement
const LoadingSkeleton = () => (
  <Box sx={{ py: 2 }}>
    <Skeleton variant="text" width={320} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={4} key={i}>
          <Skeleton variant="rectangular" height={110} sx={{ borderRadius: '16px' }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={380} sx={{ borderRadius: '20px' }} />
  </Box>
);

export default function VenteUsers() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const { sortiesUser, isLoading } = useSortieUserEntreprise(uuid!);

  const monthlyData: MonthlyData[] = (sortiesUser?.mensuel_par_utilisateur as MonthlyData[]) || [];
  const hasData = monthlyData.length > 0;

  // Par défaut, sélectionner le mois le plus récent
  const [selectedMonth, setSelectedMonth] = useState<string>('latest');

  // Mois actif pour l'analyse
  const activeMonthData = useMemo(() => {
    if (!hasData) return null;
    if (selectedMonth === 'latest' || !monthlyData.some((m) => m.month === selectedMonth)) {
      return monthlyData[monthlyData.length - 1]; // Dernier mois enregistré
    }
    return monthlyData.find((m) => m.month === selectedMonth) || monthlyData[monthlyData.length - 1];
  }, [monthlyData, selectedMonth, hasData]);

  // Données triées pour le mois sélectionné
  const sortedUsers = useMemo(() => {
    if (!activeMonthData?.details) return [];
    return [...activeMonthData.details].sort((a, b) => (b.total_qte || 0) - (a.total_qte || 0));
  }, [activeMonthData]);

  // Synthèse du mois actif
  const stats = useMemo(() => {
    if (!sortedUsers.length) return { totalTeamQte: 0, topSeller: null, totalMembers: 0 };
    const totalTeamQte = sortedUsers.reduce((sum, u) => sum + (Number(u.total_qte) || 0), 0);
    return {
      totalTeamQte,
      topSeller: sortedUsers[0],
      totalMembers: sortedUsers.length,
    };
  }, [sortedUsers]);

  // Données prêtes pour Recharts
  const chartData = useMemo(() => {
    return sortedUsers.map((u) => ({
      name: u.username || 'Inconnu',
      value: Number(u.total_qte) || 0,
    }));
  }, [sortedUsers]);

  const paletteColors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6'];

  if (!planAccess.canAddCollaborators) {
    return (
      <Box sx={{ py: 4 }}>
        <FeatureGate
          hasAccess={false}
          requiredPlan="Stock Pro"
          featureTitle="Ventes par utilisateur"
          description="Analysez les performances individuelles de vos vendeurs et collaborateurs, commissions et volumes d'articles vendus."
        >
          <div />
        </FeatureGate>
      </Box>
    );
  }

  if (isLoading) return <LoadingSkeleton />;

  return (
    <Box sx={{ py: 2 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
          Performance des Vendeurs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Classement de l'équipe et répartition des volumes vendus par collaborateur.
        </Typography>
      </Box>

      {!hasData ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <PeopleAltOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            Aucune vente par utilisateur enregistrée pour le moment.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Les sorties attribuées à vos opérateurs apparaîtront automatiquement dans ce tableau de bord.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Barre de sélection du mois (Chips) */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(14px)',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 1 }}>
              <FilterAltOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Période :
              </Typography>
            </Box>

            {monthlyData.map((m) => {
              const isSelected = activeMonthData?.month === m.month;
              return (
                <Chip
                  key={m.month}
                  label={formatMonthTitle(m.month)}
                  clickable
                  size="small"
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  onClick={() => setSelectedMonth(m.month)}
                  sx={{
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: isSelected ? '0 4px 10px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                />
              );
            })}
          </Paper>

          {/* Cartes Synthétiques & Podium du Mois */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {/* Top Vendeur 1er */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #f59e0b',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
                }}
              >
                <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                      Top Vendeur du Mois
                    </Typography>
                    <EmojiEventsOutlinedIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="900" sx={{ color: 'text.primary' }}>
                    {stats.topSeller?.username || 'Aucun'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {stats.topSeller ? `${stats.topSeller.total_qte} articles vendus` : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Ventes Équipe */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      Volume Équipe ({formatMonthTitle(activeMonthData?.month || '')})
                    </Typography>
                    <ShoppingBagOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main' }}>
                    {stats.totalTeamQte} <Typography component="span" variant="caption">articles</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total cumulé de tous les vendeurs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Vendeurs Actifs */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      Collaborateurs Actifs
                    </Typography>
                    <PeopleAltOutlinedIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="900" sx={{ color: '#10b981' }}>
                    {stats.totalMembers} <Typography component="span" variant="caption">vendeur(s)</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ayant réalisé au moins 1 sortie
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Section Graphique Principale */}
          <ChartSection title={`Classement des Ventes • ${formatMonthTitle(activeMonthData?.month || '')}`}>
            <Box sx={{ height: 360, width: '100%', pt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 13, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      padding: '10px 14px',
                    }}
                    formatter={(val: number) => [`${val} articles`, 'Quantité vendue']}
                    labelStyle={{ fontWeight: 800, color: theme.palette.text.primary, marginBottom: 4 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={paletteColors[index % paletteColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartSection>
        </>
      )}
    </Box>
  );
}
