import {
  Card,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useParams } from "react-router-dom";
import { connect } from "../../../_services/account.service";
import { ChangeEvent, FormEvent } from "react";
import { useDeleteUser, useFetchUser, useUpdateUser } from "../../../usePerso/fonction.user";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";

export function PersonnelModif() {
  const { uuid } = useParams();
  const entreprise_id = useStoreUuid((state) => state.selectedId)
  const { unUser, setUnUser } = useFetchUser(uuid!);
  
  unUser["user_id"] = connect;
  const { updateUser } = useUpdateUser();
  const {deleteUser} = useDeleteUser()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteUser(unUser);
    }
  };
  
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
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

    unUser["entreprise_id"] = entreprise_id!;
    
    updateUser(unUser);
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <Nav>
        {unUser.uuid !== connect && 
        <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
          <DeleteIcon fontSize='small' />
        </Button>
        }
        
      </Nav>
      <Card elevation={3} style={{ padding: "20px", maxWidth: "500px", width: "100%" }}>
        <Typography variant="h4" color="textPrimary">
          Modification
        </Typography>
        <Typography color="textSecondary" className="mt-1">
          modification de cet utilisateur 
        </Typography>
        <form className="mt-8" onSubmit={onSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            {/* <Typography variant="h6" color="textPrimary">
              Nom de famille
            </Typography> */}
            <MyTextField 
            fullWidth
            disabled
            label="Nom d'utilisateur"
            variant="outlined"
            name="username"
            onChange={onChange}
            value={unUser.username}
            />

            <MyTextField 
            fullWidth
            label="Nom"
            variant="outlined"
            name="last_name"
            onChange={onChange}
            value={unUser.last_name}
            />
            
            {/* <Typography variant="h6" color="textPrimary">
              Prenom
            </Typography> */}

            <MyTextField 
            fullWidth
            label="Prenom"
            variant="outlined"
            name="first_name"
            onChange={onChange}
            value={unUser.first_name}
            />

            <MyTextField 
            fullWidth
            label="Email"
            variant="outlined"
            name="email_user"
            onChange={onChange}
            value={unUser.email_user}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            />

            <MyTextField 
            fullWidth
            label="Numero"
            type="number"
            variant="outlined"
            name="first_name"
            onChange={onChange}
            value={unUser.numero}
            />
            
          </div>

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Compte</InputLabel>
            <Select
              labelId="role-label"
              id="role-select"
              name="role"
              value={unUser.role || ""}
              onChange={onSelectChange}
              label="Role"
            >
              <MenuItem value={2}>Gerant</MenuItem>
              <MenuItem value={3}>Caissier(e)</MenuItem>
              <MenuItem value={4}>Visiteur</MenuItem>
            </Select>
          </FormControl>

          <MyTextField
            label="Password"
            name="password"
            onChange={onChange}
            variant="outlined"
            className="mb-4"
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            // {...register('last_name')}
            fullWidth
          />
          <MyTextField
            label="Confirmer le mot de passe"
            name="repassword"
            onChange={onChange}
            className="mb-4"
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            // {...register('first_name')}
            fullWidth
          />

          <Button className="mt-6" type="submit" color="primary" variant="contained" fullWidth>
            Modifier
          </Button>
          
        </form>
      </Card>
    </div>
  );
}
