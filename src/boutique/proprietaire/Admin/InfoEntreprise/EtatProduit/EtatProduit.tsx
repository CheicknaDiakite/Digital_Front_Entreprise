import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { formatNumberWithSpaces } from '../../../../../usePerso/fonctionPerso';
import { useFetchEntreprise, useStockEntreprise } from '../../../../../usePerso/fonction.user';
import { connect } from '../../../../../_services/account.service';
import AnalyticEcommerce from '../../../../../components/cards/statistics/AnalyticEcommerce';
import { useStoreUuid } from '../../../../../usePerso/store';
import { Link } from 'react-router-dom';
  
export default function EtatProduit() {
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)

  const {stockEntreprise, isLoading, isError} = useStockEntreprise(unEntreprise.uuid!, connect)

  if (isLoading) {
    return <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  }

  if (isError) {
    return <Stack sx={{ width: '100%' }} spacing={2}>        
      <Alert severity="error">Probleme de connexion !</Alert>
    </Stack>
  }

  if (stockEntreprise) {
    return <>
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      
      <Grid container alignItems="center" justifyContent="space-between" className='pt-5 mt-5'>
        <Grid item>
          <Typography variant="h5">Les infos de l'entreprise</Typography>
        </Grid>
      <Grid />
        
      </Grid>
  
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="La somme des quantités sorties et le chiffre d'affaire" count={stockEntreprise.somme_sortie_qte} percentage={formatNumberWithSpaces(stockEntreprise.somme_sortie_pu)} className="bg-green-100" />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="La somme des quantités restants" count={stockEntreprise.somme_entrer_qte} className="bg-green-100" />
      </Grid>
  
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/sortie">      
          <AnalyticEcommerce title="Le nombre de sortie effectuer" count={stockEntreprise.nombre_sortie} className="bg-blue-100" />
        </Link>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to="/entre">    
          <AnalyticEcommerce title="Le nombre d'entrer effectuer" count={stockEntreprise.nombre_entrer} className="bg-blue-100" />
        </Link>
      </Grid>
    </Grid>
    </>
  }
    
  
}
