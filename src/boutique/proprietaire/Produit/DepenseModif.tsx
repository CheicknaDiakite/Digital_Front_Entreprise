import { ChangeEvent, FormEvent, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Paper,
  Box,
  TextField,
  Grid,
  InputAdornment,
  Dialog,
  Skeleton,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useDeleteDepense, useFetchDepense, useUpdateDepense } from '../../../usePerso/fonction.entre';
import { BASE } from '../../../_services/caller.service';
import { useFetchUser } from '../../../usePerso/fonction.user';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import PdfViewer from '../../../usePerso/PdfFile';
import { useTheme } from '@mui/material/styles';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { PageHeader } from '../../../_components/common';

export default function DepenseModif() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const { unDepense, setUnDepense, isLoading } = useFetchDepense(uuid!);
  const { updateDepense } = useUpdateDepense();
  const { deleteDepense } = useDeleteDepense();
  const { unUser } = useFetchUser();

  const [showConfirm, setShowConfirm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user_id = unUser?.uuid || '';
  const url = BASE(unDepense?.facture ? unDepense.facture : '');

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteDepense(unDepense);
    setShowConfirm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnDepense({
      ...unDepense,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    unDepense['user_id'] = user_id;
    unDepense['facture'] = image;
    updateDepense(unDepense);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const somme = Number(unDepense?.somme || 0);

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
    },
  };

  if (isLoading || !unDepense) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '18px' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px' }} />
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
          title="Modifier la dépense"
          subtitle={`Dépense : ${unDepense.libelle || 'Frais'} • Date : ${unDepense.date || 'N/A'}`}
          breadcrumbs={[
            { label: 'Accueil', to: '/' },
            { label: 'Finances & Dépenses', to: '/finances/depenses' },
            { label: 'Modification dépense' },
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

              {unUser?.role === 1 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDelete}
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

        {/* ── Bandeau Récapitulatif de la Dépense ── */}
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
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(239,68,68,0.35)',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {unDepense.libelle || 'Dépense'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Enregistrée le : <strong>{unDepense.date || 'Date non renseignée'}</strong>
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<ReceiptIcon sx={{ fontSize: 16 }} />}
              label={unDepense.facture ? 'Justificatif joint' : 'Sans justificatif'}
              color={unDepense.facture ? 'success' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px' }}
            />

            <Box
              sx={{
                px: 2,
                py: 0.8,
                borderRadius: '10px',
                background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block' }}>
                MONTANT DE LA CHARGE
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>
                {formatNumberWithSpaces(somme)} F
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ── Formulaire de Modification ── */}
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* ── 1. Informations Financières ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <DescriptionIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Détails de la charge
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Libellé / Objet de la dépense"
                    name="libelle"
                    value={unDepense.libelle || ''}
                    onChange={onChange}
                    required
                    variant="outlined"
                    sx={inputStyle}
                    placeholder="Ex: Facture d'électricité, Achat fournitures..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Montant engagé (F)"
                    name="somme"
                    type="number"
                    value={unDepense.somme || ''}
                    onChange={onChange}
                    required
                    inputProps={{ step: '0.01', min: '0' }}
                    variant="outlined"
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalAtmIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">F</InputAdornment>,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Date de décaissement"
                    name="date"
                    type="date"
                    value={unDepense.date || ''}
                    onChange={onChange}
                    required
                    variant="outlined"
                    sx={inputStyle}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* ── 2. Pièce Justificative (Facture / Reçu) ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <ReceiptIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Pièce justificative & Facture
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  {/* Upload nouvelle pièce */}
                  <Box
                    sx={{
                      p: 2.5,
                      border: '2px dashed',
                      borderColor: image ? '#10b981' : isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
                      borderRadius: '14px',
                      textAlign: 'center',
                      background: image ? 'rgba(16,185,129,0.06)' : isDark ? 'rgba(15,23,42,0.3)' : '#f8fafc',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#6366f1',
                      },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={handleImageChange}
                    />
                    <CloudUploadIcon sx={{ fontSize: 36, color: image ? '#10b981' : '#6366f1', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {image ? image.name : 'Remplacer ou joindre un justificatif'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Formats acceptés : PDF, JPG, PNG (Max 10 Mo)
                    </Typography>
                  </Box>

                  {/* Facture actuelle */}
                  {unDepense.facture && !image && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Aperçu de la pièce actuelle :
                        </Typography>
                        <Tooltip title="Ouvrir dans un nouvel onglet">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.78rem' }}
                          >
                            Plein écran
                          </Button>
                        </Tooltip>
                      </Box>
                      <Box sx={{ maxHeight: 240, overflow: 'auto', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <PdfViewer fileUrl={url} />
                      </Box>
                    </Box>
                  )}
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

            {(unUser?.role === 1 || unUser?.role === 2) && (
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
            )}
          </Paper>
        </form>
      </Box>

      {/* ── Dialog Suppression ── */}
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
            Supprimer cette dépense ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer définitivement la dépense{' '}
            <strong>"{unDepense.libelle || 'cette dépense'}"</strong> d'un montant de{' '}
            <strong>{formatNumberWithSpaces(somme)} F</strong> ?
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