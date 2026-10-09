import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChartSection } from '../../../pages/dashboard/components/ChartSection';
import MonthlyBarChart from '../../../pages/dashboard/MonthlyBarChart';
import { useFetchEntreprise, useStockSemaine } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { usePlanAccess } from '../../../hooks/usePlanAccess';
import FeatureGate from '../../../components/FeatureGate';

interface ProductSaleDetails {
  details: any;
  month: string;
}

const MonthlyProductChart = ({ saleData }: { saleData: ProductSaleDetails }) => {
  const saleDate = new Date(saleData.month);

  return (
    <ChartSection title={format(saleDate, 'MMMM yyyy', { locale: fr })} className="h-full">
      <MonthlyBarChart details={saleData.details} />
    </ChartSection>
  );
};

export default function EtaProduits() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const currentYear = new Date().getFullYear();
  const [annee, setAnnee] = useState<number>(currentYear);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  const { stockSemaine, isLoading } = useStockSemaine(uuid!, annee);

  const rawMonths: ProductSaleDetails[] = stockSemaine?.sorties_par_mois || [];
  const hasSales = rawMonths.length > 0;

  // Générer les 5 dernières années pour le sélecteur
  const availableYears = useMemo(() => {
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
  }, [currentYear]);

  // Mois filtrés
  const displayedMonths = useMemo(() => {
    if (selectedMonthFilter === 'all') return rawMonths;
    return rawMonths.filter((m) => m.month === selectedMonthFilter);
  }, [rawMonths, selectedMonthFilter]);

  if (planAccess.isDecouverte) {
    return (
      <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
        <FeatureGate
          hasAccess={false}
          requiredPlan="Stock Simple"
          featureTitle="État et Analyse des Produits"
          description="Visualisez l'état mensuel des ventes par produit, les histogrammes de performance et la répartition détaillée de vos stocks."
        >
          <div />
        </FeatureGate>
      </Box>
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
            Ventes de Produits par Mois
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Évolution détaillée des quantités vendues par article pour chaque mois.
          </Typography>
        </Box>

        {/* Sélecteur d'année moderne */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Select
            size="small"
            value={annee}
            onChange={(e) => {
              setAnnee(Number(e.target.value));
              setSelectedMonthFilter('all');
            }}
            sx={{
              borderRadius: '12px',
              minWidth: 130,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {availableYears.map((yr) => (
              <MenuItem key={yr} value={yr}>
                Année {yr}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Barre de filtre par mois si plusieurs mois existent */}
      {hasSales && (
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
              Mois :
            </Typography>
          </Box>

          <Chip
            label={`Tous les mois (${rawMonths.length})`}
            clickable
            size="small"
            color={selectedMonthFilter === 'all' ? 'primary' : 'default'}
            variant={selectedMonthFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setSelectedMonthFilter('all')}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          />

          {rawMonths.map((m) => {
            const label = format(new Date(m.month), 'MMMM', { locale: fr });
            return (
              <Chip
                key={m.month}
                label={label.charAt(0).toUpperCase() + label.slice(1)}
                clickable
                size="small"
                color={selectedMonthFilter === m.month ? 'primary' : 'default'}
                variant={selectedMonthFilter === m.month ? 'filled' : 'outlined'}
                onClick={() => setSelectedMonthFilter(m.month)}
                sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'capitalize' }}
              />
            );
          })}
        </Paper>
      )}

      {/* Affichage des graphiques */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid item xs={12} lg={6} key={i}>
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : !hasSales ? (
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
          <BarChartOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            Aucune vente de produit enregistrée pour l’année {annee}.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Sélectionnez une autre année pour visualiser l’historique des sorties de produits.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {displayedMonths.map((saleData, index) => (
            <Grid
              item
              xs={12}
              lg={selectedMonthFilter === 'all' && displayedMonths.length > 1 ? 6 : 12}
              key={`${saleData.month}-${index}`}
            >
              <MonthlyProductChart saleData={saleData} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
