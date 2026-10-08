import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Alert,
  Box,
  Typography,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton,
  Stack,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useHistorySuppEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { HistoriqueType } from '../../../typescript/Account';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

// Skeletons de chargement
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', py: 2 }}>
    <Skeleton variant="text" width={320} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={4} key={i}>
          <Skeleton variant="rectangular" height={105} sx={{ borderRadius: '16px' }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: '20px' }} />
  </Box>
);

export default function HistoriqueSupp() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { suppH, isLoading, isError } = useHistorySuppEntreprise(uuid!);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [descDialog, setDescDialog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const dataList: HistoriqueType[] = suppH || [];

  // Filtrage combiné : Recherche texte et Date
  const filteredData = useMemo(() => {
    return dataList.filter((row) => {
      // 1. Filtre date
      if (selectedDate) {
        if (!row.date) return false;
        const rowD = new Date(row.date).toISOString().slice(0, 10);
        if (rowD !== selectedDate) return false;
      }

      // 2. Filtre recherche
      if (searchTerm) {
        const low = searchTerm.toLowerCase();
        const matchLib = row.libelle?.toLowerCase().includes(low);
        const matchCat = row.categorie?.toLowerCase().includes(low);
        const matchDesc = row.description?.toLowerCase().includes(low);
        if (!matchLib && !matchCat && !matchDesc) return false;
      }

      return true;
    });
  }, [dataList, searchTerm, selectedDate]);

  // Statistiques de synthèse
  const stats = useMemo(() => {
    const totalCount = filteredData.length;
    const totalQte = filteredData.reduce((acc, curr) => acc + (Number(curr.qte) || 0), 0);
    const totalValeur = filteredData.reduce((acc, curr) => {
      const qte = Number(curr.qte) || 0;
      const pu = Number(curr.pu) || 0;
      return acc + qte * pu;
    }, 0);

    return { totalCount, totalQte, totalValeur };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <Stack sx={{ width: '100%', py: 4 }} spacing={2}>
        <Alert severity="error" sx={{ borderRadius: '14px' }}>
          Une erreur est survenue lors de la récupération du registre des suppressions.
        </Alert>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
            Registre des Suppressions & Audit
          </Typography>
          <Chip
            label="Audit Sécurisé"
            size="small"
            color="error"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.675rem' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Journal d'audit inaltérable des retraits de marchandises et suppressions d'articles.
        </Typography>
      </Box>

      {/* Cartes Synthétiques */}
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
                  Suppressions Enregistrées
                </Typography>
                <DeleteSweepOutlinedIcon sx={{ color: '#ef4444', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#ef4444' }}>
                {stats.totalCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lignes d'articles supprimés
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
                  Quantités Retirées
                </Typography>
                <Inventory2OutlinedIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#f59e0b' }}>
                {stats.totalQte} <Typography component="span" variant="caption">unités</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Volume total sorti par suppression
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
                  Valeur Estimée Retirée
                </Typography>
                <SecurityOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main' }}>
                {formatNumberWithSpaces(stats.totalValeur)} <Typography component="span" variant="caption">FCFA</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Impact financier cumulé
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de Recherche et Filtres */}
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
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher par article, catégorie ou motif de suppression..."
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

          <Grid item xs={9} md={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Filtrer par date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
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

          <Grid item xs={3} md={1} display="flex" justifyContent="flex-end">
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

      {/* Tableau du Registre */}
      {filteredData.length === 0 ? (
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
          <SecurityOutlinedIcon sx={{ fontSize: 56, color: '#10b981', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            {dataList.length === 0
              ? 'Aucune suppression enregistrée. Vos stocks sont intègres.'
              : 'Aucun enregistrement ne correspond à vos filtres.'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Toutes les suppressions d'articles opérées sont tracées ici.
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
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Date de Suppression</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Type & Statut</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Quantité Retirée</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Prix Unitaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Motif de Suppression</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={`history-supp-${index}`}
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.03)',
                    borderLeft: '4px solid #ef4444',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.08)',
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
                      {format(new Date(row.date ?? new Date()), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </TableCell>

                  {/* Type / Statut */}
                  <TableCell>
                    <Chip
                      label="Supprimé"
                      size="small"
                      color="error"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    />
                  </TableCell>

                  {/* Libellé */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="700">
                      {row.libelle || '-'}
                    </Typography>
                  </TableCell>

                  {/* Catégorie */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.categorie || '-'}
                    </Typography>
                  </TableCell>

                  {/* Quantité */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="800" sx={{ color: '#ef4444' }}>
                      -{row.qte}
                    </Typography>
                  </TableCell>

                  {/* P.U */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatNumberWithSpaces(row.pu)} FCFA
                    </Typography>
                  </TableCell>

                  {/* Motif */}
                  <TableCell align="right">
                    {row.description ? (
                      <Tooltip title="Cliquer pour afficher le motif complet" arrow>
                        <Typography
                          variant="caption"
                          onClick={() => setDescDialog(row.description ?? null)}
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-block',
                            maxWidth: 200,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {row.description}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Modal Motif */}
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
            Motif de Suppression
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
