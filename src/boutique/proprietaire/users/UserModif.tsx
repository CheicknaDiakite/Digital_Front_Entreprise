import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Box,
  Stack,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { connect } from "../../../_services/account.service";
import { useParams } from "react-router-dom";
import { useDeleteUser, useFetchUnUser, useUpdateUser } from "../../../usePerso/fonction.user";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";

// Components

export const UserModif: FC = () => {
  const { uuid } = useParams();
  const { unUser, setUnUser } = useFetchUnUser(uuid!);

  unUser["user_id"] = connect;
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser()

  const [is_cab, setCab] = useState(false);

  useEffect(() => {
    if (unUser.is_cabinet !== undefined) {
      setCab(unUser.is_cabinet);
    }
  }, [unUser.is_cabinet]);

  const Is_Cab = () => {
    setCab(!is_cab);
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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unUser["is_cabinet"] = is_cab;
    // unUser["boutique_id"] = selectedBoutique;

    updateUser(unUser);
  };

  return (
    <Box className="min-h-screen py-8">
      <Nav>
        <Button
          size="small"
          color="error"
          variant="contained"
          className="rounded-full"
          onClick={() => deleteUser(unUser)}
          startIcon={<DeleteIcon />}
        >
          Supprimer
        </Button>
      </Nav>

      <Box className="max-w-2xl mx-auto">
        <Card elevation={3} className="p-6">
          <Typography variant="h4" color="primary" gutterBottom>
            Modification du profil
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Modifier les informations de l'utilisateur
          </Typography>

          <form onSubmit={onSubmit} className="mt-6">
            <Stack spacing={4}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Nom d'utilisateur
                </Typography>
                <MyTextField
                  fullWidth
                  disabled
                  variant="outlined"
                  name="username"
                  onChange={onChange}
                  value={unUser.username}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Nom
                </Typography>
                <MyTextField
                  fullWidth
                  disabled
                  variant="outlined"
                  name="last_name"
                  onChange={onChange}
                  value={unUser.last_name}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Prénom
                </Typography>
                <MyTextField
                  fullWidth
                  disabled
                  variant="outlined"
                  name="first_name"
                  onChange={onChange}
                  value={unUser.first_name}
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel id="role-label">Type de compte</InputLabel>
                <Select
                  labelId="role-label"
                  id="role-select"
                  name="role"
                  value={unUser.role || ""}
                  onChange={onSelectChange}
                  label="Type de compte"
                >
                  <MenuItem value={1}>Activer</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="typeRole-label">Type de Role (Abonnement)</InputLabel>
                <Select
                  labelId="typeRole-label"
                  id="typeRole-select"
                  name="typeRole"
                  value={unUser.typeRole || 1}
                  onChange={onSelectChange}
                  label="Type de Role (Abonnement)"
                >
                  <MenuItem value={1}>Simple</MenuItem>
                  <MenuItem value={2}>Basic</MenuItem>
                  <MenuItem value={3}>Prenium</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Checkbox
                  checked={is_cab}
                  onChange={Is_Cab}
                />
                }
                label="Intermediere ?"
                labelPlacement="end"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Enregistrer les modifications
              </Button>
            </Stack>
          </form>
        </Card>
      </Box>

      {/* <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        userName={unUser.username}
      /> */}
    </Box>
  );
};
