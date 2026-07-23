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
      elevation={0}
      className={`relative p-4 rounded-lg transition-all duration-200 hover:shadow-md border-x-2 animate-border-rotate mobile-shadow-card mobile-hover-effect mobile-glass`}

      sx={{ 
        borderRadius: '20px', 
        // bgcolor: backgroundColor || 'rgba(255, 255, 255, 0.04)',
        // backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        '&:hover': {
          transform: 'translateY(-4px)',
          bgcolor: 'rgba(255, 255, 255, 0.07)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 2.5 }, 
        '&:last-child': { pb: { xs: 2, sm: 2.5 } },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
      }}>
        <Box 
          sx={{ 
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 1.5,
            transition: 'transform 0.3s ease',
            '& > svg': {
              fontSize: '1.6rem'
            }
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '0.78rem', sm: '0.875rem' },
            color: '#94a3b8',
            lineHeight: 1.3,
            mb: 0.8,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            fontSize: { xs: '1.25rem', sm: '1.6rem' },
            color: '#e0e7ff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        {description && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 0.8,
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 500
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}