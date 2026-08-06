import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  Chip
} from '@mui/material';

import { useDeleteEntreprise, useFetchEntreprise, useFetchUser, useUpdateEntreprise } from '../../../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useStoreUuid } from '../../../../../usePerso/store';
import { BASE } from '../../../../../_services/caller.service';
import img from '../../../../../../public/icon-192x192.png';
import '../../mobile-admin.css';
import { getLicenceDuration } from '../../../../../usePerso/fonctionPerso';
import { LicenceTag } from '../../Entreprise';

export default function ModifEntreprise() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, setUnEntreprise, isLoading, isError } = useFetchEntreprise(uuid);
  const { deleteEntreprise } = useDeleteEntreprise();
  const { updateEntreprise } = useUpdateEntreprise();

  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';
  
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const options = countryList().getData();

  const handleDelete = () => setShowConfirm(true);

  const confirmDelete = () => {
    deleteEntreprise({ ...unEntreprise, user_id: user_id });
    setShowConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnEntreprise({ ...unEntreprise, [name]: value });
  };

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    setUnEntreprise({ ...unEntreprise, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!unEntreprise) return null;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateEntreprise({ ...unEntreprise, user_id: user_id, image });
  };

  const onSubmitAbon = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateEntreprise({ ...unEntreprise, user_id: user_id });
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: 2 }}>
        <CircularProgress size={44} thickness={4} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chargement des paramètres...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        >
          Problème de connexion ! Veuillez réessayer.
        </Alert>
      </Box>
    );
  }

  const url = unEntreprise.image ? BASE(unEntreprise.image) : img;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
          Paramètres de l'entreprise
        </Typography>
        <Typography variant="body2" className="text-gray-300">
          Gérez les informations d'identification et les paramètres globaux de votre entreprise.
        </Typography>
      </Box>

      {/* Licence & Ref Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: '16px',
          // background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: '0.7rem' }}>
                  Identifiant de l'entreprise
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                  {unEntreprise.ref || 'Pas trouvé'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 0.75 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: '0.7rem' }}>
                  Statut du compte
                </Typography>
                <LicenceTag type={unEntreprise.licence_type}>
                  {unEntreprise.licence_type} • {getLicenceDuration(unEntreprise.licence_date_expiration)}
                </LicenceTag>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          {/* Section: Informations générales */}
          <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BadgeIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Informations générales
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Avatar Upload */}
                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={previewUrl || url}
                      sx={{
                        width: 120,
                        height: 120,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '4px solid #ffffff',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                        '&:hover': { opacity: 0.85 }
                      }}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    />
                    <Tooltip title="Changer le logo" arrow>
                      <IconButton
                        size="small"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          bgcolor: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          border: '1px solid #e2e8f0',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <CameraAltIcon fontSize="small" sx={{ color: '#64748b' }} />
                      </IconButton>
                    </Tooltip>
                    <input
                      type="file"
                      id="image-upload"
                      hidden
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
                    Cliquez pour changer le logo<br />
                    Format : JPG, PNG
                  </Typography>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Nom de l'entreprise"
                      name="nom"
                      value={unEntreprise.nom}
                      onChange={onChange}
                      required
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#cbd5e1' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Type d'entreprise"
                      name="libelle"
                      value={unEntreprise.libelle}
                      onChange={onChange}
                      size="small"
                      placeholder="ex: Restauration, Commerce, Service..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#cbd5e1' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Pays</InputLabel>
                      <Select
                        value={unEntreprise.pays || ''}
                        onChange={onSelectChange}
                        name="pays"
                        label="Pays"
                        sx={{ borderRadius: '10px' }}
                      >
                        {options.map((option) => (
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

          {/* Section: Contact & Localisation */}
          <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOnIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700}}>
                Contact & Localisation
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email professionnel"
                    name="email"
                    type="email"
                    size="small"
                    value={unEntreprise.email}
                    onChange={onChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': { borderColor: '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro de téléphone"
                    name="numero"
                    size="small"
                    value={unEntreprise.numero}
                    onChange={onChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': { borderColor: '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    size="small"
                    value={unEntreprise.adresse}
                    onChange={onChange}
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': { borderColor: '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Informations complémentaires"
                    placeholder="Coordonnées bancaires, horaires, etc."
                    name="coordonne"
                    size="small"
                    value={unEntreprise.coordonne}
                    onChange={onChange}
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': { borderColor: '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Form Actions */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                height: 44,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Code d'abonnement
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                height: 44,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Enregistrer les modifications
            </Button>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          {/* Danger Zone */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              bgcolor: 'rgba(254, 242, 242, 0.5)'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    Zone de danger
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#b91c1c' }}>
                  Une fois supprimée, toutes les données de l'entreprise seront définitivement perdues.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ 
                  borderRadius: '10px', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 3, 
                  height: 40, 
                  bgcolor: '#ffffff',
                  flexShrink: 0
                }}
              >
                Supprimer l'entreprise
              </Button>
            </Box>

            {showConfirm && (
              <Fade in={showConfirm}>
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{ mt: 2.5, borderRadius: '12px', bgcolor: '#ffffff' }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        color="inherit" 
                        size="small" 
                        onClick={() => setShowConfirm(false)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={confirmDelete}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                      >
                        Confirmer
                      </Button>
                    </Box>
                  }
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Êtes-vous absolument sûr ? Cette action est irréversible.
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Paper>
        </Stack>
      </form>

      {/* Subscription Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: { borderRadius: '20px', border: '1px solid #e2e8f0' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, px: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <KeyIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Code d'abonnement</Typography>
          </Box>
          <IconButton 
            onClick={() => setOpen(false)} 
            size="small" 
            sx={{ bgcolor: '#f8fafc', borderRadius: '8px', '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <form onSubmit={onSubmitAbon}>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Veuillez saisir le code d'activation pour prolonger ou mettre à jour votre licence.
              </Typography>
              <TextField
                fullWidth
                label="Entrez votre code"
                name="code"
                onChange={onChange}
                required
                autoFocus
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: 2,
                    '& fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: '10px',
                  height: 44,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)' }
                }}
              >
                Valider le code
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
