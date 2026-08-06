import React, { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import MyTextField from "../_components/Input/MyTextField";
import { useFetchAllSousCate } from "./fonction.categorie";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAppSettings } from "../themes/AppSettingsContext";
import { useAllClients, useFetchUser } from "./fonction.user";
import { useStoreUuid } from "./store";

/* ── Types ─────────────────────────────────────────────────── */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AjoutEntreFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  formValues: Record<string, any>;
  handleAutoCompleteChange?: (event: any, value: any) => void;
  handleAutoFourChange?: (event: any, value: any) => void;
  Ajout_Terminer?: () => void;
  Is_Sortie?: () => void;
  Is_Prix?: () => void;
}

interface StatCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon: React.ReactNode;
  backgroundColor?: string;
}

/* ── Hook Form Values ───────────────────────────────────────── */
export function useFormValues<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  return [values, handleChange, setValues] as const;
}

/* ── Formulaire Ajout Entrée Stock ─────────────────────────── */
export function AjoutEntreForm({
  onSubmit,
  onChange,
  formValues,
  handleAutoCompleteChange,
  handleAutoFourChange,
  Ajout_Terminer,
  Is_Sortie,
  Is_Prix,
}: AjoutEntreFormProps) {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { souscategories } = useFetchAllSousCate(uuid!);
  const { unUser } = useFetchUser();
  const { getClients } = useAllClients(uuid!);

  const fournisseurs = getClients.filter((info: any) => info.role === 2 || info.role === 3);

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2} margin={2}>
        {handleAutoFourChange && (
          <Autocomplete
            id="fournisseur-select"
            freeSolo
            options={fournisseurs}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
            onChange={handleAutoFourChange}
            renderInput={(params) => (
              <TextField
                {...params}
                name="client_id"
                onChange={onChange}
                label="Fournisseur"
              />
            )}
          />
        )}

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
                "& .MuiFormLabel-asterisk": { color: "error.main" },
              }}
            />
          )}
        />

        <MyTextField
          label="Libellé / Référence"
          value={formValues.libelle || ''}
          name="libelle"
          onChange={onChange}
        />

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
                "& .MuiFormLabel-asterisk": { color: "error.main" },
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
          value={formValues.qte || ''}
          onChange={onChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon color="error" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiFormLabel-asterisk": { color: "error.main" },
          }}
        />

        <MyTextField
          required
          variant="outlined"
          type="number"
          label="Prix Unitaire (prix de vente)"
          inputProps={{
            step: "0.01",
            min: "0",
            max: "9999999999.99",
          }}
          name="pu"
          onChange={onChange}
          value={formValues.pu || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalAtmIcon color="error" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiFormLabel-asterisk": { color: "error.main" },
          }}
        />

        {unUser?.role === 1 && (
          <MyTextField
            variant="outlined"
            type="number"
            inputProps={{
              step: "0.01",
              min: "0",
              max: "9999999999.99",
            }}
            label="Prix Unitaire (prix d'achat)"
            name="pu_achat"
            onChange={onChange}
            value={formValues.pu_achat || ''}
          />
        )}

        <MyTextField
          variant="outlined"
          type="number"
          label="Quantité critique"
          name="qte_critique"
          value={formValues.qte_critique || ''}
          onChange={onChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon color="primary" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {Is_Prix && (
          <FormControlLabel
            control={<Checkbox onChange={Is_Prix} />}
            label="Prix de vente (Manuel)"
            labelPlacement="end"
          />
        )}

        {Ajout_Terminer && (
          <FormControlLabel
            control={<Checkbox onChange={Ajout_Terminer} />}
            label="Ajouter aux derniers stocks ?"
            labelPlacement="end"
          />
        )}

        {Is_Sortie && (
          <FormControlLabel
            control={<Checkbox onChange={Is_Sortie} />}
            label="Ne pas effectuer de sortie pour ce produit ?"
            labelPlacement="end"
          />
        )}

        <Button type="submit" color="success" variant="outlined" sx={{ mt: 1 }}>
          Envoyer
        </Button>
      </Stack>
    </form>
  );
}

/* ── Panel d'onglets ─────────────────────────────────────────── */
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

/* ── Carte de Statistique ────────────────────────────────────── */
export function StatCard({
  title,
  description,
  value,
  icon,
}: StatCardProps) {
  const { showBackground } = useAppSettings();

  return (
    <Card 
      elevation={0}
      className="mobile-glass"
      sx={{ 
        borderRadius: '20px', 
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
      <CardContent
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          '&:last-child': { pb: { xs: 2, sm: 2.5 } },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
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
            color: showBackground ? 'rgba(255,255,255,0.85)' : 'text.secondary',
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
            color: showBackground ? '#ffffff' : 'text.primary',
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
              color: showBackground ? 'rgba(255,255,255,0.75)' : 'text.secondary',
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