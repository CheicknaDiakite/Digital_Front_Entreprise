import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Tooltip,
  MenuItem,
  CircularProgress,
  Avatar,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from '@mui/icons-material/BorderColor';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import toast from 'react-hot-toast';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise, useFetchUser } from '../../usePerso/fonction.user';
import { useGetAllEntre } from '../../usePerso/fonction.entre';
import {
  useCategoriesEntreprise,
  useCreateCategorie,
  useCreateSousCate,
  useAllGetSousCate,
} from '../../usePerso/fonction.categorie';
import { BASE } from '../../_services/caller.service';
import defaultProductImg from '../../../public/icon-192x192.png';
import { PageHeader, KpiCard } from '../../_components/common';
import { RecupType } from '../../typescript/DataType';
import { usePlanAccess } from '../../hooks/usePlanAccess';

export default function CatalogueUnifie() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();

  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unUser } = useFetchUser();
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid || '');
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const canUploadImage = !planAccess.isDecouverte && planAccess.canUploadMedia;

  const isDecouverteOwner = !unUser?.role || unUser?.role === 0 || unEntreprise?.proprietaire_id === unUser?.id;
  const isOwner = unUser?.role === 1 || isDecouverteOwner;
  const isManager = unUser?.role === 2;
  const canManageStock = isOwner || isManager;

  // Queries
  const { cateEntreprises = [], isLoading: isCatLoading } = useCategoriesEntreprise(entreprise_uuid || '');
  const { entresEntreprise = [], isLoading: isStockLoading, refetch: refetchStock } = useGetAllEntre(entreprise_uuid || '');

  // Mutations
  const { ajoutCategorieAsync } = useCreateCategorie();
  const { ajoutSousCateAsync } = useCreateSousCate();

  // State
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedSousCatUuid, setSelectedSousCatUuid] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Active Category object (when filtered by a specific category)
  const activeCategory = useMemo(() => {
    if (selectedCategorySlug === 'all') return null;
    return (
      cateEntreprises.find(
        (c) => c.slug === selectedCategorySlug || c.uuid === selectedCategorySlug || c.libelle === selectedCategorySlug
      ) || null
    );
  }, [selectedCategorySlug, cateEntreprises]);

  // Sous-catégories of active category
  const activeCategoryUuid = activeCategory?.uuid || activeCategory?.slug || '';
  const { getSousCates = [], isLoading: isSousCateLoading } = useAllGetSousCate(activeCategoryUuid);

  // Dialog States
  const [openCatModal, setOpenCatModal] = useState(false);
  const [newCatLibelle, setNewCatLibelle] = useState('');
  const [newCatImage, setNewCatImage] = useState<File | null>(null);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const [openProductModal, setOpenProductModal] = useState(false);
  const [newProductLibelle, setNewProductLibelle] = useState('');
  const [newProductCatSlug, setNewProductCatSlug] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Group / Filter Products
  const filteredProducts = useMemo(() => {
    return entresEntreprise.filter((item: RecupType) => {
      // Category filter
      if (selectedCategorySlug !== 'all') {
        const itemCatSlug = (item.categorie_slug || '').toLowerCase();
        const itemCatLib = (item.categorie_libelle || '').toLowerCase();
        const target = selectedCategorySlug.toLowerCase();
        if (itemCatSlug !== target && itemCatLib !== target) {
          return false;
        }
      }

      // Sous-catégorie filter
      if (selectedSousCatUuid !== 'all') {
        const itemSousCatUuid = (item as any).sous_categorie_uuid || (item as any).sous_categorie_id || '';
        const itemSousCatLib = (item.libelle || (item as any).sous_categorie_libelle || '').toLowerCase();
        const targetSousCat = selectedSousCatUuid.toLowerCase();
        if (itemSousCatUuid !== selectedSousCatUuid && itemSousCatLib !== targetSousCat) {
          return false;
        }
      }

      // Stock status filter
      const qte = Number(item.qte || 0);
      const seuil = Number((item as any).seuil_critique || 5);
      if (stockStatusFilter === 'in_stock' && (qte <= 0 || qte <= seuil)) return false;
      if (stockStatusFilter === 'low_stock' && (qte <= 0 || qte > seuil)) return false;
      if (stockStatusFilter === 'out_of_stock' && qte > 0) return false;

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const nameMatch = (item.libelle || '').toLowerCase().includes(q);
        const catMatch = (item.categorie_libelle || '').toLowerCase().includes(q);
        const refMatch = (item.ref || '').toLowerCase().includes(q);
        const barMatch = (item.barcode_value || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !refMatch && !barMatch) return false;
      }

      return true;
    });
  }, [entresEntreprise, selectedCategorySlug, selectedSousCatUuid, stockStatusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalRefs = entresEntreprise.length;
    let totalStockValueAchat = 0;
    let totalStockValueVente = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    entresEntreprise.forEach((item: any) => {
      const qte = Number(item.qte || 0);
      const pa = Number(item.pa || 0);
      const pu = Number(item.pu || 0);
      const seuil = Number(item.seuil_critique || 5);

      if (qte <= 0) {
        outOfStockCount++;
      } else if (qte <= seuil) {
        lowStockCount++;
      }

      totalStockValueAchat += qte * pa;
      totalStockValueVente += qte * pu;
    });

    return {
      totalRefs,
      totalStockValueAchat,
      totalStockValueVente,
      outOfStockCount,
      lowStockCount,
    };
  }, [entresEntreprise]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = [
      'Référence',
      'Libellé Produit',
      'Catégorie',
      'Stock Actuel',
      'Unité',
      "Prix d'Achat (F CFA)",
      'Prix de Vente (F CFA)',
      'Marge (%)',
      'Valeur Vente (F CFA)',
      'Statut Stock',
    ];

    const rows = filteredProducts.map((p: any) => {
      const qte = Number(p.qte || 0);
      const pa = Number(p.pa || 0);
      const pv = Number(p.pu || 0);
      const seuil = Number(p.seuil_critique || 5);
      const marge = pv > 0 ? (((pv - pa) / pv) * 100).toFixed(1) : '0';
      const statut = qte <= 0 ? 'Rupture' : qte <= seuil ? 'Critique' : 'Normal';

      return [
        `"${p.ref || ''}"`,
        `"${(p.libelle || '').replace(/"/g, '""')}"`,
        `"${(p.categorie_libelle || '').replace(/"/g, '""')}"`,
        qte,
        `"${p.unite || 'pièce'}"`,
        pa,
        pv,
        `"${marge}%"`,
        qte * pv,
        `"${statut}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Catalogue_Produits_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Catalogue exporté en CSV');
  };

  // Submit Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLibelle.trim()) {
      toast.error('Le libellé de la catégorie est obligatoire');
      return;
    }

    setIsSubmittingCat(true);
    const formData = new FormData();
    formData.append('libelle', newCatLibelle.trim());
    formData.append('entreprise_id', entreprise_uuid || '');
    formData.append('user_id', unUser?.uuid || '');
    if (newCatImage) {
      formData.append('image', newCatImage);
    }

    try {
      await ajoutCategorieAsync(formData as any);
      setIsSubmittingCat(false);
      setOpenCatModal(false);
      setNewCatLibelle('');
      setNewCatImage(null);
      toast.success('Catégorie créée avec succès');
    } catch {
      setIsSubmittingCat(false);
    }
  };

  // Submit Product / Sous-Catégorie
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductLibelle.trim()) {
      toast.error('Le libellé du produit est obligatoire');
      return;
    }
    if (!newProductCatSlug) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    setIsSubmittingProduct(true);
    const formData = new FormData();
    formData.append('libelle', newProductLibelle.trim());

    // Privilégier le UUID de la catégorie pour le backend
    const selectedCat = cateEntreprises.find(
      (c) => c.uuid === newProductCatSlug || c.slug === newProductCatSlug
    );
    const catIdentifier = selectedCat?.uuid || selectedCat?.slug || newProductCatSlug;
    formData.append('categorie_slug', catIdentifier);
    formData.append('user_id', unUser?.uuid || '');
    if (newProductImage) {
      formData.append('image', newProductImage);
    }

    try {
      await ajoutSousCateAsync(formData as any);
      setIsSubmittingProduct(false);
      setOpenProductModal(false);
      setNewProductLibelle('');
      setNewProductImage(null);
      refetchStock();
      toast.success('Produit créé avec succès');
    } catch {
      setIsSubmittingProduct(false);
    }
  };

  const isLoading = isCatLoading || isStockLoading;

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Catalogue des Produits"
        subtitle="Gestion unifiée des catégories, stocks disponibles et prix de vente"
        breadcrumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Stock', to: '/stock/catalogue' },
          { label: 'Catalogue' },
        ]}
        actions={
          <Stack direction="row" spacing={1.2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Export CSV
            </Button>
            {canManageStock && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={() => setOpenCatModal(true)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  + Catégorie
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (cateEntreprises.length > 0) {
                      setNewProductCatSlug(cateEntreprises[0].uuid || cateEntreprises[0].slug || '');
                    }
                    setOpenProductModal(true);
                  }}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  }}
                >
                  + Nouveau Produit
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {/* ── KPI Cards Strip ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Références en stock"
            value={metrics.totalRefs}
            subtitle={`${cateEntreprises.length} catégories actives`}
            icon={<Inventory2Icon />}
            accentColor="#6366f1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Valeur marchande (Vente)"
            value={`${formatNumberWithSpaces(metrics.totalStockValueVente)} F`}
            subtitle="Valeur estimée du stock"
            icon={<Inventory2Icon />}
            accentColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Stock critique"
            value={metrics.lowStockCount}
            subtitle="Sous le seuil d'alerte"
            icon={<WarningAmberIcon />}
            accentColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Ruptures de stock"
            value={metrics.outOfStockCount}
            subtitle="Produits indisponibles"
            icon={<ErrorOutlineIcon />}
            accentColor="#ef4444"
          />
        </Grid>
      </Grid>

      {/* ── Main Layout: Sidebar Categories + Products Content ── */}
      <Grid container spacing={3}>
        {/* ── LEFT SIDEBAR: Catégories Tree / List (~3 cols) ── */}
        <Grid item xs={12} md={3.5} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '20px',
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Categories Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 1.5,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CategoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Catégories
                </Typography>
                <Chip
                  size="small"
                  label={cateEntreprises.length}
                  sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                />
              </Stack>
              {canManageStock && (
                <IconButton size="small" onClick={() => setOpenCatModal(true)} color="primary">
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Categories List */}
            <Stack spacing={0.8}>
              {/* All Categories Option */}
              <Box
                onClick={() => {
                  setSelectedCategorySlug('all');
                  setSelectedSousCatUuid('all');
                  setCurrentPage(1);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background:
                    selectedCategorySlug === 'all'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.1) 100%)'
                      : 'transparent',
                  border: '1px solid',
                  borderColor: selectedCategorySlug === 'all' ? '#6366f1' : 'transparent',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: selectedCategorySlug === 'all' ? 800 : 600,
                    color: selectedCategorySlug === 'all' ? 'primary.main' : 'text.primary',
                  }}
                >
                  Toutes les catégories
                </Typography>
                <Tooltip title={`${entresEntreprise.length} article${entresEntreprise.length > 1 ? 's' : ''} au total`}>
                  <Chip
                    size="small"
                    label={`${entresEntreprise.length} art.`}
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: selectedCategorySlug === 'all' ? 'primary.main' : undefined,
                      color: selectedCategorySlug === 'all' ? '#fff' : undefined,
                    }}
                  />
                </Tooltip>
              </Box>

              {/* Individual Categories */}
              {cateEntreprises.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                const sousCatCount = Number(cat.sous_categorie_count ?? 0);
                const catProductsCount = entresEntreprise.filter(
                  (p: any) =>
                    (p.categorie_slug || '').toLowerCase() === (cat.slug || '').toLowerCase() ||
                    (p.categorie_libelle || '').toLowerCase() === (cat.libelle || '').toLowerCase()
                ).length;
                const catImgUrl = cat.image ? BASE(cat.image) : defaultProductImg;

                return (
                  <Box
                    key={cat.uuid || cat.slug}
                    onClick={() => {
                      setSelectedCategorySlug(cat.slug || '');
                      setSelectedSousCatUuid('all');
                      setCurrentPage(1);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.1) 100%)'
                        : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? '#6366f1' : 'transparent',
                      '&:hover': {
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ overflow: 'hidden', minWidth: 0, flex: 1, mr: 1 }}>
                      <Avatar
                        src={catImgUrl}
                        alt={cat.libelle}
                        sx={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: isSelected ? 800 : 500,
                          color: isSelected ? 'primary.main' : 'text.primary',
                          fontSize: '0.85rem',
                        }}
                      >
                        {cat.libelle}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.4} alignItems="center" sx={{ flexShrink: 0 }}>
                      <Tooltip
                        title={`${sousCatCount} sous-catégorie${sousCatCount > 1 ? 's' : ''}${
                          catProductsCount > 0 ? ` • ${catProductsCount} article${catProductsCount > 1 ? 's' : ''}` : ''
                        }`}
                      >
                        <Chip
                          size="small"
                          label={`${sousCatCount}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/categorie/sous/${cat.uuid}`);
                          }}
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.main' : undefined,
                            color: isSelected ? '#fff' : undefined,
                            '&:hover': {
                              opacity: 0.85,
                            },
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Voir les sous-catégories">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/categorie/sous/${cat.uuid}`);
                          }}
                          sx={{
                            p: 0.3,
                            color: isSelected ? 'primary.main' : 'text.secondary',
                            '&:hover': {
                              color: 'primary.main',
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)',
                            },
                          }}
                        >
                          <AccountTreeIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      {canManageStock && (
                        <Tooltip title="Modifier la catégorie">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/categorie/modif/${cat.uuid}`);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* ── RIGHT MAIN PANEL: Products Table & FilterBar (~9 cols) ── */}
        <Grid item xs={12} md={8.5} lg={9}>
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
            {/* Active Category Quick Bar */}
            {activeCategory && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    mb: 2,
                    p: 1.8,
                    borderRadius: '16px',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(30,41,59,0.7) 100%)'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(241,245,249,0.95) 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(99,102,241,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={activeCategory.image ? BASE(activeCategory.image as any) : undefined}
                      alt={activeCategory.libelle}
                      sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'primary.main' }}
                    >
                      <CategoryIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: '1.05rem' }}>
                          {activeCategory.libelle}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${getSousCates.length} sous-catégorie(s)`}
                          color="primary"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                        />
                        {selectedSousCatUuid !== 'all' && (
                          <Chip
                            size="small"
                            label="Filtre sous-catégorie actif"
                            color="secondary"
                            onDelete={() => setSelectedSousCatUuid('all')}
                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Catégorie active • {filteredProducts.length} référence(s) en stock affichée(s)
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {canManageStock && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        onClick={() => {
                          setNewProductCatSlug(activeCategory.slug || activeCategory.uuid || '');
                          setOpenProductModal(true);
                        }}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                        }}
                      >
                        + Sous-catégorie
                      </Button>
                    )}
                    {canManageStock && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/categorie/modif/${activeCategory.uuid}`)}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          textTransform: 'none',
                        }}
                      >
                        Modifier catégorie
                      </Button>
                    )}
                  </Stack>
                </Box>

                {/* ── SOUS-CATEGORIES CARDS GRID ── */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Sous-catégories de « {activeCategory.libelle} »
                      </Typography>
                      <Chip
                        size="small"
                        label={getSousCates.length}
                        sx={{ height: 18, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                    </Stack>
                    {selectedSousCatUuid !== 'all' && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setSelectedSousCatUuid('all')}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}
                      >
                        Réinitialiser le filtre
                      </Button>
                    )}
                  </Box>

                  {isSousCateLoading ? (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : getSousCates.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        borderRadius: '14px',
                        border: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
                      }}
                    >
                      <AccountTreeIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Aucune sous-catégorie créée pour le moment
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        Ajoutez des sous-catégories pour organiser les articles de cette catégorie.
                      </Typography>
                      {canManageStock && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon fontSize="small" />}
                          onClick={() => {
                            setNewProductCatSlug(activeCategory.slug || activeCategory.uuid || '');
                            setOpenProductModal(true);
                          }}
                          sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                        >
                          Créer une sous-catégorie
                        </Button>
                      )}
                    </Paper>
                  ) : (
                    <Grid container spacing={1.5}>
                      {getSousCates.map((sc: any) => {
                        const scImg = sc.image ? BASE(sc.image) : defaultProductImg;
                        const isScSelected = selectedSousCatUuid === sc.uuid;
                        const scStockRefs = entresEntreprise.filter(
                          (p: any) =>
                            (p.sous_categorie_uuid && p.sous_categorie_uuid === sc.uuid) ||
                            (p.sous_categorie_id && p.sous_categorie_id === sc.uuid) ||
                            ((p.libelle || '').toLowerCase() === (sc.libelle || '').toLowerCase())
                        );
                        const totalQte = scStockRefs.reduce((acc: number, curr: any) => acc + Number(curr.qte || 0), 0);

                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={sc.uuid || sc.id || sc.slug}>
                            <Paper
                              elevation={0}
                              sx={{
                                position: 'relative',
                                p: 1.5,
                                borderRadius: '14px',
                                background: isScSelected
                                  ? isDark
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(30,41,59,0.9) 100%)'
                                    : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, #ffffff 100%)'
                                  : isDark
                                  ? 'rgba(15, 23, 42, 0.6)'
                                  : '#f8fafc',
                                border: '1.5px solid',
                                borderColor: isScSelected ? '#6366f1' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.3)' : '0 6px 18px rgba(99,102,241,0.1)',
                                  borderColor: '#6366f1',
                                },
                              }}
                            >
                              {/* Edit Button */}
                              {canManageStock && (
                                <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                                  <Tooltip title="Modifier">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/categorie/sous/modif/${sc.uuid}`)}
                                      sx={{
                                        p: 0.4,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                        '&:hover': { bgcolor: 'primary.main', color: '#fff' },
                                      }}
                                    >
                                      <EditIcon sx={{ fontSize: 13 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}

                              {/* Image & Title */}
                              <Box
                                onClick={() => {
                                  // Toggle filter by this sous-catégorie
                                  setSelectedSousCatUuid(isScSelected ? 'all' : sc.uuid);
                                  setCurrentPage(1);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                  flexGrow: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 58,
                                    height: 58,
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                                    p: 0.8,
                                    mb: 1,
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <img
                                    src={scImg}
                                    alt={sc.libelle}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                </Box>

                                <Typography
                                  variant="subtitle2"
                                  title={sc.libelle}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    color: isScSelected ? 'primary.main' : 'text.primary',
                                    mb: 0.8,
                                    lineHeight: 1.2,
                                    maxHeight: 2.4 * 14,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {sc.libelle}
                                </Typography>

                                {/* <Chip
                                  size="small"
                                  label={
                                    totalQte > 0
                                      ? `${totalQte} en stock (${scStockRefs.length} lot${scStockRefs.length > 1 ? 's' : ''})`
                                      : '0 en stock'
                                  }
                                  sx={{
                                    height: 20,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    bgcolor: totalQte > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                                    color: totalQte > 0 ? '#10b981' : 'text.secondary',
                                    mb: 1,
                                  }}
                                /> */}
                              </Box>

                              {/* Card Actions Footer */}
                              <Stack direction="row" spacing={0.6} sx={{ mt: 'auto', pt: 0.8, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button
                                  size="small"
                                  fullWidth
                                  variant={isScSelected ? 'contained' : 'outlined'}
                                  onClick={() => {
                                    setSelectedSousCatUuid(isScSelected ? 'all' : sc.uuid);
                                    setCurrentPage(1);
                                  }}
                                  sx={{
                                    height: 24,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {isScSelected ? 'Filtré ✓' : 'Filtrer'}
                                </Button>
                                <Tooltip title="Voir les statistiques & détails">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/categorie/info/${sc.uuid}`)}
                                    sx={{
                                      p: 0.4,
                                      borderRadius: '6px',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      color: 'primary.main',
                                    }}
                                  >
                                    <BarChartIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
                <Divider sx={{ my: 2.5 }} />
              </Box>
            )}

            {/* Section Header: Lots en stock */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Inventory2Icon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {activeCategory ? `Lots & Références en stock (${activeCategory.libelle})` : 'Tous les produits en stock'}
                </Typography>
                <Chip
                  size="small"
                  label={filteredProducts.length}
                  sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                />
              </Stack>
            </Box>

            {/* Filter Bar + Mode Switch */}
            <Box sx={{ mb: 2.5 }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={6} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Rechercher par nom, référence ou code-barres..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                      },
                    }}
                  />
                </Grid>

                {/* Stock Status Filter Chips */}
                <Grid item xs={12} sm={6} md={5}>
                  <Stack direction="row" spacing={0.6} flexWrap="wrap">
                    <Chip
                      size="small"
                      label="Tous"
                      color={stockStatusFilter === 'all' ? 'primary' : 'default'}
                      onClick={() => setStockStatusFilter('all')}
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label="En stock"
                      color={stockStatusFilter === 'in_stock' ? 'success' : 'default'}
                      onClick={() => setStockStatusFilter('in_stock')}
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label="Critique"
                      color={stockStatusFilter === 'low_stock' ? 'warning' : 'default'}
                      onClick={() => setStockStatusFilter('low_stock')}
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label="Rupture"
                      color={stockStatusFilter === 'out_of_stock' ? 'error' : 'default'}
                      onClick={() => setStockStatusFilter('out_of_stock')}
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                  </Stack>
                </Grid>

                {/* View Mode Toggle */}
                <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('table')}
                      color={viewMode === 'table' ? 'primary' : 'default'}
                      sx={{
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: viewMode === 'table' ? 'primary.main' : 'divider',
                      }}
                    >
                      <ViewListIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('grid')}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                      sx={{
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: viewMode === 'grid' ? 'primary.main' : 'divider',
                      }}
                    >
                      <ViewModuleIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Results Count */}
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Affichage de {paginatedProducts.length} sur {filteredProducts.length} référence(s)
            </Typography>

            {isLoading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Inventory2Icon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Aucun produit trouvé
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Ajustez vos filtres de recherche ou ajoutez un nouveau produit.
                </Typography>
              </Box>
            ) : viewMode === 'table' ? (
              /* ── TABLE VIEW ── */
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', borderRadius: '14px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Produit</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Catégorie</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Stock</TableCell>
                      {canManageStock && (
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Prix Achat</TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Prix Vente</TableCell>
                      {canManageStock && (
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Marge</TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Valeur Stock</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProducts.map((p: any) => {
                      const qte = Number(p.qte || 0);
                      const pa = Number(p.pa || 0);
                      const pv = Number(p.pu || 0);
                      const seuil = Number(p.seuil_critique || 5);
                      const isOutOfStock = qte <= 0;
                      const isLowStock = qte > 0 && qte <= seuil;
                      const marginPct = pv > 0 ? (((pv - pa) / pv) * 100).toFixed(1) : '0';
                      const imgUrl = p.image ? BASE(p.image) : defaultProductImg;

                      return (
                        <TableRow
                          key={p.uuid || p.id}
                          hover
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          }}
                        >
                          {/* Product Info */}
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                src={imgUrl}
                                alt={p.libelle}
                                sx={{ width: 36, height: 36, borderRadius: '8px' }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                  {p.libelle}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                                  Réf: {p.ref || 'S/R'}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Category */}
                          <TableCell>
                            <Chip
                              size="small"
                              label={p.categorie_libelle || 'Général'}
                              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
                            />
                          </TableCell>

                          {/* Stock Status Badge */}
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={`${qte} ${p.unite || 'pièce'}`}
                              sx={{
                                height: 22,
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                bgcolor: isOutOfStock
                                  ? 'rgba(239,68,68,0.15)'
                                  : isLowStock
                                  ? 'rgba(249,115,22,0.15)'
                                  : 'rgba(16,185,129,0.15)',
                                color: isOutOfStock
                                  ? '#ef4444'
                                  : isLowStock
                                  ? '#f97316'
                                  : '#10b981',
                              }}
                            />
                          </TableCell>

                          {/* PA */}
                          {canManageStock && (
                            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                              {formatNumberWithSpaces(pa)} F
                            </TableCell>
                          )}

                          {/* PV */}
                          <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: 'primary.main' }}>
                            {formatNumberWithSpaces(pv)} F
                          </TableCell>

                          {/* Marge */}
                          {canManageStock && (
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={`${marginPct}%`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: Number(marginPct) >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                  color: Number(marginPct) >= 0 ? '#10b981' : '#ef4444',
                                }}
                              />
                            </TableCell>
                          )}

                          {/* Total Value */}
                          <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                            {formatNumberWithSpaces(qte * pv)} F
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {/* <Tooltip title="Fiche produit détaillée">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/categorie/info/${p.uuid}`)}
                                  color="primary"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip> */}
                              <Tooltip title="Approvisionner ce produit">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate('/entre')}
                                  color="success"
                                >
                                  <AddShoppingCartIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* ── GRID CARDS VIEW ── */
              <Grid container spacing={2}>
                {paginatedProducts.map((p: any) => {
                  const qte = Number(p.qte || 0);
                  const pv = Number(p.pu || 0);
                  const pa = Number(p.pa || 0);
                  const seuil = Number(p.seuil_critique || 5);
                  const isOutOfStock = qte <= 0;
                  const isLowStock = qte > 0 && qte <= seuil;
                  const marginPct = pv > 0 ? (((pv - pa) / pv) * 100).toFixed(1) : '0';
                  const imgUrl = p.image ? BASE(p.image) : defaultProductImg;

                  return (
                    <Grid item xs={12} sm={6} lg={4} key={p.uuid || p.id}>
                      <Card
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                          <Avatar
                            src={imgUrl}
                            alt={p.libelle}
                            sx={{ width: 56, height: 56, borderRadius: '12px' }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
                              {p.libelle}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {p.categorie_libelle || 'Général'} · Réf: {p.ref || 'S/R'}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={`${qte} ${p.unite || 'pièce'}`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  bgcolor: isOutOfStock
                                    ? 'rgba(239,68,68,0.15)'
                                    : isLowStock
                                    ? 'rgba(249,115,22,0.15)'
                                    : 'rgba(16,185,129,0.15)',
                                  color: isOutOfStock
                                    ? '#ef4444'
                                    : isLowStock
                                    ? '#f97316'
                                    : '#10b981',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Prix de vente
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {formatNumberWithSpaces(pv)} F CFA
                            </Typography>
                          </Box>

                          {canManageStock && (
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Marge estimée
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: Number(marginPct) >= 0 ? '#10b981' : '#ef4444' }}>
                                {marginPct}%
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ mt: 'auto', pt: 1, display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/categorie/info/${p.uuid}`)}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                          >
                            Détail
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => navigate('/entre')}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            }}
                          >
                            Appro
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
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
          </Paper>
        </Grid>
      </Grid>

      {/* ── Modal Créer Catégorie ── */}
      <Dialog
        open={openCatModal}
        onClose={() => {
          setOpenCatModal(false);
          setNewCatLibelle('');
          setNewCatImage(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#152238' : '#ffffff',
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(99, 102, 241, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
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
            alignItems: 'flex-start',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                flexShrink: 0,
              }}
            >
              <FolderOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                Nouvelle Catégorie
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Organisez vos articles par famille ou rayon
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setOpenCatModal(false);
              setNewCatLibelle('');
              setNewCatImage(null);
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, pt: '20px !important' }}>
          <Box component="form" onSubmit={handleCreateCategory}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary' }}>
                Nom de la catégorie <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ex : Boissons, Épicerie, Électronique, Vêtements..."
                value={newCatLibelle}
                onChange={(e) => setNewCatLibelle(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: isDark ? '#818cf8' : 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.38)' : 'primary.main',
                    },
                  },
                }}
              />
            </Box>

            {/* Zone d'importation d'image */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary' }}>
                Illustration de la catégorie
              </Typography>

              {!canUploadImage ? (
                // Verrouillé en Mode Découverte : non cliquable
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1.5px dashed',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)',
                    bgcolor: isDark ? 'rgba(245, 158, 11, 0.06)' : 'rgba(254, 243, 199, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.8,
                    cursor: 'not-allowed',
                    userSelect: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LockOutlinedIcon sx={{ color: '#d97706', fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                        Import d'image restreint
                      </Typography>
                      <Chip
                        icon={<WorkspacePremiumIcon sx={{ fontSize: '12px !important', color: '#fff' }} />}
                        label="Formule Pro"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: '#8b5cf6',
                          color: '#fff',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35 }}>
                      En <strong>Mode Découverte</strong>, l'ajout d'images est désactivé. La catégorie utilisera l'icône système standard.
                    </Typography>
                  </Box>
                </Box>
              ) : newCatImage ? (
                // Image sélectionnée (Mode Pro+)
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  }}
                >
                  <Box
                    component="img"
                    src={URL.createObjectURL(newCatImage)}
                    alt="Aperçu"
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                      {newCatImage.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {(newCatImage.size / 1024).toFixed(0)} Ko
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setNewCatImage(null)}
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.08)',
                      '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                // Zone de téléchargement active (Mode Pro+)
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2.5,
                    borderRadius: '14px',
                    border: '2px dashed',
                    borderColor: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.3)',
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.04)' : 'rgba(99, 102, 241, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#6366f1',
                      bgcolor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewCatImage(e.target.files[0]);
                      }
                    }}
                  />
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      bgcolor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2 }}>
                    Importer une illustration
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    PNG, JPG ou WEBP (Optionnel, max 5 Mo)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Boutons d'action */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenCatModal(false);
                  setNewCatLibelle('');
                  setNewCatImage(null);
                }}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingCat}
                startIcon={isSubmittingCat ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                }}
              >
                {isSubmittingCat ? 'Création...' : 'Créer la catégorie'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── Modal Créer Produit ── */}
      <Dialog
        open={openProductModal}
        onClose={() => {
          setOpenProductModal(false);
          setNewProductLibelle('');
          setNewProductImage(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#152238' : '#ffffff',
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(16, 185, 129, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
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
            alignItems: 'flex-start',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
                flexShrink: 0,
              }}
            >
              <Inventory2OutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                Nouveau Produit
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Ajoutez une référence d'article dans votre catalogue
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setOpenProductModal(false);
              setNewProductLibelle('');
              setNewProductImage(null);
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, pt: '20px !important' }}>
          <Box component="form" onSubmit={handleCreateProduct}>
            {/* Nom du produit */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary' }}>
                Libellé du produit <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ex : Smartphone Galaxy S24, Coca-Cola 33cl, Paquet de Sucre 1kg..."
                value={newProductLibelle}
                onChange={(e) => setNewProductLibelle(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Icon sx={{ color: isDark ? '#34d399' : 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.38)' : 'primary.main',
                    },
                  },
                }}
              />
            </Box>

            {/* Catégorie parente */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary' }}>
                Catégorie de rattachement <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                value={newProductCatSlug}
                onChange={(e) => setNewProductCatSlug(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: isDark ? '#34d399' : 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.38)' : 'primary.main',
                    },
                  },
                }}
              >
                {cateEntreprises.map((c) => (
                  <MenuItem key={c.uuid || c.slug} value={c.uuid || c.slug}>
                    {c.libelle}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Zone d'importation d'image */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: 'text.primary' }}>
                Photo du produit
              </Typography>

              {!canUploadImage ? (
                // Verrouillé en Mode Découverte : non cliquable
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1.5px dashed',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)',
                    bgcolor: isDark ? 'rgba(245, 158, 11, 0.06)' : 'rgba(254, 243, 199, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.8,
                    cursor: 'not-allowed',
                    userSelect: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LockOutlinedIcon sx={{ color: '#d97706', fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                        Import d'image restreint
                      </Typography>
                      <Chip
                        icon={<WorkspacePremiumIcon sx={{ fontSize: '12px !important', color: '#fff' }} />}
                        label="Formule Pro"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: '#8b5cf6',
                          color: '#fff',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35 }}>
                      En <strong>Mode Découverte</strong>, l'ajout d'images est désactivé. Le produit utilisera le visuel système standard.
                    </Typography>
                  </Box>
                </Box>
              ) : newProductImage ? (
                // Image sélectionnée (Mode Pro+)
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  }}
                >
                  <Box
                    component="img"
                    src={URL.createObjectURL(newProductImage)}
                    alt="Aperçu"
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                      {newProductImage.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {(newProductImage.size / 1024).toFixed(0)} Ko
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setNewProductImage(null)}
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.08)',
                      '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                // Zone de téléchargement active (Mode Pro+)
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2.5,
                    borderRadius: '14px',
                    border: '2px dashed',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.3)',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#10b981',
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewProductImage(e.target.files[0]);
                      }
                    }}
                  />
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2 }}>
                    Importer une photo du produit
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    PNG, JPG ou WEBP (Optionnel, max 5 Mo)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Boutons d'action */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenProductModal(false);
                  setNewProductLibelle('');
                  setNewProductImage(null);
                }}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingProduct}
                startIcon={isSubmittingProduct ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                {isSubmittingProduct ? 'Création...' : 'Créer le produit'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
