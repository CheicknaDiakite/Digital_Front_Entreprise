import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useHistoriqueEntreprise } from '../../../usePerso/fonction.user';
import { connect } from '../../../_services/account.service';
import { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, TextField } from '@mui/material';
import { format } from 'date-fns';
import { EntrepriseType } from '../../../typescript/Account';
import Nav from '../../../_components/Button/Nav';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';

function Row(props: { row: EntrepriseType }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState<'all' | 'entrer' | 'sortie'>('all');
  const [startDate, setStartDate] = useState<string>(''); // Date de début
  const [endDate, setEndDate] = useState<string>(''); // Date de fin
  const [currentPage, setCurrentPage] = useState<number>(1); // Page actuelle
  const rowsPerPage = 50; // Nombre de lignes par page

  // Fonction pour filtrer par type et par date
  const filteredHistorique = row.historique?.filter((historyRow) => {
    // Filtrage par type
    const typeFilter = filter === 'all' || historyRow.type === filter;

    // Filtrage par date
    const rowDate = new Date(historyRow.date ?? new Date());
    const isAfterStartDate = startDate ? rowDate >= new Date(startDate) : true;
    const isBeforeEndDate = endDate ? rowDate <= new Date(endDate) : true;

    return typeFilter && isAfterStartDate && isBeforeEndDate;
  });

  // Pagination : calcul des données à afficher sur la page courante
  const totalPages = Math.ceil((filteredHistorique?.length ?? 0) / rowsPerPage);
  const paginatedHistorique = filteredHistorique?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Gestion du changement de page
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <KeyboardArrowUpIcon color="primary" />
            ) : (
              <KeyboardArrowDownIcon color="primary" />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.nom}
        </TableCell>
        <TableCell align="right">{row.adresse}</TableCell>
        <TableCell align="right">{row.numero}</TableCell>
        <TableCell align="right">{row.email}</TableCell>
        <TableCell align="right">#</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>

              {/* Recherche par type et date */}
              <Box sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                <Button
                  variant={filter === 'entrer' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('entrer')}
                  sx={{ marginRight: 1 }}
                >
                  Entrer
                </Button>
                <Button
                  variant={filter === 'sortie' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('sortie')}
                  sx={{ marginRight: 1 }}
                >
                  Sortie
                </Button>
                <Button
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('all')}
                >
                  Tous
                </Button>

                {/* Recherche par date */}
                <Box sx={{ marginLeft: 2, display: 'flex', gap: 2 }}>
                  <TextField
                    label="Date début"
                    className='bg-blue-200'
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Date fin"
                    type="date"
                    className='bg-blue-200'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantite</TableCell>
                    <TableCell align="right">Prix unitaire ($)</TableCell>
                    <TableCell align="right">Libelle</TableCell>
                    <TableCell align="right">Categorie</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedHistorique?.map((historyRow, index) => {
                    const validDate = historyRow.date ?? new Date();
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {format(new Date(validDate), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>{historyRow.type}</TableCell>
                        <TableCell align="right">{historyRow.qte}</TableCell>
                        <TableCell align="right">{formatNumberWithSpaces(historyRow.pu)}</TableCell>
                        <TableCell align="right">{historyRow.libelle}</TableCell>
                        <TableCell align="right">{historyRow.categorie}</TableCell>
                        <TableCell align="right">{historyRow.action}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: 2 }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}



export default function TableHistory() {
  const {historique, isLoading, isError} = useHistoriqueEntreprise(connect)

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

  if (historique) {

    return (<>
      <Nav />
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Nom de l'entreprise</TableCell>
              <TableCell align="right">Adresse</TableCell>
              <TableCell align="right">Telephone&nbsp;(TEL)</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">####&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historique.map((row, index) => (
              <Row key={index} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
    );
  }
  
}
