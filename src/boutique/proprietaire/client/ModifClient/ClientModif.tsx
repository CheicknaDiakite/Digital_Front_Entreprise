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
  import { ChangeEvent, FormEvent } from "react";
import { connect } from "../../../../_services/account.service";
import { useUnClient, useUpdateClient } from "../../../../usePerso/fonction.user";
import MyTextField from "../../../../_components/Input/MyTextField";
import { UuType } from "../../../../typescript/Account";
import { useStoreUuid } from "../../../../usePerso/store";
 
 export function ClientModif(uuid: UuType) {
    const entreprise_id = useStoreUuid((state) => state.selectedId)
    const {unClient, setUnClient } = useUnClient(uuid.uuid!);
    
    unClient["user_id"] = connect;
    const { updateClient } = useUpdateClient();
    
    // const { userEntreprises } = useGetUserEntreprises(connect);
  
    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
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
      unClient["entreprise_id"] =  entreprise_id!
      updateClient(unClient);
    };
  
    return (
      <div className="flex justify-center items-center flex-col">
        {/* <Nav>
          <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={() => deleteClient(unClient)}>
            <DeleteIcon fontSize='small' />
          </Button>
        </Nav> */}
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
                Nom de l'entreprise
              </Typography>
              <MyTextField 
              fullWidth
              variant="outlined"
              name="nom"
              onChange={onChange}
              value={unClient.nom}
              />
              
              <Typography variant="h6" color="textPrimary">
                Adresse
              </Typography>
              <MyTextField 
              fullWidth
              variant="outlined"
              name="adresse"
              onChange={onChange}
              value={unClient.adresse}
              />

              <Typography variant="h6" color="textPrimary">
                coordonne
              </Typography>
              <MyTextField 
              fullWidth
              variant="outlined"
              name="coordonne"
              onChange={onChange}
              value={unClient.coordonne}
              />
              <Typography variant="h6" color="textPrimary">
                libelle
              </Typography>
              <MyTextField 
              fullWidth
              variant="outlined"
              name="libelle"
              onChange={onChange}
              value={unClient.libelle}
              />
              <Typography variant="h6" color="textPrimary">
                numero
              </Typography>
              <MyTextField 
              fullWidth
              variant="outlined"
              name="numero"
              onChange={onChange}
              value={unClient.numero}
              />
              
            </div>
  
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Type = {unClient.role === 1 ? "Client" : unClient.role === 2 ? "Fournisseur" : "Autre"}</InputLabel>
              <Select
                labelId="role-label"
                id="role-select"
                name="role"
                value={unClient.role || 0}
                onChange={onSelectChange}
                label="Role"
              >
                <MenuItem value={1}>Client</MenuItem>
                <MenuItem value={2}>Fournisseur</MenuItem>
                <MenuItem value={3}>Les deux</MenuItem>
              </Select>
            </FormControl>
  
            <Button className="mt-6" type="submit" color="primary" variant="contained" fullWidth>
              Modifier
            </Button>
            
          </form>
        </Card>
      </div>
    );
  }
  