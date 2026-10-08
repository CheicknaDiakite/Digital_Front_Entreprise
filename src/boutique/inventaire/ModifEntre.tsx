import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouteParams } from '../../typescript/DataType';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  IconButton,
  Switch,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Skeleton,
  Grid,
  Stack,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarcodeScanner from '../../_components/Input/BarcodeScanner';
import { useDeleteEntre, useFetchEntre, useUpdateEntre } from '../../usePerso/fonction.entre';
import { useFetchUser } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useTheme } from '@mui/material/styles';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { PageHeader } from '../../_components/common';

const UNITE_CHOICES = [
  { label: 'Pièce(s)', value: 'pièce' },
  { label: 'Kilos (kg)', value: 'kilos' },
  { label: 'Litre (L)', value: 'litre' },
  { label: 'Mètres (m)', value: 'mètres' },
  { label: 'Carton(s)', value: 'carton' },
  { label: 'Paquet(s)', value: 'paquet' },
  { label: 'Boîte(s)', value: 'boîte' },
  { label: 'Bouteille(s)', value: 'bouteille' },
  { label: 'Sac(s)', value: 'sac' },
];

export default function ModifEntre() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams<RouteParams>();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { unEntre, setUnEntre, isLoading } = useFetchEntre(uuid!);
  const { unUser } = useFetchUser();

  const user_id = unUser?.uuid || '';
  const { updateEntre } = useUpdateEntre();
  const { deleteEntre } = useDeleteEntre();

  const [ajout_terminer, setTerminer] = useState(true);
  const [is_prix, setPrix] = useState(true);
  const [showAncien, setShowAncien] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unEntre) {
      if (unEntre.is_sortie !== undefined) setTerminer(Boolean(unEntre.is_sortie));
      if (unEntre.is_prix !== undefined) setPrix(Boolean(unEntre.is_prix));
      if (unEntre.description && unEntre.description.trim() !== '') {
        setShowAncien(true);
      }
    }
  }, [unEntre]);

  const handleAutoCompleteChange = (_event: any, newValue: any) => {
    setUnEntre({
      ...unEntre,
      unite: newValue ? newValue.value : 'kilos',
    });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnEntre({
      ...unEntre,
      [name]: value,
    });
  };

  const handleScanResult = (code: string) => {
    setUnEntre({
      ...unEntre,
      barcode_value: code.trim(),
    });
    setOpenScanner(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateEntre({
      ...unEntre,
      libelle: (unEntre.libelle || '').trim(),
      barcode_value: (unEntre.barcode_value || '').trim(),
      qte: Number(unEntre.qte) || 0,
      qte_critique: Number(unEntre.qte_critique) || 0,
      pu: Number(unEntre.pu) || 0,
      pu_achat: Number(unEntre.pu_achat) || 0,
      is_sortie: ajout_terminer,
      is_prix: is_prix,
      user_id,
      entreprise_id: entreprise_id!,
    });

    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const confirmDelete = () => {
    deleteEntre(unEntre);
    setShowConfirm(false);
  };

  // Calculs financiers & indicateurs de marge
  const qte = Number(unEntre?.qte || 0);
  const qteCritique = Number(unEntre?.qte_critique || 0);
  const puVente = Number(unEntre?.pu || 0);
  const puAchat = Number(unEntre?.pu_achat || 0);

  const margeUnitaire = puVente - puAchat;
  const tauxMarge = puAchat > 0 ? ((margeUnitaire / puAchat) * 100).toFixed(1) : null;
  const valeurStockVente = qte * puVente;
  const valeurStockAchat = qte * puAchat;

  const isStockRupture = qte <= 0;
  const isStockCritique = qte > 0 && qte <= qteCritique;

  const cardStyle = {
    p: { xs: 2.5, sm: 3 },
    borderRadius: '18px',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.8)',
    background: isDark
      ? 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.6) 100%)'
      : '#ffffff',
    backdropFilter: 'blur(16px)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.04)',
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
      transition: 'all 0.2s ease',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6366f1',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
      },
      '&.Mui-disabled': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9',
      },
    },
  };

  if (isLoading || !unEntre) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '18px' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '18px' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '18px' }} />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* En-tête de page moderne */}
        <PageHeader
          title="Modifier le lot en stock"
          subtitle={`Lot : ${unEntre.libelle || 'Article'} (Réf. ${unEntre.ref || unEntre.uuid?.slice(0, 8) || 'N/A'})`}
          breadcrumbs={[
            { label: 'Accueil', to: '/' },
            { label: 'Inventaire & Stocks', to: '/entreprise/inventaire' },
            { label: 'Modification de lot' },
          ]}
          actions={
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                  color: isDark ? '#f1f5f9' : '#334155',
                  '&:hover': {
                    borderColor: '#6366f1',
                    background: 'rgba(99,102,241,0.06)',
                  },
                }}
              >
                Retour
              </Button>

              {(unUser?.role === 1 || unUser?.role === 2) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setShowConfirm(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'rgba(239,68,68,0.3)',
                    '&:hover': {
                      borderColor: '#ef4444',
                      background: 'rgba(239,68,68,0.08)',
                    },
                  }}
                >
                  Supprimer
                </Button>
              )}
            </Stack>
          }
        />

        {/* ── Bandeau Récapitulatif & État du Stock ── */}
        <Paper
          elevation={0}
          sx={{
            ...cardStyle,
            mt: 3,
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(99,102,241,0.35)',
              }}
            >
              <InventoryIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {unEntre.libelle || 'Article sans nom'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Catégorie : <strong>{unEntre.categorie_libelle || unEntre.categorie_slug || 'Général'}</strong>
                {unEntre.barcode_value && ` • Code: ${unEntre.barcode_value}`}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {/* Statut Stock */}
            {isStockRupture ? (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                label="Rupture de stock (0)"
                color="error"
                sx={{ fontWeight: 700, borderRadius: '8px' }}
              />
            ) : isStockCritique ? (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                label={`Stock faible (${qte} ${unEntre.unite || 'pcs'})`}
                color="warning"
                sx={{ fontWeight: 700, borderRadius: '8px' }}
              />
            ) : (
              <Chip
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                label={`En stock (${qte} ${unEntre.unite || 'pcs'})`}
                color="success"
                sx={{ fontWeight: 700, borderRadius: '8px' }}
              />
            )}

            {/* Statut Vente */}
            <Chip
              icon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
              label={ajout_terminer ? 'Disponible en caisse' : 'Vente suspendue'}
              color={ajout_terminer ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px' }}
            />

            {/* Statut Prix */}
            <Chip
              icon={is_prix ? <LockIcon sx={{ fontSize: 15 }} /> : <LockOpenIcon sx={{ fontSize: 15 }} />}
              label={is_prix ? 'Prix verrouillé' : 'Prix libre'}
              color={is_prix ? 'default' : 'secondary'}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px' }}
            />
          </Stack>
        </Paper>

        {/* ── Formulaire de Modification ── */}
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* ── 1. Identification & Généralités ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <CategoryIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Identification de l'article
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label="Désignation / Famille"
                    variant="outlined"
                    disabled
                    value={unEntre.categorie_slug || unEntre.categorie_libelle || ''}
                    fullWidth
                    sx={inputStyle}
                    helperText="La catégorie parente est définie lors de la création."
                  />

                  <TextField
                    label="Libellé du produit"
                    variant="outlined"
                    name="libelle"
                    value={unEntre.libelle || ''}
                    onChange={onChange}
                    required
                    fullWidth
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EditNoteIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Autocomplete
                    options={UNITE_CHOICES}
                    getOptionLabel={(option) => option.label}
                    value={UNITE_CHOICES.find((opt) => opt.value === (unEntre.unite || 'kilos')) || UNITE_CHOICES[0]}
                    onChange={handleAutoCompleteChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unité de mesure"
                        variant="outlined"
                        fullWidth
                        sx={inputStyle}
                      />
                    )}
                  />

                  <TextField
                    label="Code-barres / Référence scannable"
                    variant="outlined"
                    name="barcode_value"
                    value={unEntre.barcode_value || ''}
                    onChange={onChange}
                    fullWidth
                    sx={inputStyle}
                    placeholder="Ex: 843512345678"
                    helperText="Scannez ou saisissez la référence pour les ventes rapides."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <QrCode2Icon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Scanner avec la caméra">
                            <IconButton
                              type="button"
                              onClick={() => setOpenScanner(true)}
                              edge="end"
                              sx={{
                                color: '#6366f1',
                                '&:hover': { background: 'rgba(99,102,241,0.1)' },
                              }}
                            >
                              <QrCode2Icon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* ── 2. Niveaux de Stock & Alertes ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <InventoryIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Niveaux de Stock & Alertes
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label={`Quantité en stock (${unEntre.unite || 'unités'})`}
                    variant="outlined"
                    name="qte"
                    type="number"
                    value={unEntre.qte}
                    onChange={onChange}
                    required
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InventoryIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Quantité actuellement disponible dans le stock physique."
                  />

                  <TextField
                    label="Seuil d'alerte (Quantité critique)"
                    variant="outlined"
                    name="qte_critique"
                    type="number"
                    value={unEntre.qte_critique}
                    onChange={onChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Une alerte sera émise dès que le stock descend sous cette valeur."
                  />

                  {/* Estimation valeur stockée */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      VALEUR DU STOCK ESTIMÉE
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Valeur marchande (Vente) :
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatNumberWithSpaces(valeurStockVente)} F
                      </Typography>
                    </Box>
                    {unUser?.role === 1 && puAchat > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Valeur d'acquisition (Achat) :
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {formatNumberWithSpaces(valeurStockAchat)} F
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* ── 3. Tarification & Rentabilité ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <LocalAtmIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Tarification & Rentabilité
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label="Prix de vente unitaire (TTC)"
                    variant="outlined"
                    name="pu"
                    type="number"
                    value={unEntre.pu}
                    onChange={onChange}
                    required
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalAtmIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">F</InputAdornment>,
                    }}
                    helperText="Prix appliqué par défaut lors d'une vente."
                  />

                  {(unUser?.role === 1 || unUser?.role === 2) && (
                    <TextField
                      label="Prix d'achat unitaire (HT)"
                      variant="outlined"
                      name="pu_achat"
                      type="number"
                      value={unEntre.pu_achat}
                      onChange={onChange}
                      fullWidth
                      inputProps={{ step: '0.01', min: '0' }}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalAtmIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">F</InputAdornment>,
                      }}
                      helperText="Visible uniquement par les gestionnaires et administrateurs."
                    />
                  )}

                  {/* Analyse de marge en temps réel */}
                  {unUser?.role === 1 && puAchat > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background:
                          margeUnitaire >= 0
                            ? isDark
                              ? 'rgba(16,185,129,0.08)'
                              : '#ecfdf5'
                            : isDark
                            ? 'rgba(239,68,68,0.08)'
                            : '#fef2f2',
                        border:
                          margeUnitaire >= 0
                            ? '1px solid rgba(16,185,129,0.2)'
                            : '1px solid rgba(239,68,68,0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {margeUnitaire >= 0 ? (
                            <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {margeUnitaire >= 0 ? 'Marge brute unitaire :' : 'Vente à perte :'}
                          </Typography>
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: margeUnitaire >= 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {margeUnitaire >= 0 ? '+' : ''}
                          {formatNumberWithSpaces(margeUnitaire)} F
                          {tauxMarge && ` (${tauxMarge}%)`}
                        </Typography>
                      </Box>
                      {margeUnitaire < 0 && (
                        <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, display: 'block' }}>
                          Attention : Le prix de vente fixé est inférieur au coût d'achat unitaire.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* ── 4. Règles de Vente & Options Avancées ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <TuneIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Règles de commercialisation & Notes
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  {/* Switch 1 : Disponibilité à la vente */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Disponible à la vente (Caisse & Sorties)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Permet la sortie de stock et l'affichage dans la caisse enregistreuse.
                      </Typography>
                    </Box>
                    <Switch
                      checked={ajout_terminer}
                      onChange={(e) => setTerminer(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Switch 2 : Prix libre */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Prix de vente libre en caisse
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Si activé, le caissier peut modifier le tarif. Désactivé pour verrouiller le prix.
                      </Typography>
                    </Box>
                    <Switch
                      checked={!is_prix}
                      onChange={(e) => setPrix(!e.target.checked)}
                      color="secondary"
                    />
                  </Box>

                  {/* Switch 3 & Champ Description / Notes */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: showAncien ? 1.5 : 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Ajouter des notes ou un motif de mise à jour
                      </Typography>
                      <Switch
                        size="small"
                        checked={showAncien}
                        onChange={(e) => setShowAncien(e.target.checked)}
                      />
                    </Box>

                    {showAncien && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        name="description"
                        label="Motif / Observations"
                        placeholder="Ex: Ajustement d'inventaire, démarque, fournisseur alternatif..."
                        value={unEntre.description || ''}
                        onChange={onChange}
                        variant="outlined"
                        sx={inputStyle}
                      />
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* ── Barre d'actions inférieure ── */}
          <Paper
            elevation={0}
            sx={{
              ...cardStyle,
              mt: 3,
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              }}
            >
              Annuler les changements
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                px: 4,
                py: 1.2,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                },
              }}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Paper>
        </form>
      </Box>

      {/* ── Dialog de Confirmation de Suppression Moderne ── */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e293b' : '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Supprimer cette entrée ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer définitivement le lot{' '}
            <strong>"{unEntre.libelle || 'Cet article'}"</strong> ? Cette opération réduira le stock associé et ne peut pas être annulée.
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
              mb: 3,
              textAlign: 'left',
              fontSize: '0.82rem',
            }}
          >
            <div>• Quantité : <strong>{qte} {unEntre.unite || 'unités'}</strong></div>
            <div>• Prix de vente : <strong>{formatNumberWithSpaces(puVente)} F</strong></div>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => setShowConfirm(false)}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Confirmer
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ── Dialog Caméra Scanner Code-barres ── */}
      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Scanner le code-barres
          </Typography>
          <IconButton onClick={() => setOpenScanner(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <BarcodeScanner onScan={handleScanResult} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
