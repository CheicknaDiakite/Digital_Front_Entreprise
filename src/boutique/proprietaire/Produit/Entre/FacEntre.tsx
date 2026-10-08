import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  useTheme,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { ChangeEvent, FormEvent, useState, useMemo } from 'react';
import { useCreateFacEntre, useGetAllFacEntre } from '../../../../usePerso/fonction.facture';
import CardFacEntre from './CardFacEntre';
import MyTextField from '../../../../_components/Input/MyTextField';
import { FacSorType } from '../../../../typescript/fac';
import { useStoreUuid } from '../../../../usePerso/store';
import { RecupType } from '../../../../typescript/DataType';
import M_Abonnement from '../../../../_components/Card/M_Abonnement';
import { useFetchEntreprise, useFetchUser } from '../../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../../themes/AppSettingsContext';
import { PageHeader, KpiCard, FilterBar } from '../../../../_components/common';

export default function FacEntre() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';

  const { ajoutFacEntre } = useCreateFacEntre();
  const { facEntresUtilisateur, isLoading, isError, refetch } = useGetAllFacEntre(user_id, uuid!);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialog State
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [formValues, setFormValues] = useState<FacSorType>({
    user_id: '',
    libelle: '',
    date: new Date().toISOString().split('T')[0],
    ref: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: FacSorType = {
      ...formValues,
      user_id,
      facture: image,
      entreprise_id: uuid!,
    };

    ajoutFacEntre(payload);

    setFormValues({
      user_id: '',
      libelle: '',
      date: new Date().toISOString().split('T')[0],
      ref: '',
    });
    setImage(null);
    setOpen(false);
  };

  // KPIs calculés
  const kpis = useMemo(() => {
    const list = facEntresUtilisateur || [];
    const total = list.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonth = list.filter((item) => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const withAttachment = list.filter((item) => Boolean((item as any).facture)).length;

    return { total, thisMonth, withAttachment };
  }, [facEntresUtilisateur]);

  // Filtrage
  const filteredInvoices = useMemo(() => {
    if (!facEntresUtilisateur) return [];

    return facEntresUtilisateur.filter((item) => {
      // Filtre date
      if (startDate || endDate) {
        if (!item.date) return false;
        const itemTime = new Date(item.date).getTime();
        const startTime = startDate ? new Date(startDate).getTime() : null;
        const endTime = endDate ? new Date(endDate).getTime() : null;
        if (startTime !== null && itemTime < startTime) return false;
        if (endTime !== null && itemTime > endTime) return false;
      }

      // Filtre recherche
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchLib = item.libelle?.toLowerCase().includes(query);
        const matchRef = item.ref?.toLowerCase().includes(query);
        if (!matchLib && !matchRef) return false;
      }

      return true;
    });
  }, [facEntresUtilisateur, startDate, endDate, searchTerm]);

  // Tri décroissant
  const sortedInvoices = useMemo(() => {
    return filteredInvoices.slice().sort((a: RecupType, b: RecupType) => {
      if (a.id === undefined) return 1;
      if (b.id === undefined) return -1;
      return Number(b.id) - Number(a.id);
    });
  }, [filteredInvoices]);

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', p: { xs: 2, sm: 3 }, spaceY: 3 }}>
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '16px', mb: 3 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: '14px', mb: 2 }}>
          Impossible de charger le registre des factures d'achat.
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ borderRadius: '10px', textTransform: 'none' }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 1.5, sm: 3 }, spaceY: 3 }}>
      {/* En-tête PageHeader */}
      <PageHeader
        title="Factures d'Achats & Approvisionnements"
        subtitle="Registre et pièces justificatives des factures fournisseurs et entrées en stock"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
            }}
          >
            Nouvelle Facture
          </Button>
        }
      />

      {/* Cartes KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Achats"
            value={kpis.total}
            subtitle="Toutes factures confondues"
            accentColor="#a855f7"
            icon={<LocalShippingOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Ce Mois-ci"
            value={kpis.thisMonth}
            subtitle="Enregistrées sur le mois en cours"
            accentColor="#3b82f6"
            icon={<DateRangeIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Avec Justificatif"
            value={kpis.withAttachment}
            subtitle="Pièces justificatives rattachées"
            accentColor="#10b981"
            icon={<AttachFileIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Résultats Filtrés"
            value={filteredInvoices.length}
            subtitle="Selon les filtres appliqués"
            accentColor="#f59e0b"
            icon={<DescriptionIcon />}
          />
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres temporels */}
      <Box sx={{ mb: 3 }}>
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Rechercher par libellé ou référence fournisseur..."
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
          showPresets
        />
      </Box>

      {/* Table Glassmorphique des Factures d'Entrée */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '18px',
          overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.35)' : '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <TableContainer sx={{ maxHeight: 650 }}>
          <Table stickyHeader aria-label="table des factures d'entrée">
            <TableHead>
              <TableRow>
                {['Date', 'Libellé', 'Référence', 'Justificatif', 'Actions'].map((header, idx) => (
                  <TableCell
                    key={header}
                    align={idx === 4 ? 'right' : 'left'}
                    sx={{
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.95)',
                      backdropFilter: 'blur(10px)',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
                      py: 1.8,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((row) => (
                  <CardFacEntre key={row.uuid || row.id} row={row} />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontWeight: 500,
                      py: 6,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 48, color: isDark ? '#475569' : '#cbd5e1' }} />
                      <Typography sx={{ fontWeight: 600, color: isDark ? '#cbd5e1' : '#475569' }}>
                        Aucune facture d'achat trouvée
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                        Modifiez vos critères de recherche ou enregistrez une nouvelle facture fournisseur.
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 2.5,
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Paper>

      {/* Modal Ajout Facture d'Entrée */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
            backdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            color: '#ffffff',
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ajouter une facture d'achat / approvisionnement
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {isLicenceExpired(unEntreprise?.licence_date_expiration) ? (
          <DialogContent sx={{ p: 3 }}>
            <M_Abonnement />
          </DialogContent>
        ) : (
          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <form onSubmit={onSubmit}>
              <Stack spacing={2.5}>
                <MyTextField
                  required
                  fullWidth
                  label="Libellé de la facture"
                  name="libelle"
                  value={formValues.libelle}
                  onChange={onChange}
                  placeholder="Ex: Facture livraison fournisseur"
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, color: '#94a3b8' }} />,
                  }}
                />

                <MyTextField
                  required
                  fullWidth
                  label="Numéro de Référence / Bon de livraison"
                  name="ref"
                  value={formValues.ref}
                  onChange={onChange}
                  placeholder="Ex: BON-APPRO-2026-09"
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ mr: 1, color: '#94a3b8' }} />,
                  }}
                />

                <MyTextField
                  required
                  fullWidth
                  label="Date de la facture"
                  name="date"
                  type="date"
                  value={formValues.date}
                  onChange={onChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRangeIcon sx={{ mr: 1, color: '#94a3b8' }} />,
                  }}
                />

                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#e9d5ff',
                    borderRadius: '14px',
                    p: 2.5,
                    textAlign: 'center',
                    backgroundColor: isDark ? 'rgba(168, 85, 247, 0.05)' : '#faf5ff',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 36, color: '#a855f7', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                    {image ? image.name : 'Pièce jointe fournisseur (PDF ou image)'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
                    Optionnel — Facture scannée, bon de commande ou reçu
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={<AttachFileIcon />}
                    sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#a855f7', color: '#a855f7' }}
                  >
                    Parcourir le fichier
                    <input type="file" hidden onChange={handleImageChange} accept=".pdf,image/*" />
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpen(false)}
                    sx={{ textTransform: 'none', borderRadius: '12px' }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                      boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    Enregistrer la facture
                  </Button>
                </Box>
              </Stack>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
