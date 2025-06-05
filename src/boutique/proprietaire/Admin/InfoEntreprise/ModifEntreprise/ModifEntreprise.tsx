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
  Fade
} from '@mui/material';
import { connect } from '../../../../../_services/account.service';
import { useDeleteEntreprise, useFetchEntreprise, useUpdateEntreprise } from '../../../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import KeyIcon from '@mui/icons-material/Key';
import { useStoreUuid } from '../../../../../usePerso/store';
import { BASE } from '../../../../../_services/caller.service';
import img from '../../../../../../public/icon-192x192.png';

export default function ModifEntreprise() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, setUnEntreprise, isLoading, isError } = useFetchEntreprise(uuid!);
  const { deleteEntreprise } = useDeleteEntreprise();
  const { updateEntreprise } = useUpdateEntreprise();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const options = countryList().getData();

  const handleDelete = () => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?");
    if (confirmation) {
      deleteEntreprise({ ...unEntreprise, user_id: connect });
    }
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

  if (!unEntreprise) return null;

  const url = unEntreprise.image ? BASE(unEntreprise.image) : img;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Typography variant="h4" className="font-semibold text-gray-900">
          Paramètres de l'entreprise
        </Typography>

        <Tooltip title="Supprimer l'entreprise" arrow TransitionComponent={Fade}>
          <IconButton 
            onClick={handleDelete}
            className="bg-white hover:bg-red-50 text-red-600 shadow-sm"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>

      <Paper elevation={0} className="border rounded-lg overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="subtitle2" className="mb-4 text-gray-600">
                  Informations générales
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Identifiant"
                    value={unEntreprise.ref}
                    disabled
                    className="bg-gray-50"
                  />

                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="nom"
                    value={unEntreprise.nom}
                    onChange={onChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Type d'entreprise"
                    name="libelle"
                    value={unEntreprise.libelle}
                    onChange={onChange}
                    required
                  />

                  <FormControl fullWidth>
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
              </div>

              <div>
                <Typography variant="subtitle2" className="mb-4 text-gray-600">
                  Contact et Image
                </Typography>

                <Stack spacing={3}>
                  <div className="space-y-4">
                    <Box className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      {(previewUrl || url) && (
                        <img 
                          src={previewUrl || url} 
                          alt={unEntreprise.nom} 
                          className="max-h-full object-contain"
                        />
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      type="file"
                      onChange={handleImageChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <ImageIcon className="mr-2 text-gray-400" />,
                      }}
                    />
                  </div>

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={unEntreprise.email}
                    onChange={onChange}
                  />

                  <TextField
                    fullWidth
                    label="Numéro de téléphone"
                    name="numero"
                    value={unEntreprise.numero}
                    onChange={onChange}
                  />

                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={unEntreprise.adresse}
                    onChange={onChange}
                    multiline
                    rows={2}
                  />
                </Stack>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <Button
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={() => setOpen(true)}
            >
              Code d'abonnement
            </Button>

            <Button
              type="submit"
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          className: "rounded-lg"
        }}
      >
        <DialogTitle className="flex justify-between items-center border-b pb-3">
          <Typography variant="h6">Code d'abonnement</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="mt-4">
          <form onSubmit={onSubmitAbon} className="space-y-4">
            <TextField
              fullWidth
              label="Code d'abonnement"
              name="code"
              onChange={onChange}
              required
              autoFocus
            />

            <div className="pt-4 border-t flex justify-end">
              <Button
                type="submit"
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Valider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
