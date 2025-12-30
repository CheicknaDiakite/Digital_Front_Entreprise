import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format } from 'date-fns';
import { useHistoriqueEntreprise } from '../../../usePerso/fonction.user';
import { EntrepriseType } from '../../../typescript/Account';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';

// Types
interface HistoryRowProps {
  row: EntrepriseType;
}

type FilterType = 'all' | 'entrer' | 'sortie';

// Components
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

const ErrorMessage = () => (
  <Stack sx={{ width: '100%', padding: 2 }} spacing={2}>
    <Alert severity="error">Une erreur est survenue lors de la récupération des données.</Alert>
  </Stack>
);

const FilterButtons = ({ currentFilter, onFilterChange }: { currentFilter: FilterType, onFilterChange: (filter: FilterType) => void }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
    <Button
      variant={currentFilter === 'entrer' ? 'contained' : 'outlined'}
      onClick={() => onFilterChange('entrer')}
      color="primary"
    >
      Entrées
    </Button>
    <Button
      variant={currentFilter === 'sortie' ? 'contained' : 'outlined'}
      onClick={() => onFilterChange('sortie')}
      color="primary"
    >
      Sorties
    </Button>
    <Button
      variant={currentFilter === 'all' ? 'contained' : 'outlined'}
      onClick={() => onFilterChange('all')}
      color="primary"
    >
      Tous
    </Button>
  </Box>
);

const DateFilters = ({ startDate, endDate, onStartDateChange, onEndDateChange }: {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
    <TextField
      label="Date de début"
      type="date"
      value={startDate}
      onChange={(e) => onStartDateChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      className="bg-white"
      fullWidth
    />
    <TextField
      label="Date de fin"
      type="date"
      value={endDate}
      onChange={(e) => onEndDateChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      className="bg-white"
      fullWidth
    />
  </Box>
);

const HistoryRow = ({ row }: HistoryRowProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAncien, setShowAncien] = useState(false); // <-- état du switch
  const [descDialog, setDescDialog] = useState<string | null>(null);
  const rowsPerPage = 50;

  const filteredHistorique = row.historique?.filter((historyRow) => {
    const typeFilter = filter === 'all' || historyRow.type === filter;
    const rowDate = new Date(historyRow.date ?? new Date());
    const isAfterStartDate = startDate ? rowDate >= new Date(startDate) : true;
    const isBeforeEndDate = endDate ? rowDate <= new Date(endDate) : true;
    return typeFilter && isAfterStartDate && isBeforeEndDate;
  });

  const totalPages = Math.ceil((filteredHistorique?.length ?? 0) / rowsPerPage);
  const paginatedHistorique = filteredHistorique?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label={open ? 'Réduire les détails' : 'Voir les détails'}
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon color="primary" /> : <KeyboardArrowDownIcon color="primary" />}
          </IconButton>
        </TableCell>
        <TableCell>{row.nom}</TableCell>
        <TableCell align="right">{row.adresse}</TableCell>
        <TableCell align="right">{row.numero}</TableCell>
        <TableCell align="right">{row.email}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" component="h3">
                  Historique
                  <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {filteredHistorique?.length ?? 0}
                  </span>
                </Typography>

                {/* Switch pour afficher / masquer "ancien" */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAncien}
                      onChange={(e) => setShowAncien(e.target.checked)}
                      color="primary"
                      size="small"
                      inputProps={{ 'aria-label': 'Afficher ancien (quantiter)' }}
                    />
                  }
                  label="Afficher ancien"
                />
              </div>

              <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
              <DateFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />

              <TableContainer component={Paper} elevation={0}>
                <Table size="small" aria-label="historique des transactions">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="right">Catégorie</TableCell>
                      <TableCell align="right">Description</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedHistorique?.map((historyRow, index) => {
                      const ancien = Number(historyRow.ancien_qte) || 0;
                      const qteRaw = Number(historyRow.qte) || 0;

                      const qteAffiche = historyRow.cumuler_qe ? ancien + qteRaw : qteRaw;
                      const delta = historyRow.cumuler_qe ? qteRaw : qteRaw - ancien;
                      const deltaText = `${delta > 0 ? '+' : ''}${delta}`;
                      const arrowIcon = historyRow.cumuler_qe
                        ? <KeyboardArrowUpIcon color="success" fontSize="small" />
                        : (delta > 0
                            ? <KeyboardArrowUpIcon color="success" fontSize="small" />
                            : <KeyboardArrowDownIcon color="error" fontSize="small" />
                          );
                      const badgeColor = historyRow.cumuler_qe
                        ? 'bg-green-100 text-green-800'
                        : (delta > 0 ? 'bg-green-100 text-green-800' : delta < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700');

                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            {format(new Date(historyRow.date ?? new Date()), 'dd/MM/yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              historyRow.type === 'entrer'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {historyRow.type}
                            </span>
                          </TableCell>
                          <TableCell align="right">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              {/* n'affiche l'ancien que si le switch est activé */}
                              {showAncien && (
                                <span style={{ color: '#6b7280', fontSize: '0.95rem', minWidth: 48, textAlign: 'right' }}>{ancien}</span>
                              )}

                              <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: 48, textAlign: 'right' }}>{qteAffiche}</span>

                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {arrowIcon}
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 6px',
                                  borderRadius: 8,
                                  fontWeight: 600
                                }} className={badgeColor}>
                                  {historyRow.cumuler_qe ? `+${qteRaw}` : deltaText}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell align="right">{formatNumberWithSpaces(historyRow.pu)}</TableCell>
                          <TableCell align="right">{historyRow.categorie}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                              {historyRow.libelle || '-'}
                            </Typography>

                            {historyRow.description && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                                <Tooltip title="Afficher la description complète">
                                  <Typography
                                    variant="caption"
                                    onClick={() => setDescDialog(historyRow.description ?? null)}
                                    sx={{
                                      color: 'text.secondary',
                                      fontStyle: 'italic',
                                      maxWidth: 220,
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                  >
                                    motif: {historyRow.description.length > 80 ? `${historyRow.description.slice(0, 80)}…` : historyRow.description}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                          
                          <TableCell align="right">{historyRow.action}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog open={!!descDialog} onClose={() => setDescDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Motif</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {descDialog}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function TableHistory() {
  const { historique, isLoading, isError } = useHistoriqueEntreprise();
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  if (!historique) return null;

  return (
    <div >
        {/* <Nav /> */}
        <Paper elevation={0} className="mt-6">
          <TableContainer>
            <Table aria-label="tableau des entreprises">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell />
                  <TableCell>Nom de l'entreprise</TableCell>
                  <TableCell align="right">Adresse</TableCell>
                  <TableCell align="right">Téléphone</TableCell>
                  <TableCell align="right">Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historique.map((row, index) => (
                  <HistoryRow key={`${row.nom}-${index}`} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      
    </div>
  );
}
