import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
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
  alpha,
  Tooltip,
  Fade,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { connect } from '../../../../../_services/account.service';
import { useDeleteEntreprise, useFetchEntreprise, useUpdateEntreprise } from '../../../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import KeyIcon from '@mui/icons-material/Key';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
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
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const options = countryList().getData();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteEntreprise({ ...unEntreprise, user_id: connect });
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
    updateEntreprise({ ...unEntreprise, user_id: connect, image });
  };

  const onSubmitAbon = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateEntreprise({ ...unEntreprise, user_id: connect });
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        className="m-4"
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      >
        Problème de connexion ! Veuillez réessayer.
      </Alert>
    );
  }

  const url = unEntreprise.image ? BASE(unEntreprise.image) : img;

  return (
    <Box className={`max-w-4xl mx-auto p-4 ${isMobile ? 'mobile-modif-container' : ''}`}>
      {/* Header Section */}
      <Box className="mb-8 flex flex-col items-start gap-2">
        <Typography variant="h4" className="font-bold text-gray-50 tracking-tight">
          Paramètres de l'entreprise
        </Typography>
        <Typography variant="body2" className="text-gray-100">
          Gérez les informations d'identification et les paramètres globaux de votre entreprise.
        </Typography>
      </Box>

      {/* Enterprise ID & License Banner */}
      <Card
        elevation={0}
        variant="outlined"
        className="mb-8 overflow-hidden rounded-2xl"
        sx={{
          background: `linear-gradient(135deg, ${alpha('#1976d2', 0.05)}, ${alpha('#9c27b0', 0.05)})`,
          borderColor: alpha('#1976d2', 0.1),
        }}
      >
        <CardContent className="p-6">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-1">
                <Typography variant="overline" className="text-gray-50 font-semibold leading-none">
                  Identifiant de l'entreprise
                </Typography>
                <Typography variant="h5" className="text-gray-50 font-bold">
                  {unEntreprise.ref}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col md:items-end gap-2">
                <Typography variant="overline" className="text-gray-50 font-semibold leading-none">
                  Statut du compte
                </Typography>
                <LicenceTag type={unEntreprise.licence_type}>
                  {unEntreprise.licence_type} • {getLicenceDuration(unEntreprise.licence_date_expiration)}
                </LicenceTag>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          {/* General Information Section */}
          <Paper elevation={0} variant="outlined" className="p-6 rounded-2xl">
            <Typography variant="h6" className="mb-6 font-semibold flex items-center gap-2">
              <Box className="w-1.5 h-6 bg-blue-50 rounded-full" />
              Informations générales
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4} className="flex flex-col items-center justify-center">
                {/* Avatar Uploader */}
                <Box className="relative">
                  <Avatar
                    src={previewUrl || url}
                    sx={{
                      width: 140,
                      height: 140,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '4px solid white',
                    }}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  />
                  <IconButton
                    className="absolute bottom-0 right-0 bg-white shadow-lg hover:bg-gray-50 border border-gray-100"
                    size="small"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <CameraAltIcon fontSize="small" className="text-gray-600" />
                  </IconButton>
                  <input
                    type="file"
                    id="image-upload"
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Box>
                <Typography variant="caption" className="mt-4 text-gray-400 text-center">
                  Cliquez sur l'image pour changer le logo. <br />
                  Format supporté: JPG, PNG.
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="nom"
                    value={unEntreprise.nom}
                    onChange={onChange}
                    required
                    variant="outlined"
                    className={isMobile ? 'mobile-form-field' : ''}
                  />
                  <TextField
                    fullWidth
                    label="Type d'entreprise"
                    name="libelle"
                    value={unEntreprise.libelle}
                    onChange={onChange}
                    placeholder="ex: Restauration, Commerce, Service..."
                    className={isMobile ? 'mobile-form-field' : ''}
                  />
                  <FormControl fullWidth className={isMobile ? 'mobile-form-field' : ''}>
                    <InputLabel>Pays</InputLabel>
                    <Select
                      value={unEntreprise.pays}
                      onChange={onSelectChange}
                      name="pays"
                      label="Pays"
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
          </Paper>

          {/* Contact & Location Section */}
          <Paper elevation={0} variant="outlined" className="p-6 rounded-2xl">
            <Typography variant="h6" className="mb-6 font-semibold flex items-center gap-2">
              <Box className="w-1.5 h-6 bg-purple-600 rounded-full" />
              Contact & Localisation
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email professionnel"
                  name="email"
                  type="email"
                  value={unEntreprise.email}
                  onChange={onChange}
                  className={isMobile ? 'mobile-form-field' : ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro de téléphone"
                  name="numero"
                  value={unEntreprise.numero}
                  onChange={onChange}
                  className={isMobile ? 'mobile-form-field' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  name="adresse"
                  value={unEntreprise.adresse}
                  onChange={onChange}
                  multiline
                  rows={2}
                  className={isMobile ? 'mobile-form-field' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Informations complémentaires"
                  placeholder="Coordonnées bancaires, horaires, etc."
                  name="coordonne"
                  value={unEntreprise.coordonne}
                  onChange={onChange}
                  multiline
                  rows={2}
                  className={isMobile ? 'mobile-form-field' : ''}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Form Actions */}
          <Box className={`flex items-center gap-4 ${isMobile ? 'flex-col' : 'justify-between'}`}>
            <Button
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={() => setOpen(true)}
              className={`rounded-xl px-6 h-[48px] ${isMobile ? 'w-full order-2' : ''}`}
              sx={{ color: 'gray.600', borderColor: 'gray.200' }}
            >
              Code d'abonnement
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              className={`bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-[48px] shadow-lg shadow-blue-200 ${isMobile ? 'w-full order-1' : ''}`}
            >
              Enregistrer les modifications
            </Button>
          </Box>

          <Divider className="my-4" />

          {/* Danger Zone */}
          <Box
            className="p-6 rounded-2xl border border-red-100 bg-red-50/50"
          >
            <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Box>
                <Typography variant="h6" color="error" className="font-bold flex items-center gap-2">
                  Zone de danger
                </Typography>
                <Typography variant="body2" className="text-red-600 mt-1">
                  Une fois supprimée, toutes les données de l'entreprise seront définitivement perdues.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                className="rounded-xl px-6 h-[40px] bg-white"
              >
                Supprimer l'entreprise
              </Button>
            </Box>

            {showConfirm && (
              <Fade in={showConfirm}>
                <Alert
                  severity="error"
                  variant="outlined"
                  className="mt-4 bg-white"
                  action={
                    <div className="space-x-2">
                      <Button color="inherit" size="small" onClick={() => setShowConfirm(false)}>
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={confirmDelete}
                        className="bg-red-600"
                      >
                        Confirmer la suppression
                      </Button>
                    </div>
                  }
                >
                  <Typography variant="body2" className="font-semibold">
                    Êtes-vous absolument sûr ? Cette action est irréversible.
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Box>
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
          className: "rounded-3xl"
        }}
      >
        <DialogTitle className="flex justify-between items-center border-b pb-4 pt-6 px-6">
          <Typography variant="h6" className="font-bold">Code d'abonnement</Typography>
          <IconButton onClick={() => setOpen(false)} size="small" className="bg-gray-50">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="px-6 py-8">
          <form onSubmit={onSubmitAbon} className="space-y-6">
            <Typography variant="body2" className="text-gray-500">
              Veuillez saisir le code d'activation pour prolonger ou mettre à jour votre licence.
            </Typography>
            <TextField
              fullWidth
              label="Entrez votre code"
              name="code"
              onChange={onChange}
              required
              autoFocus
              variant="filled"
              InputProps={{ disableUnderline: true, className: "rounded-xl" }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="bg-blue-600 hover:bg-blue-700 h-[48px] rounded-xl shadow-lg shadow-blue-200"
            >
              Valider le code
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
