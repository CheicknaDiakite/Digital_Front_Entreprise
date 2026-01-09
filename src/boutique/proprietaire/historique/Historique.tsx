import { Box, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Pagination, Paper, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react'
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useHistoryClientEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format } from 'date-fns';

export default function Historique() {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { clientH, isLoading, isError } = useHistoryClientEntreprise(entreprise_uuid!);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAncien, setShowAncien] = useState(false);
  const [descDialog, setDescDialog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Handle potential structure mismatch where clientH might be { historique: [...] }
  const historyList = (clientH as any)?.historique || (Array.isArray(clientH) ? clientH : []);

  // Filter first by client, then by date and type
  const clientHistoryFiltered = historyList?.filter((item: any) => {
    
    // 2. Filter by Date Range
    if (startDate) {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }
    if (endDate) {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      if (itemDate > end) return false;
    }

    // 3. Filter by Type (Entrer vs Sortie)
    if (typeFilter !== 'all') {
      // Assuming 'entrer' or 'sortie' values in item.type or item.action
      // Adjust property access if needed based on data structure inspection
      const type = item.type || item.action;
      if (type !== typeFilter) return false;
    }

    return true;
  });

  const totalPages = Math.ceil((clientHistoryFiltered?.length ?? 0) / rowsPerPage);
  const paginatedHistorique = clientHistoryFiltered?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement de l'historique</div>;

  return (
    <>
    
    <Box sx={{ width: '100%' }}>
      {/* Search Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, background: '#f8fafc' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Date début"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              label="Date fin"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Tout</MenuItem>
                <MenuItem value="entrer">Entrée</MenuItem>
                <MenuItem value="sortie">Sortie</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* <Chip
            icon={<AttachMoneyIcon />}
            label={`Total: ${formatNumberWithSpaces(totalSum)} `}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', fontSize: '1rem', bgcolor: 'white' }}
          /> */}
          <Typography variant="h6" component="h3">
            Historique
            <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {clientHistoryFiltered?.length ?? 0}
            </span>
          </Typography>

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
        </Stack>
      </Paper>

      {(!clientHistoryFiltered || clientHistoryFiltered.length === 0) ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', background: 'transparent' }}>
          <Typography>Aucun historique trouvé pour ces critères.</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 600 }}
        //   elevation={0}
        //  sx={{ background: 'transparent' }}
        >
          <Table stickyHeader aria-label="sticky table">
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
              {paginatedHistorique.map((historyRow: any, index: number) => {
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
                                : 'bg-red-50 text-red-700'
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
      )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} className={`flex justify-center mt-6 mobile-pagination`}>
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

    <Dialog open={!!descDialog} onClose={() => setDescDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Motif</DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {descDialog}
            </Typography>
        </DialogContent>
    </Dialog>
    </>
  )
}
