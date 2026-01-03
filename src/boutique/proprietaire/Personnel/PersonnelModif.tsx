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
  IconButton,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useParams } from "react-router-dom";
import { connect, userService } from "../../../_services/account.service";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useDeleteUser, useFetchUnUser, useUpdateUser } from "../../../usePerso/fonction.user";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";

export function PersonnelModif() {
  const { uuid } = useParams();
  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { unUser, setUnUser } = useFetchUnUser(uuid!);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restriction, setRestriction] = useState({
    active: false,
    day_start: 0,
    day_end: 4,
    hour_start: "08:00",
    hour_end: "18:00",
  });

  useEffect(() => {
    if (uuid) {
      userService.userRestrictionDetail(uuid).then((res) => {
        if (res.data) {
          setRestriction((prev) => ({ ...prev, ...res.data }));
        }
      });
    }
  }, [uuid]);

  unUser["user_id"] = connect;
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteUser(unUser);
    setShowConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUnUser({
      ...unUser,
      [name]: value,
    });
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setUnUser({
      ...unUser,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unUser["entreprise_id"] = entreprise_id!;
    updateUser(unUser);
    await userService.userRestrictionDetail(uuid!, restriction);
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {showConfirm && (
          <Alert
            severity="warning"
            className="mt-4"
            sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1400,
              width: 'calc(100% - 32px)',
              maxWidth: 600,
            }}
            action={
              <div className="space-x-2">
                <Button color="inherit" size="small" onClick={() => setShowConfirm(false)}>
                  Annuler
                </Button>
                <Button color="error" size="small" onClick={confirmDelete}>
                  Confirmer
                </Button>
              </div>
            }
          >
            Êtes-vous sûr de vouloir supprimer ce membre ?
          </Alert>
        )}

        <Paper elevation={0} className="mt-6 rounded-lg overflow-hidden">
          <Box className="p-6">
            {/* Header */}
            <div className="border-b pb-4 mb-6">
              <Typography variant="h4" className="font-semibold text-gray-900">
                Modification du Profil
              </Typography>
              <Typography variant="body2" className="text-gray-500 mt-1">
                Modifiez les informations du membre
              </Typography>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <PersonIcon fontSize="small" />
                    <Typography variant="subtitle2">Informations personnelles</Typography>
                  </div>
                  <div className="space-y-4">
                    <MyTextField
                      fullWidth
                      disabled
                      label="Nom d'utilisateur"
                      variant="outlined"
                      name="username"
                      onChange={onChange}
                      value={unUser.username}
                      className="bg-gray-50"
                    />

                    <MyTextField
                      fullWidth
                      label="Nom"
                      variant="outlined"
                      name="last_name"
                      onChange={onChange}
                      value={unUser.last_name}
                      className="bg-white"
                    />

                    <MyTextField
                      fullWidth
                      label="Prénom"
                      variant="outlined"
                      name="first_name"
                      onChange={onChange}
                      value={unUser.first_name}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <EmailIcon fontSize="small" />
                    <Typography variant="subtitle2">Contact</Typography>
                  </div>
                  <div className="space-y-4">
                    <MyTextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      name="email_user"
                      onChange={onChange}
                      value={unUser.email_user}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      className="bg-white"
                    />

                    <MyTextField
                      fullWidth
                      label="Numéro"
                      type="number"
                      variant="outlined"
                      name="numero"
                      onChange={onChange}
                      value={unUser.numero}
                      InputProps={{
                        startAdornment: (
                          <PhoneIcon className="mr-2 text-gray-400" />
                        ),
                      }}
                      className="bg-white"
                    />
                  </div>
                </div>

                <Divider />

                <div className="space-y-2">
                  <Typography variant="subtitle2" className="text-gray-700">
                    Rôle et accès
                  </Typography>
                  <FormControl fullWidth variant="outlined" className="bg-white">
                    <InputLabel id="role-label">Type de compte</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role-select"
                      name="role"
                      value={unUser.role || ""}
                      onChange={onSelectChange}
                      label="Type de compte"
                    >
                      <MenuItem value={2}>Superviseur</MenuItem>
                      <MenuItem value={3}>Caissier(e)</MenuItem>
                      <MenuItem value={4}>Pas de rôle</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <Divider />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Typography variant="subtitle2" className="text-gray-700">
                      Restrictions d'accès
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={restriction.active}
                          onChange={(e) => setRestriction({ ...restriction, active: e.target.checked })}
                          name="active"
                          color="primary"
                        />
                      }
                      label="Activer les restrictions"
                    />
                  </div>

                  {restriction.active && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <FormControl fullWidth size="small" className="bg-white">
                        <InputLabel>Jour de début</InputLabel>
                        <Select
                          value={restriction.day_start}
                          label="Jour de début"
                          onChange={(e) => setRestriction({ ...restriction, day_start: Number(e.target.value) })}
                        >
                          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day, index) => (
                            <MenuItem key={index} value={index}>{day}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" className="bg-white">
                        <InputLabel>Jour de fin</InputLabel>
                        <Select
                          value={restriction.day_end}
                          label="Jour de fin"
                          onChange={(e) => setRestriction({ ...restriction, day_end: Number(e.target.value) })}
                        >
                          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day, index) => (
                            <MenuItem key={index} value={index}>{day}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <MyTextField
                        label="Heure de début"
                        type="time"
                        value={restriction.hour_start}
                        onChange={(e) => setRestriction({ ...restriction, hour_start: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        className="bg-white"
                      />

                      <MyTextField
                        label="Heure de fin"
                        type="time"
                        value={restriction.hour_end}
                        onChange={(e) => setRestriction({ ...restriction, hour_end: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Typography variant="subtitle2" className="text-gray-700">
                    Sécurité
                  </Typography>
                  <div className="space-y-4">
                    <MyTextField
                      label="Mot de passe"
                      name="password"
                      type="password"
                      onChange={onChange}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className="bg-white"
                    />

                    <MyTextField
                      label="Confirmer le mot de passe"
                      name="repassword"
                      type="password"
                      onChange={onChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-3 sm:gap-6 justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enregistrer les modifications
                </Button>


                {/* {unUser.uuid !== connect && (
                  <IconButton
                    onClick={handleDelete}
                    size="small"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <DeleteIcon />
                  </IconButton>
                )} */}
              </div>
            </form>
          </Box>
        </Paper>
      </div>
    </div>
  );
}
