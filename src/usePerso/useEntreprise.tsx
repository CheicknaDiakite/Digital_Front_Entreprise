import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import MyTextField from "../_components/Input/MyTextField";
import { useFetchAllSousCate } from "./fonction.categorie";
import { connect } from "../_services/account.service";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useState } from "react";
import { useAllClients } from "./fonction.user";
import { useStoreUuid } from "./store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}


export function useFormValues<T>(initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues({
        ...values,
        [name]: value,
      });
    };
  
    return [values, handleChange, setValues] as const;
  }
  
export function AjoutEntreForm({
    onSubmit,
    onChange,
    formValues,
    handleAutoCompleteChange,
    handleAutoFourChange,
    Ajout_Terminer,
  }: any) {
    const uuid = useStoreUuid((state) => state.selectedId)
    const {souscategories} = useFetchAllSousCate(connect, uuid!)
    const { getClients } = useAllClients(uuid!);
    const fournisseurs = getClients.filter(info => info.role == 2 || info.role == 3);
   
    return (
      <form onSubmit={onSubmit}>
        <Stack spacing={2} margin={2}>
        <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={fournisseurs}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
            onChange={handleAutoFourChange}
            renderInput={(params) => <TextField {...params}
                            name='client_id' 
                            value={formValues.client_id}
                            onChange={onChange} 
                            label="Fournisseur"
                            
                        />}
            
            />
          <Autocomplete
            id="categorie_slug"
            freeSolo
            options={souscategories}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.libelle || '')}
            onChange={handleAutoCompleteChange}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Categorie"

                sx={{
                  "& .MuiFormLabel-asterisk": { color: "red" },
                }}
              />
            )}
          />

          <MyTextField 
            label={"libelle"}
            value={formValues.libelle}
            name={"libelle"}
            onChange={onChange}
          />
  
          <MyTextField required
            variant="outlined" 
            type='date' 
            label="Date" 
            name='date'
            value={formValues.date}
            onChange={onChange}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red", // Personnalise la couleur de l'étoile en rouge
              },
            }}
          />
          <Typography variant="h6" className='mx-2'>
            Quantite <QuantityLimitsIcon color="error" fontSize='small' />
          </Typography>
          <MyTextField required
            variant="outlined" 
            type='number'
            name='qte' 
            value={formValues.qte}
            onChange={onChange}
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red", // Personnalise la couleur de l'étoile en rouge
              },
            }}
          />
          <Typography variant="h6" className='mx-2'>
            Prix Unitaire <LocalAtmIcon color="error" fontSize='small' />
          </Typography>
          <MyTextField required
            variant="outlined" 
            type='number'
            name='pu' 
            value={formValues.pu}
            onChange={onChange}
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red", // Personnalise la couleur de l'étoile en rouge
              },
            }}
          />
          {/* Autres champs ici */}
          <FormControlLabel
            control={<Checkbox 
              onChange={Ajout_Terminer} // Appelle la fonction Ajout_Terminer lors du changement
            />
            }
            label="Ajouter aux derniers stocks ?"
            labelPlacement="end"
            onClick={Ajout_Terminer}
            
          />
          <Button type="submit" color="success" variant="outlined">Envoyer</Button>
        </Stack>
      </form>
    );
  }

 export function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }