import { BarChart } from '@mui/x-charts/BarChart';
import { useFetchEntreprise, useStockEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { connect } from '../../_services/account.service';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';

export default function SimpleCharts() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid!);
  const { stockEntreprise, isLoading, isError } = useStockEntreprise(unEntreprise.uuid!, connect);

  // Mappez les données depuis `stockEntreprise.count_sortie_par_mois`
  // const chartData = stockEntreprise?.count_sortie_par_mois?.slice(0, 3).map((post) => ({
  
  
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

  if (stockEntreprise) {
    const chartData = stockEntreprise?.count_sortie_par_mois?.slice(0, 6).map((post) => ({
      month: post.month ? new Date(post.month).toLocaleString('default', { month: 'short' }) : 'Unknown',
      count: post.count || 0,
    })) || [];
  
    // Extraire les données pour le graphique
    const xAxisData = chartData.map((item) => item.month); // Noms des mois
    const seriesData = chartData.map((item) => item.count); // Données de compte

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
        width={500}
        height={300}
      />
    );
  }
}
