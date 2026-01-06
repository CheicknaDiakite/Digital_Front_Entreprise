import { useState } from 'react';
import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import Nav from '../../../_components/Button/Nav';
import MainCard from '../../../components/MainCard';
import MonthlyBarChart from '../../../pages/dashboard/MonthlyBarChart';
import { useStockSemaine } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';

// Types
interface ProductSaleDetails {
  details: any; // TODO: Define specific type based on your data structure
  month: string;
}

const MAX_MONTHS_TO_DISPLAY = 12;

const MonthlyProductChart = ({ saleData }: { saleData: ProductSaleDetails }) => {
  const saleDate = new Date(saleData.month);

  return (
    <MainCard sx={{ mt: 2 }} content={false}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack spacing={2}>
          <Typography variant="h6" color="text.secondary">
            {format(saleDate, 'MMMM yyyy')}
          </Typography>
        </Stack>
      </Box>
      <MonthlyBarChart details={saleData.details} />
    </MainCard>
  );
};



export default function EtaProduits() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const { stockSemaine } = useStockSemaine(uuid!, annee);
  
  const hasSales = stockSemaine?.sorties_par_mois && stockSemaine.sorties_par_mois.length > 0;

  return (
    <>
      {/* <Nav /> */}
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" className='text-gray-50' component="h1">
            Statistiques des ventes de produits par mois
          </Typography>
          <TextField
            label="Année"
            type="number"
            className='bg-yellow-100'
            size="small"
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            sx={{ width: 120 }}
          />
        </Grid>

        <Grid item xs={12}>
          {!hasSales ? (
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              Aucune donnée de vente disponible pour le moment.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {stockSemaine.sorties_par_mois
                ?.slice(0, MAX_MONTHS_TO_DISPLAY)
                .map((saleData, index) => (
                  <Grid item xs={12} key={`${saleData.month}-${index}`}>
                    <MonthlyProductChart saleData={saleData} />
                  </Grid>
                ))
              }
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
}
