import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
  TextField,
  Autocomplete,
  InputAdornment,
  Grid,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PostAddIcon from '@mui/icons-material/PostAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BarcodeScanner from '../../_components/Input/BarcodeScanner';
import { useFetchAllSousCate } from '../../usePerso/fonction.categorie';
import { useAllClients } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { useCreateEntre } from '../../usePerso/fonction.entre';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { connect } from '../../_services/account.service';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export interface ApprovisionnementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface ApproLineItem {
  id: string; // local temporary id
  categorie_slug: string;
  produit_nom: string;
  libelle: string;
  barcode_value: string;
  unite: string;
  qte: number | '';
  pu_achat: number | '';
  pu: number | '';
  qte_critique: number | '';
  cumuler_quantite: boolean;
  is_sortie: boolean;
  is_prix: boolean;
}

const UNITES_DISPONIBLES = [
  'pièce',
  'carton',
  'paquet',
  'sac',
  'boîte',
  'bouteille',
  'kilos',
  'litre',
  'mètres',
  'lot',
];

const createEmptyLine = (index: number): ApproLineItem => ({
  id: `line_${Date.now()}_${index}`,
  categorie_slug: '',
  produit_nom: '',
  libelle: '',
  barcode_value: '',
  unite: 'pièce',
  qte: 1,
  pu_achat: '',
  pu: '',
  qte_critique: 5,
  cumuler_quantite: false,
  is_sortie: true,
  is_prix: true,
});

export const ApprovisionnementModal: React.FC<ApprovisionnementModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const uuid = useStoreUuid((state) => state.selectedId);
  const { souscategories } = useFetchAllSousCate(uuid!);
  const { getClients } = useAllClients(uuid!);
  const { ajoutEntre, isLoading: isSubmitting } = useCreateEntre();

  const fournisseurs = (getClients || []).filter(
    (info: any) => info.role === 2 || info.role === 3
  );

  // En-tête de la facture d'achat
  const [selectedFournisseurId, setSelectedFournisseurId] = useState<string>('');
  const [dateReception, setDateReception] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [referenceFacture, setReferenceFacture] = useState<string>('');

  // Lignes d'approvisionnement
  const [lines, setLines] = useState<ApproLineItem[]>([createEmptyLine(1)]);

  // État du scanner de code-barres modal
  const [scannerLineId, setScannerLineId] = useState<string | null>(null);

  // Mettre à jour une ligne
  const updateLine = (id: string, field: keyof ApproLineItem, value: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        return { ...line, [field]: value };
      })
    );
  };

  // Ajouter une ligne
  const handleAddLine = () => {
    setLines((prev) => [...prev, createEmptyLine(prev.length + 1)]);
  };

  // Supprimer une ligne
  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) {
      toast.error('Il faut au moins un produit dans l’approvisionnement.');
      return;
    }
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  // Calculs totaux
  const summary = React.useMemo(() => {
    let totalArticles = 0;
    let totalAchat = 0;
    let totalVente = 0;

    lines.forEach((line) => {
      const qte = Number(line.qte) || 0;
      const pa = Number(line.pu_achat) || 0;
      const pv = Number(line.pu) || 0;

      totalArticles += qte;
      totalAchat += qte * pa;
      totalVente += qte * pv;
    });

    const beneficeBrut = totalVente - totalAchat;
    const margePct = totalVente > 0 ? ((beneficeBrut / totalVente) * 100).toFixed(1) : '0';

    return {
      totalArticles,
      totalAchat,
      totalVente,
      beneficeBrut,
      margePct,
    };
  }, [lines]);

  // Validation et soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des lignes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.categorie_slug) {
        toast.error(`Veuillez sélectionner un produit pour la ligne #${i + 1}`);
        return;
      }
      if (!line.qte || Number(line.qte) <= 0) {
        toast.error(`La quantité doit être supérieure à 0 pour la ligne #${i + 1}`);
        return;
      }
      if (line.pu === '' || Number(line.pu) < 0) {
        toast.error(`Le prix de vente doit être renseigné pour la ligne #${i + 1}`);
        return;
      }
    }

    // Préparation du payload
    const payload = lines.map((line) => ({
      user_id: connect || '',
      client_id: selectedFournisseurId || undefined,
      categorie_slug: line.categorie_slug,
      libelle: line.libelle || referenceFacture || `Lot ${line.produit_nom}`,
      barcode_value: line.barcode_value || undefined,
      unite: line.unite || 'pièce',
      qte: Number(line.qte) || 0,
      pu: Number(line.pu) || 0,
      pu_achat: Number(line.pu_achat) || 0,
      qte_critique: Number(line.qte_critique) || 0,
      cumuler_quantite: line.cumuler_quantite,
      is_sortie: line.is_sortie,
      is_prix: line.is_prix,
      date: dateReception,
      ref: referenceFacture || undefined,
    }));

    ajoutEntre(payload as any, {
      onSuccess: () => {
        toast.success(`Approvisionnement de ${lines.length} produit(s) enregistré !`);
        // Réinitialiser le formulaire
        setLines([createEmptyLine(1)]);
        setReferenceFacture('');
        if (onSuccess) onSuccess();
        onClose();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Erreur lors de l'enregistrement de l'approvisionnement.");
      },
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '24px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: isMobile ? 'none' : '1px solid',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(226, 232, 240, 0.8)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* ── Entête Dialog ── */}
          <DialogTitle
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <PostAddIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                  Nouvel Approvisionnement Multi-Lignes
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                  Enregistrez plusieurs entrées de stock en une seule opération
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* ── Section En-tête Approvisionnement ── */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.8)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  display: 'block',
                  mb: 2,
                }}
              >
                1. Informations Générales de Réception
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={fournisseurs}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
                    onChange={(_event, value) => {
                      setSelectedFournisseurId(typeof value === 'object' && value && value.uuid ? value.uuid : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Fournisseur (optionnel)"
                        placeholder="Sélectionner le fournisseur"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <StorefrontIcon sx={{ color: '#10b981', fontSize: 20 }} />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="Date de réception"
                    value={dateReception}
                    onChange={(e) => setDateReception(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    label="N° Facture / Bon fournisseur"
                    placeholder="ex: FACT-2026-089"
                    value={referenceFacture}
                    onChange={(e) => setReferenceFacture(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ── Section Tableau des Lignes de Produits ── */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#6366f1',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  2. Produits Réceptionnés ({lines.length} ligne{lines.length > 1 ? 's' : ''})
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddLine}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    color: '#6366f1',
                    '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)' },
                  }}
                >
                  + Ajouter un produit
                </Button>
              </Box>

              <Stack spacing={2}>
                {lines.map((line, index) => {
                  const qteNum = Number(line.qte) || 0;
                  const paNum = Number(line.pu_achat) || 0;
                  const pvNum = Number(line.pu) || 0;
                  const margeUnit = pvNum - paNum;
                  const margePct = pvNum > 0 ? ((margeUnit / pvNum) * 100).toFixed(1) : '0';

                  return (
                    <Paper
                      key={line.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      {/* En-tête de ligne */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: 'rgba(99, 102, 241, 0.15)',
                              color: '#6366f1',
                              borderRadius: '8px',
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>
                            {line.produit_nom || 'Nouveau produit'}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {/* Marge aperçu en direct */}
                          {pvNum > 0 && paNum > 0 && (
                            <Chip
                              size="small"
                              icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />}
                              label={`Marge: ${margeUnit >= 0 ? '+' : ''}${formatNumberWithSpaces(margeUnit)} F (${margePct}%)`}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: margeUnit >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: margeUnit >= 0 ? '#10b981' : '#ef4444',
                                border: '1px solid',
                                borderColor: margeUnit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                              }}
                            />
                          )}

                          <Tooltip title="Supprimer cette ligne">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveLine(line.id)}
                              disabled={lines.length <= 1}
                              sx={{
                                opacity: lines.length <= 1 ? 0.3 : 1,
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      {/* Champs de la ligne */}
                      <Grid container spacing={1.5} alignItems="center">
                        {/* Produit */}
                        <Grid item xs={12} sm={4} md={3}>
                          <Autocomplete
                            options={souscategories || []}
                            getOptionLabel={(option) => (typeof option === 'string' ? option : option.libelle || '')}
                            onChange={(_event, value) => {
                              if (typeof value === 'object' && value) {
                                updateLine(line.id, 'categorie_slug', value.uuid || '');
                                updateLine(line.id, 'produit_nom', value.libelle || '');
                              } else {
                                updateLine(line.id, 'categorie_slug', '');
                                updateLine(line.id, 'produit_nom', '');
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                size="small"
                                label="Produit"
                                placeholder="Choisir un produit"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <InputAdornment position="start">
                                        <ShoppingBagIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                                      </InputAdornment>
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        </Grid>

                        {/* Code-barres / Scanner */}
                        <Grid item xs={12} sm={4} md={2}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Code-barres / QR"
                            placeholder="Optionnel"
                            value={line.barcode_value}
                            onChange={(e) => updateLine(line.id, 'barcode_value', e.target.value)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => setScannerLineId(line.id)}
                                    title="Scanner le code"
                                  >
                                    <QrCode2Icon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Quantité */}
                        <Grid item xs={6} sm={2} md={1.5}>
                          <TextField
                            required
                            type="number"
                            size="small"
                            fullWidth
                            label="Quantité"
                            value={line.qte}
                            onChange={(e) => updateLine(line.id, 'qte', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ min: '0.01', step: 'any' }}
                          />
                        </Grid>

                        {/* Unité */}
                        <Grid item xs={6} sm={2} md={1.5}>
                          <Autocomplete
                            freeSolo
                            options={UNITES_DISPONIBLES}
                            value={line.unite}
                            onChange={(_e, val) => updateLine(line.id, 'unite', val || 'pièce')}
                            renderInput={(params) => <TextField {...params} size="small" label="Unité" />}
                          />
                        </Grid>

                        {/* Prix Achat (PA) */}
                        <Grid item xs={6} sm={3} md={2}>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            label="Prix Achat (PA)"
                            value={line.pu_achat}
                            onChange={(e) => updateLine(line.id, 'pu_achat', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ min: '0', step: 'any' }}
                            helperText={
                              qteNum > 0 && paNum > 0
                                ? `Total: ${formatNumberWithSpaces(qteNum * paNum)} F`
                                : undefined
                            }
                          />
                        </Grid>

                        {/* Prix Vente (PV) */}
                        <Grid item xs={6} sm={3} md={2}>
                          <TextField
                            required
                            type="number"
                            size="small"
                            fullWidth
                            label="Prix Vente (PV)"
                            value={line.pu}
                            onChange={(e) => updateLine(line.id, 'pu', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ min: '0', step: 'any' }}
                            helperText={
                              qteNum > 0 && pvNum > 0
                                ? `Total: ${formatNumberWithSpaces(qteNum * pvNum)} F`
                                : undefined
                            }
                          />
                        </Grid>
                      </Grid>

                      {/* Options avancées de la ligne */}
                      <Divider sx={{ my: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            label="Seuil alerte critique"
                            value={line.qte_critique}
                            onChange={(e) => updateLine(line.id, 'qte_critique', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ min: '0' }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={9}>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={line.cumuler_quantite}
                                  onChange={(e) => updateLine(line.id, 'cumuler_quantite', e.target.checked)}
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                                  Cumuler au stock existant
                                </Typography>
                              }
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  color="success"
                                  checked={line.is_sortie}
                                  onChange={(e) => updateLine(line.id, 'is_sortie', e.target.checked)}
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                                  Disponible en caisse
                                </Typography>
                              }
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={!line.is_prix}
                                  onChange={(e) => updateLine(line.id, 'is_prix', !e.target.checked)}
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                                  Prix libre en caisse
                                </Typography>
                              }
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* ── Récapitulatif Financier Global en bas ── */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                border: '1px solid',
                borderColor: 'rgba(16, 185, 129, 0.25)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  display: 'block',
                  mb: 1.5,
                }}
              >
                3. Synthèse Financière de l'Approvisionnement
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Articles / Lignes
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                    {lines.length} ligne{lines.length > 1 ? 's' : ''} ({formatNumberWithSpaces(summary.totalArticles)} u.)
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Coût Total Achat
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                    {formatNumberWithSpaces(summary.totalAchat)} F
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Valeur Estimée Vente
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                    {formatNumberWithSpaces(summary.totalVente)} F
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Bénéfice Prévisionnel
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: summary.beneficeBrut >= 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {summary.beneficeBrut >= 0 ? '+' : ''}{formatNumberWithSpaces(summary.beneficeBrut)} F ({summary.margePct}%)
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>

          {/* ── Actions Dialog ── */}
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <InventoryIcon />}
              sx={{
                borderRadius: '12px',
                py: 1,
                px: 3,
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                },
              }}
            >
              {isSubmitting ? 'Enregistrement en cours...' : `Valider l'approvisionnement (${lines.length})`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal scanner code-barres pour une ligne */}
      <Dialog
        open={Boolean(scannerLineId)}
        onClose={() => setScannerLineId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Scanner le code-barres du produit
          </Typography>
          <IconButton onClick={() => setScannerLineId(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <BarcodeScanner
            onScan={(scanned) => {
              if (scannerLineId) {
                updateLine(scannerLineId, 'barcode_value', scanned);
                toast.success(`Code scanné : ${scanned}`);
                setScannerLineId(null);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovisionnementModal;
