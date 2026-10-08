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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import MyTextField from "../_components/Input/MyTextField";
import { useFetchAllSousCate } from "./fonction.categorie";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import BarcodeScanner from "../_components/Input/BarcodeScanner";
import { useAppSettings } from "../themes/AppSettingsContext";
import { useAllClients, useFetchUser } from "./fonction.user";
import { useStoreUuid } from "./store";
import { formatNumberWithSpaces } from "./fonctionPerso";

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

  const [openScanner, setOpenScanner] = useState(false);

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

        <MyTextField
          label="Code-barres / QR Code (Optionnel)"
          value={formValues.barcode_value || ''}
          name="barcode_value"
          onChange={onChange}
          placeholder="Laisser vide pour générer un QR automatiquement"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QrCode2Icon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  color="primary"
                  title="Scanner le code"
                  onClick={() => setOpenScanner(true)}
                  edge="end"
                >
                  <QrCode2Icon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Dialog open={openScanner} onClose={() => setOpenScanner(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Scanner le code du produit</span>
            <IconButton onClick={() => setOpenScanner(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <BarcodeScanner
              onScan={(scanned) => {
                onChange({ target: { name: 'barcode_value', value: scanned } } as any);
                setOpenScanner(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Autocomplete
          id="unite"
          options={['pièce', 'carton', 'paquet', 'sac', 'boîte', 'bouteille', 'kilos', 'litre', 'mètres', 'lot']}
          value={formValues.unite || 'pièce'}
          onChange={(_event, value) => {
            onChange({ target: { name: 'unite', value: value || 'pièce' } } as any);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Unité de mesure"
              placeholder="ex: pièce, carton..."
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
          label="Quantité reçue"
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
          label="Prix Unitaire (prix de vente au client)"
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
            label="Prix Unitaire (prix d'achat fournisseur)"
            name="pu_achat"
            onChange={onChange}
            value={formValues.pu_achat || ''}
          />
        )}

        {/* ── APERÇU RENTABILITÉ & TOTAUX EN TEMPS RÉEL ── */}
        {(() => {
          const pv = Number(formValues.pu) || 0;
          const pa = Number(formValues.pu_achat) || 0;
          const qte = Number(formValues.qte) || 0;
          const hasPV = pv > 0;
          const hasPA = unUser?.role === 1 && pa > 0;

          if (!hasPV && !hasPA && qte === 0) return null;

          const margeUnit = pv - pa;
          const margePct = pv > 0 ? ((margeUnit / pv) * 100).toFixed(1) : '0';
          const totalVente = qte * pv;
          const totalAchat = qte * pa;

          return (
            <Box
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Aperçu financier de ce lot
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                {qte > 0 && hasPV && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Valeur de vente totale
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>
                      {formatNumberWithSpaces(totalVente)} F
                    </Typography>
                  </Box>
                )}

                {qte > 0 && hasPA && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Coût d'achat total
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b' }}>
                      {formatNumberWithSpaces(totalAchat)} F
                    </Typography>
                  </Box>
                )}

                {hasPV && hasPA && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Marge bénéficiaire unitaire
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: margeUnit >= 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {margeUnit >= 0 ? `+${formatNumberWithSpaces(margeUnit)} F` : `${formatNumberWithSpaces(margeUnit)} F`} ({margePct}%)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })()}

        <MyTextField
          variant="outlined"
          type="number"
          label="Quantité critique (seuil d'alerte)"
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
            label="Prix de vente modifiable librement en caisse"
            labelPlacement="end"
          />
        )}

        {Ajout_Terminer && (
          <FormControlLabel
            control={<Checkbox onChange={Ajout_Terminer} />}
            label="Cumuler cette quantité avec le stock existant (au lieu d'un nouveau lot)"
            labelPlacement="end"
          />
        )}

        {Is_Sortie && (
          <FormControlLabel
            control={<Checkbox onChange={Is_Sortie} />}
            label="Masquer ce produit de la vente directe en caisse"
            labelPlacement="end"
          />
        )}

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 1.5,
            py: 1.2,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669, #047857)',
            },
          }}
        >
          Enregistrer l'Entrée
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