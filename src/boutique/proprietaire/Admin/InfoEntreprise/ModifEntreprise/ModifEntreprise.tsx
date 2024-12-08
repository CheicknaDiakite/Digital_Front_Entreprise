import { ChangeEvent, FormEvent, useState } from 'react';
import MainCard from '../../../../../components/MainCard'
import { Button, Dialog, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material'
import { connect } from '../../../../../_services/account.service';
import { useDeleteEntreprise, useFetchEntreprise, useUpdateEntreprise } from '../../../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useStoreUuid } from '../../../../../usePerso/store';

export default function ModifEntreprise() {
    const uuid = useStoreUuid((state) => state.selectedId)
    const {unEntreprise, setUnEntreprise} = useFetchEntreprise(uuid!)
    unEntreprise["user_id"] = connect
    const {deleteEntreprise} = useDeleteEntreprise()

    const handleDelete = () => {
      const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
      if (confirmation) {
        // Appel de la fonction de suppression
        deleteEntreprise(unEntreprise);
      }
    };
    const {updateEntreprise} = useUpdateEntreprise()

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const options = countryList().getData();

    const [image, setImage] = useState<File | null>(null);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUnEntreprise({
          ...unEntreprise,
          [name]: value,
        });
      };
    
      const onSelectChange = (e: SelectChangeEvent<string>) => {
        setUnEntreprise({
          ...unEntreprise,
          [e.target.name]: e.target.value,
        });
      };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      unEntreprise["user_id"]= connect
      unEntreprise["image"]= image
      // formValues["user_id"]= connect
      // formValues["user_id"]= connect
      
      updateEntreprise(unEntreprise)
    };
    const onSubmitAbon = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      unEntreprise["user_id"]= connect
      // unEntreprise["image"]= image
      // formValues["user_id"]= connect
      // formValues["user_id"]= connect
      
      updateEntreprise(unEntreprise)
    };
    
  return <>

    <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
      <DeleteIcon fontSize='small' />
    </Button>
  <Grid container rowSpacing={4.5} columnSpacing={2.75}>
    <Grid item xs={12} md={5} lg={6}>        
        <MainCard sx={{ mt: 2 }} content={false} title="Modification de l'entreprise">
            
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>

            <TextField 
                variant="outlined" 
                type='file'
                label='image' 
                // name='image' 
                // value={unEntreprise.nom} 
                onChange={handleImageChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <TextField 
                variant="outlined" 
                label='Nom' 
                name='nom' 
                value={unEntreprise.nom} 
                onChange={onChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <TextField 
                variant="outlined" 
                label='coordonne' 
                name='coordonne' 
                value={unEntreprise.coordonne} 
                onChange={onChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <TextField
                variant="outlined"
                label='Email'
                name='email'
                value={unEntreprise.email} 
                onChange={onChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <TextField 
                variant="outlined"
                label='Adresse'
                name='adresse' 
                value={unEntreprise.adresse}
                onChange={onChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <TextField 
                variant="outlined"
                label='Numéro'
                name='numero' 
                value={unEntreprise.numero} 
                onChange={onChange}
                InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
                }}
            ></TextField>
            <FormControl fullWidth className='mb-4'>
                <InputLabel id="select-pays-label">Pays = {unEntreprise.pays}</InputLabel>
                <Select
                labelId="select-pays-label"
                value={unEntreprise.pays}
                onChange={onSelectChange}
                name='pays'
                placeholder="Choisir un pays"
                >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.label}>
                    {option.label}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            
            <Button type="submit" color="success" variant="outlined" >Envoyer</Button>
            <Button variant="outlined" onClick={handleClickOpen}>
              Code d'abonnement
            </Button>

            </Stack>
            </form>

            <Dialog
            open={open}
            onClose={handleClose}
            
      >
        <DialogTitle>Code d'abonnement</DialogTitle>
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmitAbon}>
            <Stack spacing={2} margin={2}>
                  
            <TextField 
              variant="outlined"
              label="Code d'abonnement"
              name='code' 
              // value={unEntreprise.code} 
              onChange={onChange}
              InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
              }}
            ></TextField>
            
            {/* <Button onClick={handleClose}>Cancel</Button> */}
            <Button type="submit">Envoyer</Button>
            
            </Stack>
          </form>
      </Dialog>
            
        </MainCard>
        
    </Grid>    
  </Grid>
  </>
}
