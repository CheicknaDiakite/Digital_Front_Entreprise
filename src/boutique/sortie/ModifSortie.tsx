import { ChangeEvent, FormEvent, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Grid,
  Stack,
  Chip,
  Switch,
  Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import EditNoteIcon from '@mui/icons-material/EditNote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDeleteSortie, useFetchSortie, useUpdateSortie } from '../../usePerso/fonction.entre';
import { useFetchUser } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useTheme } from '@mui/material/styles';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { PageHeader } from '../../_components/common';

export default function ModifSortie() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const { unUser } = useFetchUser();
  const { unSortie, setUnSortie, isLoading } = useFetchSortie(uuid!);
  const { updateSortie } = useUpdateSortie();
  const { deleteSortie } = useDeleteSortie();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAncien, setShowAncien] = useState(Boolean(unSortie?.description && unSortie.description.trim() !== ''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildPayload = (action?: string) => ({
    ...unSortie,
    user_id: unUser?.uuid || '',
    entreprise_id: entreprise_id ?? unSortie.entreprise_id,
    action,
    uuid: unSortie.uuid ?? uuid,
  });

  const confirmDelete = () => {
    const payload = buildPayload('delete');
    deleteSortie(payload);
    setShowConfirm(false);
  };

  const confirmCancel = () => {
    const payload = buildPayload('cancel');
    deleteSortie(payload);
    setShowCancelConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSortie({
      ...unSortie,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateSortie(buildPayload());
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const pu = Number(unSortie?.pu || 0);
  const qte = Number(unSortie?.qte || 0);
  const totalAmount = pu * qte;

  const cardStyle = {
    p: { xs: 2.5, sm: 3 },
    borderRadius: '18px',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.8)',
    background: isDark
      ? 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.6) 100%)'
      : '#ffffff',
    backdropFilter: 'blur(16px)',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
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

  if (isLoading || !unSortie) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '18px' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '18px' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '18px' }} />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* En-tête de page moderne */}
        <PageHeader
          title="Modifier la sortie / vente"
          subtitle={`Réf : ${unSortie.ref || unSortie.uuid?.slice(0, 8) || 'Vente'} • Article : ${unSortie.categorie_libelle || unSortie.libelle || 'Article'}`}
          breadcrumbs={[
            { label: 'Accueil', to: '/' },
            { label: 'Ventes & Sorties', to: '/ventes/caisse' },
            { label: 'Modification vente' },
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
                  color="warning"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={() => setShowCancelConfirm(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'rgba(245,158,11,0.3)',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      background: 'rgba(245,158,11,0.08)',
                    },
                  }}
                >
                  Annuler la vente
                </Button>
              )}

              {unUser?.role === 1 && (
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

        {/* ── Bandeau Récapitulatif de la Vente ── */}
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(16,185,129,0.35)',
              }}
            >
              <ReceiptIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {unSortie.categorie_libelle || unSortie.libelle || 'Ligne de vente'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Réf : <strong>{unSortie.ref || unSortie.uuid?.slice(0, 8) || 'N/A'}</strong>
                {unSortie.mode_paiement && ` • Règlement : ${unSortie.mode_paiement}`}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
              label={`${qte} ${unSortie.unite || 'unité(s)'}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
            <Chip
              icon={<LocalAtmIcon sx={{ fontSize: 16 }} />}
              label={`${formatNumberWithSpaces(pu)} F / unité`}
              color="default"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
            <Box
              sx={{
                px: 2,
                py: 0.8,
                borderRadius: '10px',
                background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block' }}>
                TOTAL ENCAISSÉ
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                {formatNumberWithSpaces(totalAmount)} F
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ── Formulaire de Modification ── */}
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* ── 1. Paramètres de la vente ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <CategoryIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Détails de la ligne de vente
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label="Désignation / Article"
                    variant="outlined"
                    disabled
                    value={unSortie.categorie_libelle || unSortie.libelle || ''}
                    fullWidth
                    sx={inputStyle}
                    helperText="Article associé à cette ligne de sortie."
                  />

                  <TextField
                    label="Quantité sortie"
                    variant="outlined"
                    name="qte"
                    type="number"
                    value={unSortie.qte}
                    onChange={onChange}
                    required
                    fullWidth
                    inputProps={{ step: '0.01', min: '0.01' }}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ProductionQuantityLimitsIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Modifier la quantité vendue ajustera les calculs du journal."
                  />

                  <TextField
                    label="Prix unitaire de vente (TTC)"
                    variant="outlined"
                    name="pu"
                    type="number"
                    value={unSortie.pu}
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
                    helperText="Prix appliqué lors de la transaction."
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* ── 2. Notes & Motif de modification ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <EditNoteIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Observations & Motif de mise à jour
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Ajouter un motif de modification
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                          Documenter la raison de la modification dans l'historique d'audit.
                        </Typography>
                      </Box>
                      <Switch
                        size="small"
                        checked={showAncien}
                        onChange={(e) => setShowAncien(e.target.checked)}
                      />
                    </Box>

                    {showAncien && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="description"
                          label="Motif / Notes"
                          placeholder="Ex: Correction d'erreur de caisse, retour marchandise partiel..."
                          value={unSortie.description || ''}
                          onChange={onChange}
                          variant="outlined"
                          sx={inputStyle}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Rappel Total */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(15,23,42,0.6)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.8)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      RÉCAPITULATIF CALCULÉ DU TOTAL
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {qte} × {formatNumberWithSpaces(pu)} F :
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatNumberWithSpaces(totalAmount)} F
                      </Typography>
                    </Box>
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
              Annuler
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

      {/* ── Dialog Annulation de Vente ── */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
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
              bgcolor: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Annuler cette vente ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            L'annulation marquera cette ligne comme annulée et <strong>réintégrera les {qte} unité(s)</strong> dans le stock disponible.
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => setShowCancelConfirm(false)}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Fermer
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={confirmCancel}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Confirmer l'annulation
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ── Dialog Suppression Définitive ── */}
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
            Supprimer définitivement ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Cette opération supprimera définitivement la ligne de vente de l'historique comptable.
          </Typography>

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
              Supprimer
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
