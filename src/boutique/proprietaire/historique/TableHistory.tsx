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
import { Button } from '@mui/material';
import { format } from 'date-fns';
import { EntrepriseType } from '../../../typescript/Account';
import Nav from '../../../_components/Button/Nav';

function Row(props: { row: EntrepriseType }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = React.useState<'all' | 'entrer' | 'sortie'>('all'); // État pour gérer le filtre

  // Fonction pour filtrer l'historique en fonction du type
  const filteredHistorique = row.historique?.filter((historyRow) => {
    if (filter === 'all') return true; // Pas de filtre
    return historyRow.type === filter; // Filtrer par type (entrer ou sortie)
  });

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon color='primary' /> : <KeyboardArrowDownIcon color='primary' />}
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

              {/* Boutons pour filtrer */}
              <Box sx={{ marginBottom: 2 }}>
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
              </Box>
              
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">QTE</TableCell>
                    <TableCell align="right">pu ($)</TableCell>
                    <TableCell align="right">libelle</TableCell>
                    <TableCell align="right">categorie</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistorique?.map((historyRow, index: number) => {
                    const validDate = historyRow.date ?? new Date();
                    return <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {/* {historyRow.date} */}
                      {format(new Date(validDate), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{historyRow.type}</TableCell>
                    <TableCell align="right">{historyRow.qte}</TableCell>
                    <TableCell align="right">{historyRow.pu}</TableCell>
                    <TableCell align="right">{historyRow.libelle}</TableCell>
                    <TableCell align="right">{historyRow.categorie}</TableCell>
                    <TableCell align="right">{historyRow.action}</TableCell>
                    
                  </TableRow>
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function TableHistory() {
  const {historique} = useHistoriqueEntreprise(connect)
  
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
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
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
