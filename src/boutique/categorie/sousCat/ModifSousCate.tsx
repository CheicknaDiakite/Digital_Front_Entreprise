import { useParams, useNavigate } from 'react-router-dom';
import { RouteParams } from '../../../typescript/DataType';
import {
  Button,
  Paper,
  Typography,
  Box,
  TextField,
  Skeleton,
  Grid,
  Stack,
  Dialog,
  Chip,
  InputAdornment,
} from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import { useDeleteSousCate, useFetchSousCate, useUpdateSousCate } from '../../../usePerso/fonction.categorie';
import { BASE } from '../../../_services/caller.service';
const DEFAULT_IMG = '/icon-192x192.png';
import { useStoreUuid } from '../../../usePerso/store';
import { useTheme } from '@mui/material/styles';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { PageHeader } from '../../../_components/common';

export default function ModifSousCate() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams<RouteParams>();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { unSousCate, setUnSousCate, isLoading } = useFetchSousCate(uuid!);
  const { unUser } = useFetchUser();
  const { updateSousCate } = useUpdateSousCate();
  const { deleteSousCate } = useDeleteSousCate();

  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const payload = {
      id: (unSousCate as any).id || undefined,
      slug: (unSousCate as any).slug || undefined,
      user_id: unUser?.uuid || '',
    };
    deleteSousCate(payload as any);
    setShowConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSousCate({
      ...unSousCate,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const user_id = unUser?.uuid || '';
    const form = new FormData();
    form.append('libelle', unSousCate.libelle || '');
    if ((unSousCate as any).uuid) form.append('uuid', (unSousCate as any).uuid);
    if ((unSousCate as any).slug) form.append('slug', (unSousCate as any).slug);
    form.append('user_id', user_id);
    if (image) form.append('image', image);
    updateSousCate(form as unknown as any);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const url = unSousCate?.image ? BASE(unSousCate.image) : DEFAULT_IMG;

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

  if (isLoading || !unSousCate) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '18px' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '18px' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '18px' }} />
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
          title="Modifier le produit"
          subtitle={`Produit : ${unSousCate.libelle || 'Article'} (Code : ${(unSousCate as any).slug || 'N/A'})`}
          breadcrumbs={[
            { label: 'Accueil', to: '/' },
            { label: 'Catalogue & Produits', to: '/stock/catalogue' },
            { label: 'Modification produit' },
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

        {/* ── Bandeau Récapitulatif ── */}
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
              <Inventory2Icon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {unSousCate.libelle || 'Produit sans nom'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Identifiant / Slug : <strong>{(unSousCate as any).slug || 'Non défini'}</strong>
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<ImageOutlinedIcon sx={{ fontSize: 16 }} />}
              label={unSousCate.image || previewUrl ? 'Visuel personnalisé' : 'Image par défaut'}
              color={unSousCate.image || previewUrl ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px' }}
            />
          </Stack>
        </Paper>

        {/* ── Formulaire de Modification ── */}
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* ── 1. Informations Textuelles ── */}
            <Grid item xs={12} md={unEntreprise?.licence_type === 'Stock Simple' ? 12 : 6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Inventory2Icon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Informations du produit
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Nom / Libellé du produit"
                    name="libelle"
                    value={unSousCate.libelle || ''}
                    onChange={onChange}
                    required
                    variant="outlined"
                    sx={inputStyle}
                    placeholder="Ex: Savon liquide 500ml, Huile d'olive 1L..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EditNoteIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Le libellé précis apparaîtra sur les tickets et factures."
                  />

                  {(unSousCate as any).slug && (
                    <TextField
                      fullWidth
                      label="Identifiant unique (Slug)"
                      value={(unSousCate as any).slug}
                      disabled
                      variant="outlined"
                      sx={inputStyle}
                      helperText="Généré automatiquement pour les références et URL."
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* ── 2. Illustration / Visuel ── */}
            {unEntreprise?.licence_type !== 'Stock Simple' && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={cardStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <ImageOutlinedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Visuel du produit
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 180,
                        borderRadius: '14px',
                        border: '2px dashed',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
                        bgcolor: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        p: 1.5,
                      }}
                    >
                      <img
                        src={previewUrl || url}
                        alt={unSousCate.libelle || 'Illustration'}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    <Box
                      component="label"
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isDark ? 'rgba(15,23,42,0.3)' : '#f8fafc',
                        '&:hover': {
                          borderColor: '#6366f1',
                          background: 'rgba(99,102,241,0.05)',
                        },
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <CloudUploadIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {image ? image.name : 'Choisir une nouvelle image'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            )}
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
              }}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
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
            Supprimer ce produit ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer définitivement le produit{' '}
            <strong>"{unSousCate.libelle || 'ce produit'}"</strong> ?
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
