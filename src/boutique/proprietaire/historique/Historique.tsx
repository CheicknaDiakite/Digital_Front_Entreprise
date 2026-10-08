import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useHistoryClientEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { format } from 'date-fns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HistoryToggleOffOutlinedIcon from '@mui/icons-material/HistoryToggleOffOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import OutboxOutlinedIcon from '@mui/icons-material/OutboxOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Skeletons de chargement
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', py: 2 }}>
    <Skeleton variant="text" width={280} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={4} key={i}>
          <Skeleton variant="rectangular" height={105} sx={{ borderRadius: '16px' }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={460} sx={{ borderRadius: '20px' }} />
  </Box>
);

export default function Historique() {
  const theme = useTheme();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { clientH, isLoading, isError } = useHistoryClientEntreprise(entreprise_uuid!);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrer' | 'sortie'>('all');
  const [showAncien, setShowAncien] = useState(false);
  const [descDialog, setDescDialog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Données normalisées
  const historyList = useMemo(() => {
    return (clientH as any)?.historique || (Array.isArray(clientH) ? clientH : []);
  }, [clientH]);

  // Filtrage combiné : Recherche texte, Dates et Type de mouvement
  const clientHistoryFiltered = useMemo(() => {
    return historyList.filter((item: any) => {
      // 1. Filtre par Date
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

      // 2. Filtre par Type (Entrée / Sortie)
      if (typeFilter !== 'all') {
        const type = (item.type || item.action || '').toLowerCase();
        if (type !== typeFilter) return false;
      }

      // 3. Filtre par Recherche texte
      if (searchTerm) {
        const low = searchTerm.toLowerCase();
        const matchLib = item.libelle?.toLowerCase().includes(low);
        const matchCat = item.categorie?.toLowerCase().includes(low);
        const matchDesc = item.description?.toLowerCase().includes(low);
        if (!matchLib && !matchCat && !matchDesc) return false;
      }

      return true;
    });
  }, [historyList, startDate, endDate, typeFilter, searchTerm]);

  // Statistiques de synthèse
  const stats = useMemo(() => {
    let countEntrer = 0;
    let countSortie = 0;
    let qteEntrer = 0;
    let qteSortie = 0;

    clientHistoryFiltered.forEach((item: any) => {
      const q = Number(item.qte) || 0;
      const type = (item.type || item.action || '').toLowerCase();
      if (type === 'entrer') {
        countEntrer += 1;
        qteEntrer += q;
      } else if (type === 'sortie') {
        countSortie += 1;
        qteSortie += q;
      }
    });

    return {
      totalMouvements: clientHistoryFiltered.length,
      countEntrer,
      countSortie,
      qteEntrer,
      qteSortie,
    };
  }, [clientHistoryFiltered]);

  const totalPages = Math.ceil(clientHistoryFiltered.length / rowsPerPage);
  const paginatedHistorique = clientHistoryFiltered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.08)' }}>
        <Typography color="error" fontWeight="700">
          Une erreur est survenue lors de la récupération de l'historique des mouvements.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
          Journal des Mouvements de Stock
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Traçabilité chronologique complète des réapprovisionnements et des sorties d'articles.
        </Typography>
      </Box>

      {/* Cartes Synthétiques de Flux */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Mouvements
                </Typography>
                <HistoryToggleOffOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main' }}>
                {stats.totalMouvements}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lignes d'opérations filtrées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                  Entrées Réalisées (+)
                </Typography>
                <MoveToInboxOutlinedIcon sx={{ color: '#10b981', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#10b981' }}>
                +{formatNumberWithSpaces(stats.qteEntrer)} <Typography component="span" variant="caption">unités</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.countEntrer} opération{stats.countEntrer > 1 ? 's' : ''} d'entrée
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                  Sorties Effectuées (-)
                </Typography>
                <OutboxOutlinedIcon sx={{ color: '#ef4444', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#ef4444' }}>
                -{formatNumberWithSpaces(stats.qteSortie)} <Typography component="span" variant="caption">unités</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.countSortie} opération{stats.countSortie > 1 ? 's' : ''} de sortie
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre d'Action et Filtres */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '16px',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(14px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Recherche texte */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher par article, catégorie ou motif..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                },
              }}
            />
          </Grid>

          {/* Filtre Type */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                sx={{
                  borderRadius: '12px',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                }}
              >
                <MenuItem value="all">Tous les flux</MenuItem>
                <MenuItem value="entrer">Entrées (+)</MenuItem>
                <MenuItem value="sortie">Sorties (-)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date début */}
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date début"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                },
              }}
            />
          </Grid>

          {/* Date fin */}
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date fin"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                },
              }}
            />
          </Grid>

          {/* Switch Ancien Stock & Reset */}
          <Grid item xs={6} md={2} display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={showAncien}
                  onChange={(e) => setShowAncien(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" fontWeight="700">
                  Ancien stock
                </Typography>
              }
            />
            <Tooltip title="Réinitialiser les filtres">
              <IconButton
                onClick={handleResetFilters}
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderRadius: '10px',
                  p: 0.8,
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Tableau du Journal d'Audit */}
      {clientHistoryFiltered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <HistoryToggleOffOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            Aucun mouvement ne correspond aux filtres appliqués.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Modifiez la période ou effacez vos critères de recherche.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            maxHeight: 650,
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Date & Heure</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Quantité & Delta</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Prix Unitaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Description / Motif</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistorique.map((historyRow: any, index: number) => {
                const isEntrer = (historyRow.type || historyRow.action || '').toLowerCase() === 'entrer';
                const ancien = Number(historyRow.ancien_qte) || 0;
                const qteRaw = Number(historyRow.qte) || 0;
                const qteAffiche = historyRow.cumuler_qe ? ancien + qteRaw : qteRaw;
                const delta = historyRow.cumuler_qe ? qteRaw : qteRaw - ancien;
                const deltaText = `${delta > 0 ? '+' : ''}${delta}`;

                const borderColor = isEntrer ? '#10b981' : '#ef4444';
                const rowBg = isEntrer ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)';

                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: rowBg,
                      borderLeft: `4px solid ${borderColor}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isEntrer ? 'rgba(16, 185, 129, 0.07)' : 'rgba(239, 68, 68, 0.07)',
                      },
                      '& td': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        py: 1.5,
                      },
                    }}
                  >
                    {/* Date */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" sx={{ whiteSpace: 'nowrap' }}>
                        {format(new Date(historyRow.date ?? new Date()), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </TableCell>

                    {/* Type de flux */}
                    <TableCell>
                      <Chip
                        icon={isEntrer ? <KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                        label={isEntrer ? 'Entrée' : 'Sortie'}
                        size="small"
                        color={isEntrer ? 'success' : 'error'}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>

                    {/* Désignation */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">
                        {historyRow.libelle || '-'}
                      </Typography>
                    </TableCell>

                    {/* Catégorie */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {historyRow.categorie || '-'}
                      </Typography>
                    </TableCell>

                    {/* Quantité & Delta */}
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        {showAncien && (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                            {ancien} →
                          </Typography>
                        )}
                        <Typography variant="body2" fontWeight="800">
                          {qteAffiche}
                        </Typography>
                        <Chip
                          label={historyRow.cumuler_qe ? `+${qteRaw}` : deltaText}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            height: 20,
                            borderRadius: '6px',
                            bgcolor: delta >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: delta >= 0 ? '#10b981' : '#ef4444',
                            border: `1px solid ${delta >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Prix unitaire */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="600">
                        {formatNumberWithSpaces(historyRow.pu)} FCFA
                      </Typography>
                    </TableCell>

                    {/* Motif / Description */}
                    <TableCell align="right">
                      {historyRow.description ? (
                        <Tooltip title="Cliquer pour afficher le motif complet" arrow>
                          <Typography
                            variant="caption"
                            onClick={() => setDescDialog(historyRow.description)}
                            sx={{
                              color: 'primary.main',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-block',
                              maxWidth: 180,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {historyRow.description}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3.5 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '10px',
                fontWeight: 700,
              },
            }}
          />
        </Stack>
      )}

      {/* Modal Motif / Description Complète */}
      <Dialog
        open={Boolean(descDialog)}
        onClose={() => setDescDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="800">
            Détail du Motif
          </Typography>
          <IconButton size="small" onClick={() => setDescDialog(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.6 }}>
            {descDialog}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
