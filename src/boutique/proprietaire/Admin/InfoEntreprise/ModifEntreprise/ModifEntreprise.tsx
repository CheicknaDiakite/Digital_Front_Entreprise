import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Tooltip,
  Fade,
  Avatar,
  Divider,
  Grid,
  Chip,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';

import { useDeleteEntreprise, useFetchEntreprise, useFetchUser, useUpdateEntreprise } from '../../../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';

import { useStoreUuid } from '../../../../../usePerso/store';
import { BASE } from '../../../../../_services/caller.service';
import img from '../../../../../../public/icon-192x192.png';
import { getLicenceDuration } from '../../../../../usePerso/fonctionPerso';
import { LicenceTag } from '../../Entreprise';

export default function ModifEntreprise() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, setUnEntreprise, isLoading, isError } = useFetchEntreprise(uuid);
  const { deleteEntreprise } = useDeleteEntreprise();
  const { updateEntreprise } = useUpdateEntreprise();

  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';

  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const countryOptions = countryList().getData();

  const handleCopyRef = () => {
    if (unEntreprise?.ref) {
      navigator.clipboard.writeText(unEntreprise.ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleDelete = () => setShowConfirmDelete(true);

  const confirmDelete = () => {
    if (unEntreprise) {
      deleteEntreprise({ ...unEntreprise, user_id });
    }
    setShowConfirmDelete(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (unEntreprise) {
      setUnEntreprise({ ...unEntreprise, [name]: value });
    }
  };

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    if (unEntreprise) {
      setUnEntreprise({ ...unEntreprise, [e.target.name]: e.target.value });
    }
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
    if (unEntreprise) {
      setIsSaving(true);
      updateEntreprise({ ...unEntreprise, user_id, image });
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const onSubmitAbon = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (unEntreprise) {
      updateEntreprise({ ...unEntreprise, user_id, licence_code: activationCode });
      setOpenSubscriptionDialog(false);
      setActivationCode('');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 950, mx: 'auto', py: 2 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
          <Skeleton variant="text" width="240px" height={36} />
          <Skeleton variant="text" width="320px" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} />
        </Paper>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${theme.palette.divider}` }}>
          <Skeleton variant="rounded" height={240} sx={{ borderRadius: '16px' }} />
        </Paper>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 950, mx: 'auto', py: 3 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '16px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()} sx={{ fontWeight: 600 }}>
              Réessayer
            </Button>
          }
        >
          Impossible de charger les paramètres de l'entreprise.
        </Alert>
      </Box>
    );
  }

  if (!unEntreprise) return null;

  const currentLogoUrl = unEntreprise.image ? BASE(unEntreprise.image as string) : img;

  return (
    <Box sx={{ maxWidth: 950, mx: 'auto', width: '100%' }}>
      {/* Header section */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', mb: 0.5 }}>
          Configuration & Identité de l'Entreprise
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Gérez les coordonnées officielles, l'image de marque et les droits d'accès associés à votre licence.
        </Typography>
      </Box>

      {/* Licence & Identity Quick Ribbon */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: 3,
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, #ffffff 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}>
                Référence Unique d'Établissement
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'text.primary', letterSpacing: 1 }}>
                  {unEntreprise.ref || 'NON DÉFINIE'}
                </Typography>
                {unEntreprise.ref && (
                  <Tooltip title={copiedRef ? "Référence copiée !" : "Copier la référence"} arrow>
                    <Chip
                      icon={copiedRef ? <CheckRoundedIcon sx={{ fontSize: '14px !important' }} /> : <ContentCopyRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label={copiedRef ? "Copié" : "Copier"}
                      size="small"
                      onClick={handleCopyRef}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: copiedRef ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.primary.main, 0.1),
                        color: copiedRef ? theme.palette.success.main : theme.palette.primary.main,
                        border: `1px solid ${copiedRef ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.primary.main, 0.25)}`,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}>
                Abonnement Actif
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {unEntreprise.licence_type ? (
                  <LicenceTag type={unEntreprise.licence_type}>
                    {unEntreprise.licence_type} • {getLicenceDuration(unEntreprise.licence_date_expiration)}
                  </LicenceTag>
                ) : (
                  <Chip label="Licence Standard" size="small" variant="outlined" />
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VpnKeyRoundedIcon sx={{ fontSize: '16px !important' }} />}
                  onClick={() => setOpenSubscriptionDialog(true)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    height: 28,
                    color: theme.palette.primary.main,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Code d'activation
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Settings Form */}
      <form onSubmit={onSubmit}>
        <Stack spacing={3.5}>
          {/* Card 1: Identité Visuelle & Informations Générales */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.5)
                : theme.palette.background.paper,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.03)
              }}
            >
              <BadgeRoundedIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Identité Visuelle & Raison Sociale
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Grid container spacing={3.5} alignItems="center">
                {/* Logo Upload Studio */}
                <Grid item xs={12} md={3.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '24px',
                      p: 0.5,
                      border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Avatar
                      src={previewUrl || currentLogoUrl}
                      alt={unEntreprise.nom || 'Logo'}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                        '&:hover': { opacity: 0.85 }
                      }}
                      onClick={() => document.getElementById('enterprise-image-upload')?.click()}
                    />
                    <Tooltip title="Changer le logo" arrow>
                      <IconButton
                        size="small"
                        onClick={() => document.getElementById('enterprise-image-upload')?.click()}
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          bgcolor: theme.palette.primary.main,
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                      >
                        <CameraAltRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input
                      type="file"
                      id="enterprise-image-upload"
                      hidden
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1.4 }}>
                    Cliquez pour modifier le logo<br />
                    (Format PNG, JPG ou WEBP)
                  </Typography>
                </Grid>

                {/* Name, Type & Country */}
                <Grid item xs={12} md={8.5}>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Nom officiel de l'entreprise"
                      name="nom"
                      value={unEntreprise.nom}
                      onChange={onChange}
                      required
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Secteur d'activité / Libellé"
                      name="libelle"
                      value={unEntreprise.libelle || ''}
                      onChange={onChange}
                      size="small"
                      placeholder="Ex: Commerce général, Prêt-à-porter, Restauration, Quincaillerie..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px'
                        }
                      }}
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel id="country-select-label">Pays d'implantation</InputLabel>
                      <Select
                        labelId="country-select-label"
                        value={unEntreprise.pays || ''}
                        onChange={onSelectChange}
                        name="pays"
                        label="Pays d'implantation"
                        startAdornment={
                          <InputAdornment position="start">
                            <PublicRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                          </InputAdornment>
                        }
                        sx={{ borderRadius: '12px' }}
                      >
                        {countryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.label}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Card 2: Coordonnées & Facturation */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.5)
                : theme.palette.background.paper,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: alpha('#8b5cf6', 0.03)
              }}
            >
              <LocationOnRoundedIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Coordonnées de Contact & Facturation
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email professionnel"
                    name="email"
                    type="email"
                    size="small"
                    value={unEntreprise.email || ''}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone professionnel"
                    name="numero"
                    size="small"
                    value={unEntreprise.numero || ''}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse géographique"
                    name="adresse"
                    size="small"
                    value={unEntreprise.adresse || ''}
                    onChange={onChange}
                    multiline
                    rows={2}
                    placeholder="Quartier, Rue, Numéro de porte, Ville..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mentions légales & Coordonnées bancaires (affichées sur les factures)"
                    placeholder="Ex: RIB, IBAN, Numéro IFU / RCCM, Conditions de paiement..."
                    name="coordonne"
                    size="small"
                    value={unEntreprise.coordonne || ''}
                    onChange={onChange}
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Form Actions Ribbon */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pt: 1
            }}
          >
            <Button
              variant="outlined"
              startIcon={<VpnKeyRoundedIcon />}
              onClick={() => setOpenSubscriptionDialog(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                height: 44,
                width: { xs: '100%', sm: 'auto' },
                borderColor: theme.palette.divider,
                color: 'text.secondary'
              }}
            >
              Prolonger l'abonnement
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              disabled={isSaving}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                height: 44,
                bgcolor: theme.palette.primary.main,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.45)}`
                },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </Box>

          <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

          {/* Danger Zone */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.06)} 0%, #ffffff 100%)`
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <WarningAmberRoundedIcon sx={{ color: theme.palette.error.main, fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                    Zone de Danger : Suppression de l'Établissement
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  La suppression d'une entreprise efface définitivement son catalogue, ses mouvements de stock et ses historiques de vente.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={handleDelete}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  height: 42,
                  flexShrink: 0,
                  borderColor: alpha(theme.palette.error.main, 0.4),
                  '&:hover': {
                    borderColor: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.08)
                  }
                }}
              >
                Supprimer l'entreprise
              </Button>
            </Box>

            {showConfirmDelete && (
              <Fade in={showConfirmDelete}>
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{
                    mt: 2.5,
                    borderRadius: '14px',
                    border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
                    bgcolor: alpha(theme.palette.error.main, 0.06)
                  }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => setShowConfirmDelete(false)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={confirmDelete}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          boxShadow: 'none'
                        }}
                      >
                        Confirmer la suppression irréversible
                      </Button>
                    </Box>
                  }
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Attention : cette opération est immédiate et irréversible.
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Paper>
        </Stack>
      </form>

      {/* Subscription Dialog */}
      <Dialog
        open={openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '24px',
            border: `1px solid ${theme.palette.divider}`,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, px: 2.5, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex'
              }}
            >
              <VpnKeyRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Code d'Activation</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Renouvellement de licence</Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpenSubscriptionDialog(false)}
            size="small"
            sx={{ borderRadius: '10px' }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 3 }}>
          <form onSubmit={onSubmitAbon}>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Veuillez saisir votre clé ou code d'activation pour prolonger la durée de validité de votre établissement.
              </Typography>

              <TextField
                fullWidth
                label="Code d'abonnement"
                name="code"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                required
                autoFocus
                size="small"
                placeholder="Ex: GS-PRO-2026-XXXX"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: 1.5
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: '12px',
                  height: 44,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Activer et Valider
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

