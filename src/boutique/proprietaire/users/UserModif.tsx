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
  
  export function UserModif() {
    const { uuid } = useParams();
    const { unUser, setUnUser } = useFetchUser(uuid!);
    unUser["user_id"] = connect;
    const { updateUser } = useUpdateUser();
    const {deleteUser} = useDeleteUser()
  
    // const { userBoutiques, isLoading } = useGetUserBoutiques(String(connect));
  
    // const [selectedBoutique, setSelectedBoutique] = useState<number>(0);
  
    // useEffect(() => {
    //   if (!isLoading && userBoutiques.length > 0) {
    //     setSelectedBoutique(userBoutiques[0].id); // Sélectionner la première boutique par défaut
    //   }
    // }, [isLoading, userBoutiques]);
  
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
      // unUser["user_id"] = connect;
      // unUser["boutique_id"] = selectedBoutique;
      
      updateUser(unUser);
    };
  
    return (
      <div className="flex justify-center items-center flex-col">
        <Nav>
          <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={() => deleteUser(unUser)}>
            <DeleteIcon fontSize='small' />
          </Button>
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
              <Typography variant="h6" color="textPrimary">
                Nom d'utilisateur
              </Typography>
              <MyTextField 
              fullWidth
              disabled
              variant="outlined"
              name="last_name"
              onChange={onChange}
              value={unUser.username}
              />
              <Typography variant="h6" color="textPrimary">
                Nom de famille
              </Typography>
              <MyTextField 
              fullWidth
              disabled
              variant="outlined"
              name="last_name"
              onChange={onChange}
              value={unUser.last_name}
              />
              
              <Typography variant="h6" color="textPrimary">
                Prenom
              </Typography>
              <MyTextField 
              fullWidth
              disabled
              variant="outlined"
              name="first_name"
              onChange={onChange}
              value={unUser.first_name}
              />
              {/* <TextField
                fullWidth
                variant="outlined"
                name="first_name"
                onChange={onChange}
                value={unUser.first_name}
              /> */}
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
                <MenuItem value={1}>Activer</MenuItem>
                {/* <MenuItem value={2}>Gerant</MenuItem>
                <MenuItem value={3}>Caissier</MenuItem>
                <MenuItem value={4}>Visiteur</MenuItem> */}
              </Select>
            </FormControl>
  
            <Button className="mt-6" type="submit" color="primary" variant="contained" fullWidth>
              Modifier
            </Button>
            {/* <Typography color="textSecondary" className="mt-4 text-center">
              Already have an account?{" "}
              <a href="#" className="font-medium text-primary">
                Sign In
              </a>
            </Typography> */}
          </form>
        </Card>
      </div>
    );
  }
  