import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchUser, useStockEntreprise } from '../../../../usePerso/fonction.user';
import { formatNumberWithSpaces } from '../../../../usePerso/fonctionPerso';
import AnalyticEcommerce from '../../../../components/cards/statistics/AnalyticEcommerce';
import { format } from 'date-fns';

// Types
interface MonthlyDetail {
  somme_qte: number;
  somme_prix_total: string | number;
}

// Loading component
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

// Error component
const ErrorMessage = () => (
  <Stack sx={{ width: '100%', padding: 2 }} spacing={2}>
    <Alert severity="error">Une erreur est survenue lors de la récupération des données. Veuillez réessayer.</Alert>
  </Stack>
);

export default function SortieInventaire() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unUser } = useFetchUser();

  const { stockEntreprise, isLoading, isError } = useStockEntreprise(uuid || '');

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  if (!stockEntreprise) return null;

  // const hasSales = stockEntreprise.details_entrer_par_mois && stockEntreprise?.details_entrer_par_mois.length > 0;
  const detailsSortie = stockEntreprise.details_sortie_par_mois as unknown as Record<string, MonthlyDetail>;
  const hasSales = detailsSortie && Object.keys(detailsSortie).length > 0;

  // Trier les mois par ordre chronologique décroissant (le plus récent en premier)
  const sortedMonths = hasSales
    ? Object.entries(detailsSortie).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    : [];

  return (
    <>
      {/* <Nav /> */}
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5" className='text-gray-50' component="h1" gutterBottom>
            Statistiques des ventes mensuelles
          </Typography>
        </Grid>

        {!hasSales ? (
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" align="center">
              Aucune vente n'a été enregistrée pour le moment.
            </Typography>
          </Grid>
        ) : (
          sortedMonths.map(([month, details], index) => {
            const saleDate = new Date(month);
            const formattedCA = formatNumberWithSpaces(Number(details.somme_prix_total) || 0);

            return (
              <Grid item key={`${month}-${index}`} xs={12} sm={6} md={4} lg={3}>
                <AnalyticEcommerce
                  title={format(saleDate, 'MMMM yyyy')}
                  count={`${formattedCA} f`}
                  pied="Chiffre d'affaires"
                  pied_qte="Quantité vendue :"
                  qte={details.somme_qte || 0}
                  className="bg-blue-100"
                  user={unUser.role}
                  color="primary"
                />
              </Grid>
            );
          })
        )}
      </Grid>
    </>
  );
}
