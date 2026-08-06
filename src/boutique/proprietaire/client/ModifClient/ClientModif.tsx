import {
  Typography,
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Paper,
  Box,
  useTheme,
} from "@mui/material";
import { ChangeEvent, FormEvent } from "react";
import { connect } from "../../../../_services/account.service";
import { useFetchUser, useUnClient, useUpdateClient } from "../../../../usePerso/fonction.user";
import MyTextField from "../../../../_components/Input/MyTextField";
import { UuType } from "../../../../typescript/Account";
import { useStoreUuid } from "../../../../usePerso/store";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useAppSettings } from "../../../../themes/AppSettingsContext";

export function ClientModif(uuid: UuType) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { unClient, setUnClient } = useUnClient(uuid.uuid!);
  const { unUser } = useFetchUser()
  unClient["user_id"] = unUser.uuid;
  const { updateClient } = useUpdateClient();

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUnClient({
      ...unClient,
      [name]: value,
    });
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setUnClient({
      ...unClient,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unClient["entreprise_id"] = entreprise_id!;
    updateClient(unClient);
  };

  return (
    <Box className="max-w-3xl mx-auto">
      <Paper
        elevation={0}
        className="p-6 rounded-2xl border border-gray-200/40 bg-transparent"
        sx={{ background: 'transparent', bgcolor: 'transparent' }}
      >
        <div className="border-b border-gray-100 pb-4 mb-6">
          <Typography variant="h5" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
            Modification du profil
          </Typography>
          <Typography variant="body2" className="mt-1" color={isDarkText ? 'white' : 'text.primary'}>
            Mettez à jour les coordonnées et le rôle de ce contact
          </Typography>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom complet */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <PersonOutlinedIcon fontSize="small" className="text-blue-600" />
                <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                  Nom complet *
                </Typography>
              </div>
              <MyTextField
                fullWidth
                size="small"
                variant="outlined"
                name="nom"
                onChange={onChange}
                value={unClient.nom || ''}
                placeholder="Nom complet du client"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <EmailOutlinedIcon fontSize="small" className="text-blue-600" />
                <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                  Adresse email
                </Typography>
              </div>
              <MyTextField
                fullWidth
                size="small"
                variant="outlined"
                name="email"
                type="email"
                onChange={onChange}
                value={unClient.email || ''}
                placeholder="Ex: exemple@domaine.com"
              />
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <PhoneOutlinedIcon fontSize="small" className="text-blue-600" />
                <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                  Numéro de téléphone
                </Typography>
              </div>
              <MyTextField
                fullWidth
                size="small"
                variant="outlined"
                name="numero"
                onChange={onChange}
                value={unClient.numero || ''}
                placeholder="Numéro de téléphone"
              />
            </div>

            {/* Type de client */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <BusinessOutlinedIcon fontSize="small" className="text-blue-600" />
                <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                  Statut du contact
                </Typography>
              </div>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="role-label" sx={{ color: isDarkText ? 'white' : 'text.primary' }}>Type de client</InputLabel>
                <Select
                  labelId="role-label"
                  id="role-select"
                  name="role"
                  value={unClient.role || 1}
                  onChange={onSelectChange}
                  label="Type de client"
                >
                  <MenuItem value={1}>Client (Achète chez nous)</MenuItem>
                  <MenuItem value={2}>Fournisseur (Nous vend du stock)</MenuItem>
                  <MenuItem value={3}>Les deux (Client & Fournisseur)</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-gray-700">
              <LocationOnOutlinedIcon fontSize="small" className="text-blue-600" />
              <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                Adresse
              </Typography>
            </div>
            <MyTextField
              fullWidth
              size="small"
              variant="outlined"
              name="adresse"
              onChange={onChange}
              value={unClient.adresse || ''}
              placeholder="Adresse géographique complète"
            />
          </div>

          {/* Coordonnées */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-gray-700">
              <BusinessOutlinedIcon fontSize="small" className="text-blue-600" />
              <Typography variant="subtitle2" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                Notes & Coordonnées complémentaires
              </Typography>
            </div>
            <MyTextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              name="coordonne"
              onChange={onChange}
              value={unClient.coordonne || ''}
              placeholder="Numéro IFU, détails de livraison, notes particulières..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<SaveOutlinedIcon />}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.2,
                fontSize: '1rem',
                boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.25)',
              }}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Paper>
    </Box>
  );
}

  