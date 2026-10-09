import { ChangeEvent, FormEvent, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { DepenseType } from '../../../typescript/DataType';
import { useCreateDepense, useGetAllDepense } from '../../../usePerso/fonction.entre';
import CardDepense from './CardDepense';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces, isInDateRange, isLicenceExpired } from '../../../usePerso/fonctionPerso';
import M_Abonnement from '../../../_components/Card/M_Abonnement';
import { useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import Chart_Dep from '../../../_components/Chart/Chart_Dep';
import { PageHeader, KpiCard, FilterBar } from '../../../_components/common';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { usePlanAccess } from '../../../hooks/usePlanAccess';
import FeatureGate from '../../../components/FeatureGate';
import './mobile-produit.css';

const EXPENSE_CATEGORIES = [
  'Loyer',
  'Salaires',
  'Électricité & Eau',
  'Transport',
  'Télécoms',
  'Fournitures',
  'Entretien',
  'Autre',
];

export default function Depense() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';

  const { depensesEntreprise, isLoading, isError, refetch } = useGetAllDepense(uuid!);
  const { ajoutDepense } = useCreateDepense();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 10 : 25;

  // Form states
  const [open, setOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<string>('Autre');
  const [formValues, setFormValues] = useState<{
    libelle: string;
    date: string;
    somme: number | string;
  }>({
    libelle: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    somme: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered expenses
  const filteredDepenses = useMemo(() => {
    return (depensesEntreprise || []).filter((item: DepenseType) => {
      // Date range filter
      if (!isInDateRange(item.date, selectedStartDate, selectedEndDate)) {
        return false;
      }

      // Category filter
      const match = (item.libelle || '').match(/^\[(.*?)\]\s*(.*)$/);
      const category = match ? match[1] : 'Autre';
      if (selectedCategory !== 'all' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const libMatch = (item.libelle || '').toLowerCase().includes(q);
        const sommeMatch = String(item.somme || '').includes(q);
        if (!libMatch && !sommeMatch) return false;
      }

      return true;
    });
  }, [depensesEntreprise, selectedStartDate, selectedEndDate, selectedCategory, searchTerm]);

  // Sorting
  const reversedDepenses = useMemo(() => {
    return [...filteredDepenses].sort((a: DepenseType, b: DepenseType) => {
      if (a.id === undefined) return 1;
      if (b.id === undefined) return -1;
      return Number(b.id) - Number(a.id);
    });
  }, [filteredDepenses]);

  // Totals & KPI Metrics across filtered period
  const metrics = useMemo(() => {
    const totalMontant = reversedDepenses.reduce((acc, d) => {
      const somme = d.somme ? parseFloat(String(d.somme)) : 0;
      return acc + somme;
    }, 0);

    const count = reversedDepenses.length;
    const average = count > 0 ? Math.round(totalMontant / count) : 0;
    const max = reversedDepenses.reduce((acc, d) => {
      const somme = d.somme ? parseFloat(String(d.somme)) : 0;
      return Math.max(acc, somme);
    }, 0);

    return { totalMontant, count, average, max };
  }, [reversedDepenses]);

  // Pagination
  const totalPages = Math.ceil(reversedDepenses.length / itemsPerPage);
  const depensesBoutic = useMemo(() => {
    return reversedDepenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [reversedDepenses, currentPage, itemsPerPage]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValues.somme || Number(formValues.somme) <= 0) {
      toast.error('Veuillez indiquer un montant supérieur à 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullLibelle = `[${formCategory}] ${formValues.libelle.trim() || formCategory}`;
      const payload: DepenseType = {
        libelle: fullLibelle,
        date: formValues.date,
        somme: Number(formValues.somme),
        user_id,
        facture: image,
        entreprise_id: uuid!,
      };

      await ajoutDepense(payload);
      toast.success('Dépense enregistrée avec succès');
      setFormValues({ libelle: '', date: format(new Date(), 'yyyy-MM-dd'), somme: '' });
      setImage(null);
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (reversedDepenses.length === 0) {
      toast.error('Aucune dépense à exporter');
      return;
    }

    const headers = ['Date', 'Catégorie', 'Libellé', 'Montant (F CFA)'];
    const rows = reversedDepenses.map((d: DepenseType) => {
      const match = (d.libelle || '').match(/^\[(.*?)\]\s*(.*)$/);
      const cat = match ? match[1] : 'Autre';
      const desc = match ? match[2] : d.libelle;
      return [
        `"${d.date ? format(new Date(d.date), 'dd/MM/yyyy') : ''}"`,
        `"${cat}"`,
        `"${(desc || '').replace(/"/g, '""')}"`,
        d.somme || 0,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Depenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dépenses exportées en CSV');
  };

  if (!planAccess.canManageExpenses) {
    return (
      <Box sx={{ width: '100%', py: 4 }}>
        <FeatureGate
          hasAccess={false}
          requiredPlan="Stock Pro"
          featureTitle="Gestion des Dépenses"
          description="Enregistrez et analysez les charges d'exploitation de votre entreprise (loyer, salaires, factures, fournitures) avec bilans et justificatifs."
        >
          <div />
        </FeatureGate>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Une erreur est survenue lors du chargement des dépenses.
        </Alert>
        <Button variant="outlined" color="primary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Gestion des Dépenses"
        subtitle="Suivi des charges d'exploitation, factures et dépenses professionnelles"
        breadcrumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Finances', to: '/finances/depenses' },
          { label: 'Dépenses' },
        ]}
        actions={
          <Stack direction="row" spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                },
              }}
            >
              + Nouvelle Dépense
            </Button>
          </Stack>
        }
      />

      {/* ── KPI Cards Strip ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total des dépenses"
            value={`${formatNumberWithSpaces(metrics.totalMontant)} F`}
            subtitle="Période sélectionnée"
            icon={<TrendingDownIcon />}
            accentColor="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Nombre d'opérations"
            value={metrics.count}
            subtitle="Factures & reçus"
            icon={<ReceiptIcon />}
            accentColor="#6366f1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Dépense moyenne"
            value={`${formatNumberWithSpaces(metrics.average)} F`}
            subtitle="Par transaction"
            icon={<AccountBalanceWalletIcon />}
            accentColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Plus forte charge"
            value={`${formatNumberWithSpaces(metrics.max)} F`}
            subtitle="Sur la période"
            icon={<LocalAtmIcon />}
            accentColor="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* ── Chart Section ── */}
      <Box sx={{ mb: 3 }}>
        <Chart_Dep />
      </Box>

      {/* ── Filter Bar + Category Chips + Table ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '20px',
          background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Stack spacing={2}>
          {/* Filter Bar with presets */}
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            searchPlaceholder="Rechercher par libellé ou montant..."
            startDate={selectedStartDate}
            endDate={selectedEndDate}
            onDateRangeChange={(start, end) => {
              setSelectedStartDate(start);
              setSelectedEndDate(end);
              setCurrentPage(1);
            }}
          />

          {/* Category Chips Filter */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.8,
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            <Chip
              size="small"
              label="Toutes catégories"
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
            {EXPENSE_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                size="small"
                label={cat}
                color={selectedCategory.toLowerCase() === cat.toLowerCase() ? 'primary' : 'default'}
                variant={selectedCategory.toLowerCase() === cat.toLowerCase() ? 'filled' : 'outlined'}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              />
            ))}
          </Box>

          {/* Table Container */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '14px',
              bgcolor: 'transparent',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Libellé / Objet</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Montant</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Reçu</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depensesBoutic.length > 0 ? (
                  depensesBoutic.map((row, index) => <CardDepense key={row.uuid || index} row={row} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <ReceiptIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                      Aucune dépense trouvée sur cette sélection
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, p) => setCurrentPage(p)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: '8px', fontWeight: 600 },
                }}
              />
            </Box>
          )}
        </Stack>
      </Paper>

      {/* ── Modal Ajouter Dépense ── */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#152238' : '#ffffff',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark
              ? '0 25px 60px rgba(0,0,0,0.75), 0 0 35px rgba(239,68,68,0.1)'
              : '0 20px 45px rgba(0,0,0,0.15)',
            colorScheme: isDark ? 'dark' : 'light',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 2.5, sm: 3 },
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 14px rgba(239,68,68,0.35)',
                flexShrink: 0,
              }}
            >
              <TrendingDownIcon sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                Enregistrer une Dépense
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Saisie d'une charge d'exploitation ou sortie de caisse
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <DialogContent sx={{ p: 3 }}>
            <M_Abonnement />
          </DialogContent>
        ) : (
          <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, pt: '20px !important' }}>
            <Box component="form" onSubmit={onSubmit}>
              {/* Category selector chips */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#94a3b8' : 'text.secondary', display: 'block', mb: 1 }}>
                Catégorie de la dépense :
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2.5 }}>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = formCategory === cat;
                  return (
                    <Chip
                      key={cat}
                      label={cat}
                      onClick={() => setFormCategory(cat)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        bgcolor: isSelected
                          ? '#ef4444'
                          : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.03)',
                        color: isSelected
                          ? '#ffffff'
                          : isDark
                          ? '#cbd5e1'
                          : '#475569',
                        borderColor: isSelected
                          ? '#ef4444'
                          : isDark
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(0,0,0,0.14)',
                        '&:hover': {
                          bgcolor: isSelected ? '#dc2626' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                        },
                      }}
                    />
                  );
                })}
              </Box>

              <Grid container spacing={2}>
                {/* Montant */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="number"
                    label="Montant de la dépense"
                    value={formValues.somme}
                    onChange={(e) => setFormValues({ ...formValues, somme: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ '& p': { color: isDark ? '#fca5a5' : '#ef4444', fontWeight: 700 } }}>
                          F CFA
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-input': { fontWeight: 800, color: isDark ? '#f87171' : '#ef4444', fontSize: '1rem' },
                    }}
                  />
                </Grid>

                {/* Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="date"
                    label="Date de la dépense"
                    value={formValues.date}
                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ style: { colorScheme: isDark ? 'dark' : 'light' } }}
                  />
                </Grid>

                {/* Libellé / Détail */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description / Motif du paiement"
                    placeholder="Ex: Facture SODECI / CIE du mois, Paiement loyer magasin..."
                    value={formValues.libelle}
                    onChange={(e) => setFormValues({ ...formValues, libelle: e.target.value })}
                  />
                </Grid>

                {/* Justificatif / Reçu */}
                <Grid item xs={12}>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon sx={{ color: isDark ? '#f87171' : '#ef4444' }} />}
                    sx={{
                      py: 1.3,
                      borderRadius: '12px',
                      textTransform: 'none',
                      borderStyle: 'dashed',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.45)' : '#fca5a5',
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fff5f5',
                      color: isDark ? '#fca5a5' : '#b91c1c',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#ef4444',
                        bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                      },
                    }}
                  >
                    {image ? image.name : 'Joindre un justificatif / reçu / facture (optionnel)'}
                    <input type="file" hidden accept="image/*,.pdf" onChange={handleImageChange} />
                  </Button>
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpen(false)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : undefined,
                    color: isDark ? '#cbd5e1' : undefined,
                    '&:hover': {
                      borderColor: isDark ? 'rgba(255,255,255,0.4)' : undefined,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : undefined,
                    },
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                  }}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer la dépense'}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
