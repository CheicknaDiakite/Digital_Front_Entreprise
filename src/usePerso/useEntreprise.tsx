import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Stack, TextField, InputAdornment, Card, CardContent, Typography } from "@mui/material";
import MyTextField from "../_components/Input/MyTextField";
import { useFetchAllSousCate } from "./fonction.categorie";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useState } from "react";
import { useAllClients, useFetchUser } from "./fonction.user";
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
  Is_Sortie,
  Is_Prix
}: any) {
  const uuid = useStoreUuid((state) => state.selectedId)
  const { souscategories } = useFetchAllSousCate(uuid!)
  const { unUser } = useFetchUser()
  const { getClients } = useAllClients(uuid!);
  const fournisseurs = getClients.filter(info => info.role == 2 || info.role == 3);

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2} margin={2}>
        {handleAutoFourChange &&
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={fournisseurs}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
            onChange={handleAutoFourChange}
            renderInput={(params) => <TextField {...params}
              name='client_id'
              onChange={onChange}
              label="Fournisseur"

            />}

          />
        }
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
              label="Nom du produit"

              sx={{
                "& .MuiFormLabel-asterisk": { color: "red" },
              }}
            />
          )}
        />

        <MyTextField
          label={"libelle / ref"}
          value={formValues.libelle}
          name={"libelle"}
          onChange={onChange}
        />

        {/* <MyTextField 
            variant="outlined" 
            type='date' 
            label="Date de livraison" 
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
          /> */}

        <Autocomplete
          id="unite"
          options={['litre', 'kilos', 'mètres']}
          value={formValues.unite || 'kilos'}
          onChange={(_event, value) => {
            onChange({ target: { name: 'unite', value: value || 'kilos' } } as any);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Unité"
              sx={{
                "& .MuiFormLabel-asterisk": { color: "red" },
              }}
            />
          )}
        />

        <MyTextField
          required
          variant="outlined"
          type="number"
          label="Quantité"
          name="qte"
          inputProps={{
            step: "0.01",
            min: "0",
          }}
          value={formValues.qte}
          onChange={onChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon color="error" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "red", // Personnalise la couleur de l'étoile en rouge
            },
          }}
        />
        <MyTextField
          required
          variant="outlined"
          type="number"
          label="Prix Unitaire (prix de vente)"
          inputProps={{
            step: "0.01", // Décimales à deux chiffres
            min: "0", // Pas de valeurs négatives
            max: "9999999999.99", // Correspond à max_digits=10 dans Django
          }}
          name="pu"
          onChange={onChange}
          value={formValues.pu}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalAtmIcon color="error" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "red",
            },
          }}
        />
        {unUser.role === 1 &&
          <MyTextField
            variant="outlined"
            type="number"
            inputProps={{
              step: "0.01", // Décimales à deux chiffres
              min: "0", // Pas de valeurs négatives
              max: "9999999999.99", // Correspond à max_digits=10 dans Django
            }}
            label="Prix Unitaire (prix d'achat)"
            name="pu_achat"
            onChange={onChange}
            value={formValues.pu_achat}
          />
        }

        <MyTextField
          variant="outlined"
          type="number"
          label="Quantité critique"
          name="qte_critique"
          value={formValues.qte_critique}
          onChange={onChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon color="primary" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "primary",
            },
          }}
        />

        {/* Autres champs ici */}
        <FormControlLabel
          control={<Checkbox
            onChange={Is_Prix} // Appelle la fonction Ajout_Terminer lors du changement
          />
          }
          label="Prix de vente (Manuelle)"
          labelPlacement="end"
          onClick={Is_Prix}
        />

        <FormControlLabel
          control={<Checkbox
            onChange={Ajout_Terminer} // Appelle la fonction Ajout_Terminer lors du changement
          />
          }
          label="Ajouter aux derniers stocks ?"
          labelPlacement="end"
          onClick={Ajout_Terminer}
        />

        <FormControlLabel
          control={<Checkbox
            onChange={Is_Sortie} // Appelle la fonction Ajout_Terminer lors du changement
          />
          }
          label="Vous ne voulez pas sortir ce produit ?"
          labelPlacement="end"
          onClick={Is_Sortie}
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

export function StatCard({ title, description, value, icon, backgroundColor }: { title: string, description?: string, value: string | number, icon: React.ReactNode, backgroundColor?: string }) {
  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        bgcolor: backgroundColor || 'rgba(255, 255, 255, 0.9)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        aspectRatio: { xs: '1 / 1', sm: 'auto' },
        justifyContent: 'center',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}
    >
      <CardContent sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        '&:last-child': { pb: { xs: 1.5, sm: 2 } },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        width: '100%',
        flex: 1
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 0.5,
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'primary.main',
            transform: { xs: 'scale(0.9)', sm: 'scale(1)' }
          }}>
            {icon}
          </Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: 1.2,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="h5" 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: 'text.primary'
          }}
        >
          {value}
        </Typography>
        {description && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: 0.5,
              fontSize: '0.65rem',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}