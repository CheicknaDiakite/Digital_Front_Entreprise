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
  Chip,
  LinearProgress,
  Tooltip,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MyTextField from "../_components/Input/MyTextField";
import {
  useFetchAllSousCate,
  useCategoriesEntreprise,
  useCreateSousCate,
  useCreateCategorie,
} from "./fonction.categorie";
import { useQueryClient } from "@tanstack/react-query";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import BarcodeScanner from "../_components/Input/BarcodeScanner";
import { useAppSettings } from "../themes/AppSettingsContext";
import { useAllClients, useFetchUser } from "./fonction.user";
import { useStoreUuid } from "./store";
import { formatNumberWithSpaces } from "./fonctionPerso";
import toast from 'react-hot-toast';

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
  const { cateEntreprises } = useCategoriesEntreprise(uuid!);
  const { ajoutSousCateAsync } = useCreateSousCate();
  const { ajoutCategorieAsync } = useCreateCategorie();
  const queryClient = useQueryClient();

  const { unUser } = useFetchUser();
  const { getClients } = useAllClients(uuid!);

  const fournisseurs = getClients.filter((info: any) => info.role === 2 || info.role === 3);

  const [openScanner, setOpenScanner] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // ── État pour l'ajout rapide de produit (+) ──
  const [openNewProductModal, setOpenNewProductModal] = useState(false);
  const [newProductLibelle, setNewProductLibelle] = useState('');
  const [selectedCatSlug, setSelectedCatSlug] = useState('');
  const [newCatName, setNewCatName] = useState('Général');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [justCreatedProduct, setJustCreatedProduct] = useState<{ uuid: string; libelle: string } | null>(null);

  // Combinaison des options avec le produit créé récemment (instantané sans attendre le refetch)
  const allProductOptions = React.useMemo(() => {
    const list = [...(souscategories || [])];
    if (justCreatedProduct && !list.some((item: any) => item.uuid === justCreatedProduct.uuid)) {
      list.unshift(justCreatedProduct as any);
    }
    return list;
  }, [souscategories, justCreatedProduct]);

  // ── Validation en direct des 3 champs obligatoires ──
  const isProductSelected = Boolean(
    formValues.categorie_slug && String(formValues.categorie_slug).trim() !== ''
  );
  const qteNum = Number(formValues.qte);
  const isQteValid =
    formValues.qte !== '' &&
    formValues.qte !== undefined &&
    formValues.qte !== null &&
    !isNaN(qteNum) &&
    qteNum > 0;

  const puNum = Number(formValues.pu);
  const isPuValid =
    formValues.pu !== '' &&
    formValues.pu !== undefined &&
    formValues.pu !== null &&
    !isNaN(puNum) &&
    puNum > 0;

  const allRequiredValid = isProductSelected && isQteValid && isPuValid;
  const completedCount = (isProductSelected ? 1 : 0) + (isQteValid ? 1 : 0) + (isPuValid ? 1 : 0);
  const progressPercent = Math.round((completedCount / 3) * 100);

  // Objet sous-catégorie sélectionné
  const selectedSousCate = allProductOptions.find(
    (sc: any) => sc.uuid === formValues.categorie_slug
  ) || null;

  // Création rapide d'un produit depuis le bouton (+)
  const handleQuickCreateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanLibelle = newProductLibelle.trim();
    if (!cleanLibelle) {
      toast.error("Veuillez saisir le nom du produit.");
      return;
    }

    setIsCreatingProduct(true);
    try {
      let targetCatSlug = selectedCatSlug;

      // Résolution de la catégorie parente
      if (!targetCatSlug) {
        if (cateEntreprises && cateEntreprises.length > 0) {
          targetCatSlug = cateEntreprises[0].uuid || cateEntreprises[0].slug || String(cateEntreprises[0].id);
        } else {
          // Créer une catégorie initiale si aucune n'existe encore
          const catRes = await ajoutCategorieAsync({
            libelle: newCatName.trim() || 'Général',
            entreprise_id: uuid!,
            user_id: unUser?.uuid || '',
          });
          targetCatSlug = catRes?.uuid || catRes?.slug || catRes?.id || 'general';
          await queryClient.invalidateQueries({ queryKey: ["enRecup"] });
        }
      }

      const formData = new FormData();
      formData.append('libelle', cleanLibelle);
      formData.append('categorie_slug', targetCatSlug);
      formData.append('user_id', unUser?.uuid || '');

      const res = await ajoutSousCateAsync(formData as any);
      const newUuid = res?.uuid || res?.id || (res?.donnee && (res.donnee.uuid || res.donnee.id));

      const createdItem = {
        uuid: String(newUuid),
        libelle: cleanLibelle,
      };

      setJustCreatedProduct(createdItem);

      // Met à jour immédiatement le formulaire d'entrée avec le nouveau produit créé !
      if (handleAutoCompleteChange) {
        handleAutoCompleteChange(null as any, createdItem);
      }

      await queryClient.invalidateQueries({ queryKey: ["SouCategorie"] });

      toast.success(`Produit « ${cleanLibelle} » créé et sélectionné !`, {
        icon: '✨',
        duration: 4000,
      });

      setNewProductLibelle('');
      setOpenNewProductModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la création du produit.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setAttemptedSubmit(true);
    if (!allRequiredValid) {
      e.preventDefault();
      e.stopPropagation();
      const manquants: string[] = [];
      if (!isProductSelected) manquants.push("1. Nom du produit");
      if (!isQteValid) manquants.push("2. Quantité reçue (> 0)");
      if (!isPuValid) manquants.push("3. Prix de vente au client (> 0)");

      toast.error(
        `Veuillez remplir les 3 champs obligatoires : ${manquants.join(", ")}`,
        { id: 'stock-entry-required-error', duration: 4500 }
      );
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Stack spacing={2.5} margin={{ xs: 1, sm: 2 }}>
        
        {/* ── BANNIÈRE VISUELLE : 3 INFORMATIONS OBLIGATOIRES ── */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: allRequiredValid
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1.5px solid',
            borderColor: allRequiredValid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            boxShadow: allRequiredValid
              ? '0 4px 16px rgba(16, 185, 129, 0.15)'
              : '0 4px 14px rgba(245, 158, 11, 0.12)',
            transition: 'all 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: allRequiredValid ? '#059669' : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  fontSize: { xs: '0.78rem', sm: '0.85rem' },
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {allRequiredValid ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                    3/3 Champs obligatoires validés
                  </>
                ) : (
                  <>
                    <PriorityHighIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                    3 Champs obligatoires requis
                  </>
                )}
              </Typography>
            </Box>

            <Chip
              size="small"
              label={`${completedCount}/3 ${allRequiredValid ? 'Prêt !' : 'Requis'}`}
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                bgcolor: allRequiredValid ? '#10b981' : '#f59e0b',
                color: '#ffffff',
                borderRadius: '8px',
                boxShadow: allRequiredValid ? '0 2px 8px rgba(16,185,129,0.4)' : '0 2px 8px rgba(245,158,11,0.3)',
              }}
            />
          </Box>

          {/* Barre de progression fluide */}
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 7,
              borderRadius: 4,
              mb: 1.5,
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: allRequiredValid
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                transition: 'transform 0.4s ease',
              },
            }}
          />

          {/* Les 3 piliers avec feedback visuel direct */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {/* 1. Produit */}
            <Box
              sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                bgcolor: isProductSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid',
                borderColor: isProductSelected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {isProductSelected ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
              ) : (
                <PriorityHighIcon sx={{ fontSize: 18, color: '#ef4444', flexShrink: 0 }} />
              )}
              <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: isProductSelected ? '#047857' : '#b91c1c', fontSize: '0.72rem' }}>
                  1. Nom Produit *
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '0.72rem' }}>
                  {selectedSousCate ? selectedSousCate.libelle : 'À sélectionner'}
                </Typography>
              </Box>
            </Box>

            {/* 2. Quantité */}
            <Box
              sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                bgcolor: isQteValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid',
                borderColor: isQteValid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {isQteValid ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
              ) : (
                <PriorityHighIcon sx={{ fontSize: 18, color: '#ef4444', flexShrink: 0 }} />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: isQteValid ? '#047857' : '#b91c1c', fontSize: '0.72rem' }}>
                  2. Quantité *
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem' }}>
                  {isQteValid ? `${qteNum} ${formValues.unite || 'unité(s)'}` : '> 0 requise'}
                </Typography>
              </Box>
            </Box>

            {/* 3. Prix de Vente */}
            <Box
              sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                bgcolor: isPuValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid',
                borderColor: isPuValid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {isPuValid ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
              ) : (
                <PriorityHighIcon sx={{ fontSize: 18, color: '#ef4444', flexShrink: 0 }} />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: isPuValid ? '#047857' : '#b91c1c', fontSize: '0.72rem' }}>
                  3. Prix Vente Client *
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem' }}>
                  {isPuValid ? `${formatNumberWithSpaces(puNum)} F` : '> 0 requis'}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {handleAutoFourChange && (
          <Autocomplete
            id="fournisseur-select"
            options={fournisseurs}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
            onChange={handleAutoFourChange}
            renderInput={(params) => (
              <TextField
                {...params}
                name="client_id"
                onChange={onChange}
                label="Fournisseur (Optionnel)"
                placeholder="Sélectionner le fournisseur"
              />
            )}
          />
        )}

        {/* ── CHAMP OBLIGATOIRE 1 : NOM DU PRODUIT AVEC BOUTON (+) RAPIDE ── */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Autocomplete
              id="categorie_slug"
              options={allProductOptions}
              value={selectedSousCate}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.libelle || '')}
              isOptionEqualToValue={(option, val) => option.uuid === val.uuid}
              onChange={(event, val) => {
                if (handleAutoCompleteChange) {
                  handleAutoCompleteChange(event, val);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="1. Nom du produit * (OBLIGATOIRE)"
                  placeholder="Sélectionnez un produit ou cliquez sur (+) pour créer..."
                  error={attemptedSubmit && !isProductSelected}
                  helperText={
                    isProductSelected
                      ? "✓ Produit sélectionné avec succès"
                      : attemptedSubmit
                      ? "⚠️ Ce champ est obligatoire : choisissez un produit ou cliquez sur (+)"
                      : "Sélectionnez le produit dans la liste, ou cliquez sur (+) pour en créer un nouveau"
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: isProductSelected ? '#10b981 !important' : attemptedSubmit ? '#ef4444 !important' : undefined,
                      fontWeight: isProductSelected || attemptedSubmit ? 700 : 400,
                      fontSize: '0.78rem',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <ShoppingBagIcon
                            sx={{
                              color: isProductSelected ? '#10b981' : attemptedSubmit ? '#ef4444' : '#6366f1',
                              transition: 'color 0.2s',
                            }}
                          />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: '12px',
                      bgcolor: isProductSelected ? 'rgba(16, 185, 129, 0.04)' : undefined,
                      borderColor: isProductSelected ? '#10b981' : undefined,
                    },
                    "& .MuiFormLabel-asterisk": { color: "#ef4444", fontWeight: 900 },
                  }}
                />
              )}
            />
          </Box>

          {/* Bouton (+) pour créer un nouveau produit sans sortir */}
          <Tooltip title="Nouveau produit : créer sans quitter ce formulaire" arrow placement="top">
            <Button
              type="button"
              variant="contained"
              onClick={() => setOpenNewProductModal(true)}
              aria-label="Créer un nouveau produit"
              sx={{
                minWidth: { xs: '46px', sm: '52px' },
                width: { xs: '46px', sm: '52px' },
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                p: 0,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                  transform: 'scale(1.04)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <AddIcon sx={{ fontSize: { xs: 26, sm: 30 }, color: '#ffffff' }} />
            </Button>
          </Tooltip>
        </Box>

        <MyTextField
          label="Libellé / Référence du lot"
          value={formValues.libelle || ''}
          name="libelle"
          onChange={onChange}
          placeholder="Ex: Arrivage du jour, Lot B-104..."
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
          freeSolo
          options={['unité', 'pièce', 'carton', 'paquet', 'sac', 'boîte', 'bouteille', 'kilos', 'litre', 'mètres', 'lot']}
          value={formValues.unite || 'unité'}
          onChange={(_event, value) => {
            const val = value?.trim().toLowerCase() === 'unite' ? 'unité' : (value || 'unité');
            onChange({ target: { name: 'unite', value: val } } as any);
          }}
          onInputChange={(_event, newInputValue, reason) => {
            if (reason === 'input' && newInputValue) {
              const val = newInputValue.trim().toLowerCase() === 'unite' ? 'unité' : newInputValue;
              onChange({ target: { name: 'unite', value: val } } as any);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Unité de mesure"
              placeholder="ex: unité, pièce, carton..."
            />
          )}
        />

        {/* ── CHAMP OBLIGATOIRE 2 : QUANTITÉ REÇUE ── */}
        <MyTextField
          required
          variant="outlined"
          type="number"
          label="2. Quantité reçue * (OBLIGATOIRE)"
          name="qte"
          inputProps={{
            step: "0.01",
            min: "0.01",
          }}
          value={formValues.qte ?? ''}
          onChange={onChange}
          error={attemptedSubmit && !isQteValid}
          helperText={
            isQteValid
              ? `✓ Quantité valide : ${qteNum} ${formValues.unite || 'unité(s)'}`
              : attemptedSubmit
              ? "⚠️ Quantité obligatoire : doit être strictement supérieure à 0"
              : "Indiquez la quantité de stock reçue (supérieure à 0)"
          }
          FormHelperTextProps={{
            sx: {
              color: isQteValid ? '#10b981 !important' : attemptedSubmit ? '#ef4444 !important' : undefined,
              fontWeight: isQteValid || attemptedSubmit ? 700 : 400,
              fontSize: '0.78rem',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon
                  sx={{
                    color: isQteValid ? '#10b981' : attemptedSubmit ? '#ef4444' : '#6366f1',
                    transition: 'color 0.2s',
                  }}
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: '12px',
              bgcolor: isQteValid ? 'rgba(16, 185, 129, 0.04)' : undefined,
              borderColor: isQteValid ? '#10b981' : undefined,
            },
            "& .MuiFormLabel-asterisk": { color: "#ef4444", fontWeight: 900 },
          }}
        />

        {/* ── CHAMP OBLIGATOIRE 3 : PRIX DE VENTE CLIENT ── */}
        <MyTextField
          required
          variant="outlined"
          type="number"
          label="3. Prix Unitaire (prix de vente au client) * (OBLIGATOIRE)"
          inputProps={{
            step: "0.01",
            min: "0.01",
            max: "9999999999.99",
          }}
          name="pu"
          onChange={onChange}
          value={formValues.pu ?? ''}
          error={attemptedSubmit && !isPuValid}
          helperText={
            isPuValid
              ? `✓ Prix de vente client défini : ${formatNumberWithSpaces(puNum)} F`
              : attemptedSubmit
              ? "⚠️ Prix de vente obligatoire : doit être strictement supérieur à 0"
              : "Prix auquel ce produit sera vendu aux clients en magasin"
          }
          FormHelperTextProps={{
            sx: {
              color: isPuValid ? '#10b981 !important' : attemptedSubmit ? '#ef4444 !important' : undefined,
              fontWeight: isPuValid || attemptedSubmit ? 700 : 400,
              fontSize: '0.78rem',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalAtmIcon
                  sx={{
                    color: isPuValid ? '#10b981' : attemptedSubmit ? '#ef4444' : '#6366f1',
                    transition: 'color 0.2s',
                  }}
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: '12px',
              bgcolor: isPuValid ? 'rgba(16, 185, 129, 0.04)' : undefined,
              borderColor: isPuValid ? '#10b981' : undefined,
            },
            "& .MuiFormLabel-asterisk": { color: "#ef4444", fontWeight: 900 },
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
            label="Prix Unitaire (prix d'achat fournisseur - Optionnel)"
            name="pu_achat"
            onChange={onChange}
            value={formValues.pu_achat || ''}
            helperText="Pour calculer automatiquement votre marge et rentabilité"
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

        {/* ── BOUTON ENREGISTRER DYNAMIQUE ET RÉACTIF ── */}
        <Button
          type="submit"
          variant="contained"
          startIcon={allRequiredValid ? <CheckCircleIcon /> : <PriorityHighIcon />}
          sx={{
            mt: 2,
            py: 1.4,
            borderRadius: '14px',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.96rem',
            background: allRequiredValid
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: allRequiredValid
              ? '0 4px 16px rgba(16, 185, 129, 0.4)'
              : '0 4px 14px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: allRequiredValid
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #d97706, #b45309)',
            },
          }}
        >
          {allRequiredValid
            ? "✓ Enregistrer l'Entrée en Stock"
            : `Enregistrer (${completedCount}/3 obligatoire${completedCount > 1 ? 's' : ''})`}
        </Button>
      </Stack>

      {/* ── MODALE CRÉATION RAPIDE DE PRODUIT (+) ── */}
      <Dialog
        open={openNewProductModal}
        onClose={() => !isCreatingProduct && setOpenNewProductModal(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            py: 1.8,
            px: 2.5,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <ShoppingBagIcon sx={{ fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
              Nouveau Produit Rapide
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setOpenNewProductModal(false)}
            disabled={isCreatingProduct}
            sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.84rem' }}>
            Créez un produit instantanément sans quitter votre formulaire. Il sera automatiquement sélectionné dès sa création.
          </Typography>

          <Stack spacing={2.2}>
            <TextField
              autoFocus
              required
              label="Désignation / Nom du produit *"
              placeholder="Ex: Savon Liquide 500ml, Huile Dinor 1L..."
              value={newProductLibelle}
              onChange={(e) => setNewProductLibelle(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickCreateProduct();
                }
              }}
            />

            {cateEntreprises && cateEntreprises.length > 0 ? (
              <TextField
                select
                label="Catégorie parente *"
                value={selectedCatSlug || (cateEntreprises[0]?.uuid || '')}
                onChange={(e) => setSelectedCatSlug(e.target.value)}
                fullWidth
                size="small"
                helperText="Catégorie dans laquelle ranger ce produit"
              >
                {cateEntreprises.map((cat: any) => (
                  <MenuItem key={cat.uuid || cat.id} value={cat.uuid || cat.slug || String(cat.id)}>
                    {cat.libelle}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Catégorie initiale *"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Général, Alimentation..."
                fullWidth
                size="small"
                helperText="Une catégorie sera automatiquement créée pour ce produit"
              />
            )}

            <Button
              type="button"
              variant="contained"
              fullWidth
              disabled={isCreatingProduct || !newProductLibelle.trim()}
              onClick={handleQuickCreateProduct}
              startIcon={isCreatingProduct ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              sx={{
                mt: 1,
                py: 1.3,
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                },
              }}
            >
              {isCreatingProduct ? "Création en cours..." : "Créer et Sélectionner"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
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