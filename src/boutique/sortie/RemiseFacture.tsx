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
  InputAdornment,
  Divider,
  useTheme,
  Chip,
  Card,
  CardContent,
  Tooltip,
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
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Components
const LoadingState = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: '16px' }} />
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
  </Box>
);

const ErrorState = () => (
  <Box sx={{ p: 6, textAlign: 'center' }}>
    <Typography variant="h6" color="error" fontWeight="700" gutterBottom>
      Oups ! Une erreur est survenue lors du chargement des remises.
    </Typography>
    <Button variant="outlined" color="primary" onClick={() => window.location.reload()} sx={{ borderRadius: '12px', mt: 1 }}>
      Réessayer
    </Button>
  </Box>
);

export default function RemiseFacture() {
  const theme = useTheme();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { selectedIds, sorties, setSorties, reset } = useStoreCart();
  const { updateRemiseSortie } = useUpdateRemiseSortie();

  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { sortiesEntreprise, isLoading, isError } = useGetAllSortie(entreprise_uuid!);

  // Liste filtrée et triée
  const filteredSorties = useMemo(() => {
    if (!sortiesEntreprise) return [];

    return sortiesEntreprise
      .filter((item) => {
        // Filtrer par état remise
        if (!item.is_remise) return false;

        // Filtrer par Date
        if (selectedStartDate || selectedEndDate) {
          if (!item.date) return false;
          const itemDate = new Date(item.date).getTime();
          const start = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
          const end = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
          if (start && itemDate < start) return false;
          if (end && itemDate > end) return false;
        }

        // Filtrer par recherche (référence ou client)
        if (searchTerm) {
          const lowSearch = searchTerm.toLowerCase();
          const matchRef = item.ref?.toLowerCase().includes(lowSearch);
          const matchClient = item.client?.toLowerCase().includes(lowSearch);
          const matchCat = item.categorie_libelle?.toLowerCase().includes(lowSearch);
          if (!matchRef && !matchClient && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      });
  }, [sortiesEntreprise, selectedStartDate, selectedEndDate, searchTerm]);

  // Statistiques financières sur les remises
  const stats = useMemo(() => {
    const totalArticles = filteredSorties.length;
    const totalMontantVente = filteredSorties.reduce((acc, curr) => acc + (Number(curr.prix_total) || 0), 0);
    const totalQte = filteredSorties.reduce((acc, curr) => acc + (Number(curr.qte) || 0), 0);
    return { totalArticles, totalMontantVente, totalQte };
  }, [filteredSorties]);

  const totalPages = Math.ceil(filteredSorties.length / itemsPerPage);
  const paginatedSorties = filteredSorties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectSorties = useMemo(() => {
    return (sorties || []).filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  }, [sorties, selectedIds]);

  const handleConfirmCancelRemise = () => {
    const idsToUpdate = selectSorties.map((sor) => sor.id as number);
    updateRemiseSortie(idsToUpdate);
    reset();
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  return (
    <Box sx={{ py: 2 }}>
      {/* KPI Cards Récapitulatives */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
            Articles avec Remise
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consultez les articles vendus avec remise et gérez leur annulation ou réintégration.
          </Typography>
        </Box>

        <Grid container spacing={2}>
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
                    Articles Remisés
                  </Typography>
                  <LocalOfferIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'primary.main' }}>
                  {stats.totalArticles}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lignes de vente avec remise
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
                    Quantité Totale
                  </Typography>
                  <ReceiptLongIcon sx={{ color: '#10b981', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#10b981' }}>
                  {stats.totalQte} <Typography component="span" variant="caption">unités</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Volume total remisé
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
                    Chiffre d’Affaires Remisé
                  </Typography>
                  <HistoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#f59e0b' }}>
                  {formatNumberWithSpaces(stats.totalMontantVente)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Montant facturé total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Barre d'Actions & Filtres */}
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
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${filteredSorties.length} article(s) trouvé(s)`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
            {selectedIds.size > 0 && (
              <Chip
                label={`${selectedIds.size} sélectionné(s)`}
                color="secondary"
                size="small"
                sx={{ fontWeight: 700, borderRadius: '8px' }}
              />
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setSorties(sortiesEntreprise || [])}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2 }}
            >
              Tout Sélectionner
            </Button>

            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => setIsModalOpen(true)}
              disabled={selectedIds.size === 0}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              }}
            >
              Annuler Remises ({selectedIds.size})
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Champs de recherche et dates */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher par référence, client ou article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date début"
              value={selectedStartDate}
              onChange={(e) => {
                setSelectedStartDate(e.target.value);
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

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date fin"
              value={selectedEndDate}
              onChange={(e) => {
                setSelectedEndDate(e.target.value);
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

          <Grid item xs={12} md={1}>
            <Tooltip title="Réinitialiser les filtres">
              <IconButton
                onClick={handleResetFilters}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderRadius: '12px',
                  p: 1,
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Tableau des Sorties Remisées */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Aperçu</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Date & Sélection</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Référence</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Désignation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Quantité</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Prix Unitaire</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSorties.length > 0 ? (
              paginatedSorties.map((row) => (
                <CardTableSortie key={row.id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                  <Box sx={{ opacity: 0.6 }}>
                    <ReceiptLongIcon sx={{ fontSize: 56, mb: 1.5, color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight="700">Aucune remise trouvée</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Essayez de réinitialiser vos dates ou modifiez votre mot-clé de recherche.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
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

      {/* Modal de Confirmation pour Annulation Remise */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1.5,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="800">
            Confirmer l’Annulation des Remises
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Voulez-vous vraiment annuler la remise sur ces <strong>{selectSorties.length}</strong> article(s) ?
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '14px', mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Référence / Catégorie</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Quantité</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>P.U</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectSorties.map((post, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">{post.ref}</Typography>
                      <Typography variant="caption" color="text.secondary">{post.categorie_libelle}</Typography>
                    </TableCell>
                    <TableCell align="right">{post.qte} {post.unite === 'kilos' ? 'kg' : post.unite}</TableCell>
                    <TableCell align="right">{formatNumberWithSpaces(post.pu)} FCFA</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatNumberWithSpaces(post.prix_total)} FCFA
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#f59e0b', fontSize: '0.8rem', lineHeight: 1.4 }}>
              <strong>Important :</strong> L’annulation retirera ces articles de toute facturation différée associée et les rendra à nouveau disponibles pour une vente ordinaire.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setIsModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 600 }}
          >
            Retour
          </Button>
          <Button
            onClick={handleConfirmCancelRemise}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3.5,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
            }}
          >
            Confirmer l’Annulation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
