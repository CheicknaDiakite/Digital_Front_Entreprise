import Nav from '../../../_components/Button/Nav'
import { Box, Grid, Stack, Typography } from '@mui/material';
import MainCard from '../../../components/MainCard';
import { format } from 'date-fns';
import { useFetchEntreprise, useStockSemaine } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import MonthlyBarChart from '../../../pages/dashboard/MonthlyBarChart';

export default function EtaProduits() {
    
    const uuid = useStoreUuid((state) => state.selectedId)
    const {unEntreprise} = useFetchEntreprise(uuid!)

    const {stockSemaine} = useStockSemaine(unEntreprise.uuid!)
    
  return (<>
    <Nav />

    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        {/* Titre */}
      <Grid item xs={12} md={7} lg={12}>
        
        <Grid item xs={12} sx={{ mb: -2.25 }} className='pb-3'>
          <Typography variant="h5">Le nombre des produits vendues effectuées par mois</Typography>
        </Grid>

        {(!stockSemaine.sorties_par_mois || stockSemaine.sorties_par_mois.length === 0) ? (
          <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Il n'y a pas eu de vente !</Typography>
          </Grid>
          ) : (
          stockSemaine.sorties_par_mois.slice(0, 12).map((post, index) => {
          // const validDate = post.week ? new Date(post.month) : new Date(); // Vérifie si `post.week` est valide
          const validD = new Date(post.month) // Vérifie si `post.week` est valide
          
          return (
            <MainCard key={index} sx={{ mt: 2 }} content={false}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" color="text.secondary">
                    {format(validD, 'MMMM yyyy')}
                  </Typography>
                  {/* <Typography variant="h3">$7,650</Typography> */}
                </Stack>
              </Box>
                <MonthlyBarChart details={post.details} />
                {/* <Chart_2 details={post.details} /> */}
            </MainCard>
          );
          })
        )}
  
      </Grid>
        {/* Ajout d'espace (si nécessaire) */}
        <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  
  </>
  )
}
