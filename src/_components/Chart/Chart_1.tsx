import { BarChart } from '@mui/x-charts/BarChart';
import { useFetchEntreprise, useStockEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { connect } from '../../_services/account.service';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';

type MonthlyData = {
  somme_qte: number;
  somme_prix_total: string;
}

export default function SimpleCharts() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid!);
  const { stockEntreprise, isLoading, isError } = useStockEntreprise(unEntreprise.uuid!, connect);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Stack sx={{ width: '100%' }} spacing={2}>        
        <Alert severity="error">Probleme de connexion !</Alert>
      </Stack>
    );
  }

  if (stockEntreprise?.details_sortie_par_mois) {
    const monthlyData = stockEntreprise.details_sortie_par_mois as unknown as Record<string, MonthlyData>;
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month: new Date(month).toLocaleString('default', { month: 'short' }),
      count: data.somme_qte || 0,
    }));

    // Trier les données par date
    chartData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Prendre les 12 derniers mois
    const last12Months = chartData.slice(-12);
  
    // Extraire les données pour le graphique
    const xAxisData = last12Months.map(item => item.month);
    const seriesData = last12Months.map(item => item.count);

    return (
      <BarChart
        xAxis={[
          {
            id: 'barCategories',
            data: xAxisData,
            scaleType: 'band',
          },
        ]}
        series={[
          {
            data: seriesData,
          },
        ]}
        width={250}
        height={250}
      />
    );
  }

  return null;
}