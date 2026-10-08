import {
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  Box,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  useTheme,
} from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeleteFacEntre, useFacEntre, useUpdateFacEntre } from '../../../../usePerso/fonction.facture';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { BASE } from '../../../../_services/caller.service';
import PdfViewer from '../../../../usePerso/PdfFile';
import { useFetchUser } from '../../../../usePerso/fonction.user';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

export default function ModifProduitEntre() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { unFacEntre, setUnFacEntre } = useFacEntre(uuid!);
  const { deleteFacEntre } = useDeleteFacEntre();
  const { updateFacEntre } = useUpdateFacEntre();
  const { unUser } = useFetchUser();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [showConfirm, setShowConfirm] = useState(false);
  const user_id = unUser?.uuid || '';

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteFacEntre(unFacEntre);
    setShowConfirm(false);
  };

  if (unFacEntre) {
    unFacEntre["user_id"] = user_id;
  }

  const url = BASE(unFacEntre.facture ? unFacEntre.facture : '');

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnFacEntre({
      ...unFacEntre,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unFacEntre["user_id"] = user_id;
    unFacEntre["facture"] = image;
    updateFacEntre(unFacEntre);
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 4 }, spaceY: 3 }}>
      {/* Bouton retour */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/entreprise/produit/entre')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#64748b',
            '&:hover': {
              color: isDark ? '#f1f5f9' : '#0f172a',
            },
          }}
        >
          Retour aux factures d'achat
        </Button>
      </Box>

      {/* Modal confirmation suppression */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
            backdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <DialogTitle className="flex items-center space-x-3 text-red-500">
          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <WarningAmberRoundedIcon />
          </Avatar>
          <Typography variant="h6" className="font-bold" sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            Supprimer la facture d'achat
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.95rem', mt: 1 }}>
            Êtes-vous sûr de vouloir supprimer cette facture ({unFacEntre?.libelle || unFacEntre?.ref}) ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowConfirm(false)}
            sx={{ textTransform: 'none', borderRadius: '12px' }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ textTransform: 'none', borderRadius: '12px', fontWeight: 600 }}
          >
            Confirmer la suppression
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire & Prévisualisation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.35)' : '0 8px 30px rgba(0, 0, 0, 0.04)',
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)', pb: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Modifier la Facture d'Entrée / Achat
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
            Consultez les informations de la pièce fournisseur et mettez à jour le document rattaché.
          </Typography>
        </Box>

        <form onSubmit={onSubmit}>
          <Grid container spacing={4}>
            {/* Colonne de gauche : Champs du formulaire */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Libellé de la facture"
                  name="libelle"
                  value={unFacEntre.libelle || ''}
                  onChange={onChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon sx={{ color: '#a855f7' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Référence du document fournisseur"
                  name="ref"
                  value={unFacEntre.ref || ''}
                  onChange={onChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptIcon sx={{ color: '#3b82f6' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Date de la facture"
                  name="date"
                  type="date"
                  value={unFacEntre.date || ''}
                  onChange={onChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon sx={{ color: '#10b981' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    border: '1px dashed',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDark ? '#e2e8f0' : '#334155' }}>
                    Remplacer la pièce jointe fournisseur
                  </Typography>
                  <TextField
                    fullWidth
                    type="file"
                    onChange={handleImageChange}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  {image && (
                    <Typography variant="caption" sx={{ color: '#10b981', mt: 1, display: 'block', fontWeight: 600 }}>
                      Nouveau fichier sélectionné : {image.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Colonne de droite : Aperçu de la pièce jointe */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
                  p: 2.5,
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon sx={{ fontSize: 18, color: '#a855f7' }} />
                    Document fournisseur rattaché
                  </Typography>

                  {unFacEntre.facture && (
                    <Button
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                    >
                      Ouvrir en grand
                    </Button>
                  )}
                </Box>

                {unFacEntre.facture ? (
                  <Box sx={{ flex: 1, overflow: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <PdfViewer fileUrl={url} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDark ? '#64748b' : '#94a3b8',
                      gap: 1,
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 40 }} />
                    <Typography variant="body2">Aucun document rattaché à cette facture</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)' }} />

          {/* Boutons d'action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {unUser?.role === 1 ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleDelete}
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  },
                }}
              >
                Supprimer la facture
              </Button>
            ) : <Box />}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/entreprise/produit/entre')}
                sx={{ textTransform: 'none', borderRadius: '12px' }}
              >
                Annuler
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                }}
              >
                Enregistrer les modifications
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
