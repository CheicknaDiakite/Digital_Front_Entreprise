import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useHistorySuppEntreprise } from '../../../usePerso/fonction.user';
import { connect } from '../../../_services/account.service';
import Nav from '../../../_components/Button/Nav';
import { format } from 'date-fns';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';


export default function HistoriqueSupp() {
  const uuid = useStoreUuid((state) => state.selectedId)

  // const {entres} = useFetchAllEntre(top)
  const {suppH, isLoading, isError} = useHistorySuppEntreprise(connect, uuid!)

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

  if (suppH) {

    return (
      <>    
  
      <Nav />
  
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={3}>
                Historiques des produits supprimés
              </TableCell>
              {/* <TableCell align="right">Prix</TableCell> */}
            </TableRow>
            <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantite</TableCell>
                    <TableCell align="right">Prix Unitaire ($)</TableCell>
                    <TableCell align="right">libelle</TableCell>
                    <TableCell align="right">categorie</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
          </TableHead>
          {suppH?.length > 0 ? 
            
            suppH?.map((row, index) => {
              const validDate = row.date ?? new Date();
                return <TableRow key={index}>            
                
                <TableCell component="th" scope="row">
                      {/* {historyRow.date} */}
                      {format(new Date(validDate), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell align="right">{row.qte}</TableCell>
                    <TableCell align="right">{formatNumberWithSpaces(row.pu)}</TableCell>
                    <TableCell align="right">{row.libelle}</TableCell>
                    <TableCell align="right">{row.categorie}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                    
                {/* <TableCell align="right"></TableCell> */}
              </TableRow>
              })
              : "Pas d'histories supprimer"
            }
          
        </Table>
      </TableContainer>
      </>
    );
  }
  
  }

