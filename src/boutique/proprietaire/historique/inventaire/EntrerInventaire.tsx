import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import AnalyticEcommerce from '../../../../components/cards/statistics/AnalyticEcommerce';
import { format } from 'date-fns';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchEntreprise, useStockEntreprise } from '../../../../usePerso/fonction.user';
import { connect } from '../../../../_services/account.service';
import Nav from '../../../../_components/Button/Nav';

export default function EntrerInventaire() {
  const uuid = useStoreUuid((state) => state.selectedId);
    const { unEntreprise } = useFetchEntreprise(uuid!);
    const { stockEntreprise, isLoading, isError } = useStockEntreprise(unEntreprise.uuid!, connect);
  
    // const sortiesParMois = stockEntreprise?.details_sortie_par_mois || {};
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
      
      return (<>
        <Nav />
      
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* Titre */}
          <Grid item xs={12} sx={{ mb: -2.25 }}>
            <Typography variant="h5">Le nombre d'achats effectuées par mois</Typography>
          </Grid>
    
          {/* Vérification des données */}
          {/* {Object.keys(sortiesParMois).length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h5">Il n'y a pas eu de ventes ce mois-ci !</Typography>
            </Grid>
          ) : (
            Object.entries(sortiesParMois).map(([date, sorties], index) => {
              // const totalPrix = sorties?.length; // Calcul du total pour la date
              const validDate = new Date(date);
              // console.log("test", sorties.length)
              
              return (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <AnalyticEcommerce
                    title=" "
                    count={totalPrix} // Total des ventes pour la date
                    pied={`Détails des sorties pour le mois de`}
                    extra={format(validDate, 'MMMM yyyy')} // Format: Mois et Année
                    className="bg-blue-100"
                  />
                </Grid>
              );
            })
          )} */}
  
          {(!stockEntreprise.count_entrer_par_mois || stockEntreprise.count_entrer_par_mois.length === 0) ? (
              <Grid item xs={12} sx={{ mb: -2.25 }}>
              <Typography variant="h5">Il n'y a pas eu d'achat !</Typography>
              </Grid>
              ) : (
              stockEntreprise.count_entrer_par_mois.map((post, index) => {
              // const validDate = post.week ? new Date(post.month) : new Date(); // Vérifie si `post.week` est valide
              const validD = new Date(post.month) // Vérifie si `post.week` est valide
              
              return (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  {/* <Link to="/sortie"> */}
                      <AnalyticEcommerce
                      title=" "
                      count={post.count || 0} // Définit 0 par défaut si `post.count` est absent
                      pied={`Détails des entrers ou achats pour le mois de`}
                      extra={format(validD, 'MMMM yyyy')} // Format de la date
                      className="bg-blue-100"
                      />
                  {/* </Link> */}
                  </Grid>
              );
              })
          )}
    
          {/* Ajout d'espace (si nécessaire) */}
          <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
        </Grid>
      </>
      );
    }
}
