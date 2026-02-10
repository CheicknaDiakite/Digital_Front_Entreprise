import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  InputAdornment,
  Divider,
} from '@mui/material';
import { useState, useMemo } from 'react';
import CardTableSortie from './CardTableSortie';
import { useGetAllSortie, useUpdateRemiseSortie } from '../../usePerso/fonction.entre';
import { useStoreUuid } from '../../usePerso/store';
import { useStoreCart } from '../../usePerso/cart_store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Components
const LoadingState = () => (
  <Box sx={{ p: 4 }}>
    <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
  </Box>
);

const ErrorState = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="error" gutterBottom>
      Oups ! Une erreur est survenue lors du chargement.
    </Typography>
    <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
      Réessayer
    </Button>
  </Box>
);

export default function RemiseFacture() {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { selectedIds, sorties, setSorties, reset } = useStoreCart();
  const { updateRemiseSortie } = useUpdateRemiseSortie();

  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { sortiesEntreprise, isLoading, isError } = useGetAllSortie(entreprise_uuid!);

  // Memoized filtered and sorted list
  const filteredSorties = useMemo(() => {
    if (!sortiesEntreprise) return [];

    return sortiesEntreprise
      .filter((item) => {
        // Filter by Remise state
        if (!item.is_remise) return false;

        // Filter by Date
        if (selectedStartDate || selectedEndDate) {
          if (!item.date) return false;
          const itemDate = new Date(item.date).getTime();
          const start = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
          const end = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
          if (start && itemDate < start) return false;
          if (end && itemDate > end) return false;
        }

        // Filter by Search term
        if (searchTerm && !item.ref?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      });
  }, [sortiesEntreprise, selectedStartDate, selectedEndDate, searchTerm]);

  const totalPages = Math.ceil(filteredSorties.length / itemsPerPage);
  const paginatedSorties = filteredSorties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectSorties = useMemo(() => {
    return (sorties || []).filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  }, [sorties, selectedIds]);

  const handleConfirmCancelRemise = () => {
    const idsToUpdate = selectSorties.map(sor => sor.id as number);
    updateRemiseSortie(idsToUpdate);
    reset();
    setIsModalOpen(false);
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  return (
    <Box sx={{ mt: 3, pb: 4 }}>
      {/* Action Bar & Stats */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.dark' }}>
              <HistoryIcon sx={{ fontSize: 40 }} /> Gestion des Remises
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
                <LocalOfferIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  {filteredSorties.length} Remises appliquées
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setSorties(sortiesEntreprise || [])}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, py: 1.5 }}
            >
              Tout Sélectionner
            </Button>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<ReceiptLongIcon />}
              onClick={() => setIsModalOpen(true)}
              disabled={selectedIds.size === 0}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                boxShadow: '0 8px 24px -6px rgba(25, 118, 210, 0.5)',
                '&:hover': {
                  boxShadow: '0 12px 28px -6px rgba(25, 118, 210, 0.6)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              Annuler Remises ({selectedIds.size})
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* Advanced Search Area */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par référence produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: 'common.white' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date de début"
              value={selectedStartDate}
              onChange={(e) => { setSelectedStartDate(e.target.value); setCurrentPage(1); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 3, bgcolor: 'common.white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date de fin"
              value={selectedEndDate}
              onChange={(e) => { setSelectedEndDate(e.target.value); setCurrentPage(1); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 3, bgcolor: 'common.white' } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Content Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Aperçu</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Date de Sortie</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Référence</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Désignation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Quantité</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Prix U.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, bgcolor: 'primary.50', py: 2 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSorties.length > 0 ? (
              paginatedSorties.map((row) => (
                <CardTableSortie key={row.id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 12 }}>
                  <Box sx={{ opacity: 0.5 }}>
                    <ReceiptLongIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">Aucune remise à afficher</Typography>
                    <Typography variant="body2">Essayez de modifier vos filtres ou effectuez une nouvelle recherche</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 700
              }
            }}
          />
        </Stack>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 5, p: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h5" fontWeight="900">Confirmer la Modification</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ bgcolor: 'grey.100' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Souhaitez-vous vraiment annuler la remise sur ces <strong>{selectSorties.length}</strong> article(s) ?
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Référence / Catégorie</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>P.U</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectSorties.map((post, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">{post.ref}</Typography>
                      <Typography variant="caption" color="text.secondary">{post.categorie_libelle}</Typography>
                    </TableCell>
                    <TableCell align="right">{post.qte} {post.unite}</TableCell>
                    <TableCell align="right">{formatNumberWithSpaces(post.pu)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: '900', color: 'primary.main' }}>
                      {formatNumberWithSpaces(post.prix_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, p: 2.5, bgcolor: '#fff4e5', borderRadius: 3, display: 'flex', gap: 2, border: '1px solid #ffd180' }}>
            <Box sx={{ color: '#f57c00', pt: 0.5 }}>⚠️</Box>
            <Typography variant="body2" color="#663c00">
              <strong>Information :</strong> L'annulation de la remise retirera ces articles de toute facturation groupée associée et les rendra à nouveau disponibles pour une vente standard.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setIsModalOpen(false)}
            color="inherit"
            sx={{ borderRadius: 3, textTransform: 'none', px: 3, fontWeight: 600 }}
          >
            Revenir en arrière
          </Button>
          <Button
            onClick={handleConfirmCancelRemise}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 5,
              py: 1.2,
              fontWeight: 800,
              boxShadow: '0 10px 20px -10px rgba(25, 118, 210, 0.5)'
            }}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
