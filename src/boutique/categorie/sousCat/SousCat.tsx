import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import CloseIcon from "@mui/icons-material/Close";
import Typography from '@mui/material/Typography';
import { 
  Alert, 
  Box, 
  Button, 
  Chip, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Skeleton, 
  TextField, 
  Paper, 
  Tooltip, 
  useTheme, 
  useMediaQuery, 
  Stack 
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { RecupType, RouteParams } from '../../../typescript/DataType';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import img from '../../../../public/icon-192x192.png';
import { useAllGetSousCate, useCreateSousCate, useFetchCategorie } from '../../../usePerso/fonction.categorie';
import MyTextField from '../../../_components/Input/MyTextField';
import { SousCategorieFormType } from '../../../typescript/FormType';
import { useStoreUuid } from '../../../usePerso/store';
import { useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import M_Abonnement from '../../../_components/Card/M_Abonnement';
import { useForm } from 'react-hook-form';
import './mobile-souscat.css';

export interface SousCategorie {
  libelle: string;
  all_inventaire: number;
  slug: string;
}

export interface CardSousCateProps {
  post: RecupType;
}

interface ShadowBoxProps {
  shadow: RecupType;
}

function ShadowBox({ shadow }: ShadowBoxProps) {
  const url = shadow.image ? BASE(shadow.image) : img;
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { unUser } = useFetchUser();
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const isDecouverteOwner = !unUser.role || unUser.role === 0 || unEntreprise?.proprietaire_id === unUser.id;
  const isOwner = unUser.role === 1 || isDecouverteOwner;
  const isManager = unUser.role === 2;
  const canManageStock = isOwner || isManager;

  const canViewInfo = canManageStock || (unEntreprise.licence_type !== "Stock Simple");

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 2.5 },
        borderRadius: '18px',
        background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        backdropFilter: 'blur(16px)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.45)' : '0 12px 28px rgba(99,102,241,0.12)',
          borderColor: '#6366f1',
        },
      }}
    >
      {/* Top Edit Button */}
      {canManageStock && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <Tooltip title="Modifier cette sous-catégorie">
            <Link to={`/categorie/sous/modif/${shadow.uuid}`}>
              <IconButton
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  color: isDark ? 'rgba(255,255,255,0.8)' : '#475569',
                  '&:hover': { bgcolor: 'primary.main', color: '#fff' },
                }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Link>
          </Tooltip>
        </Box>
      )}

      {/* Main Card Content */}
      {canViewInfo ? (
        <Link
          to={`/categorie/info/${shadow.uuid}`}
          style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}
        >
          <Box
            sx={{
              width: { xs: 64, sm: 84 },
              height: { xs: 64, sm: 84 },
              borderRadius: '16px',
              overflow: 'hidden',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.2,
              mb: 1.8,
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              transition: 'transform 0.25s ease',
              '&:hover': {
                transform: 'scale(1.04)',
              },
            }}
          >
            <img
              src={url}
              alt={shadow.libelle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: isDark ? '#ffffff' : 'text.primary',
              mb: 1.5,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              px: 0.5,
            }}
          >
            {shadow.libelle}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Chip
              size="small"
              icon={<BarChartIcon sx={{ fontSize: '13px !important' }} />}
              label="Infos & Statistiques"
              color="primary"
              variant="outlined"
              clickable
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderColor: 'rgba(99,102,241,0.3)',
                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  borderColor: 'transparent',
                },
              }}
            />
          </Box>
        </Link>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              width: { xs: 64, sm: 84 },
              height: { xs: 64, sm: 84 },
              borderRadius: '16px',
              overflow: 'hidden',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.2,
              mb: 1.8,
            }}
          >
            <img
              src={url}
              alt={shadow.libelle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: isDark ? '#ffffff' : 'text.primary',
            }}
          >
            {shadow.libelle}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default function SousCat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();
  
  const { uuid } = useParams<RouteParams>();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SousCategorieFormType>();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setValue('image', file as unknown as File, { shouldValidate: true });
    }
  };

  const { unCategorie } = useFetchCategorie(uuid!);
  const { getSousCates, isLoading, isError } = useAllGetSousCate(uuid!);
  const { ajoutSousCate } = useCreateSousCate();

  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset();
    setOpen(false);
  };

  const { unUser } = useFetchUser();
  const isDecouverteOwner = !unUser.role || unUser.role === 0 || unEntreprise?.proprietaire_id === unUser.id;
  const isOwner = unUser.role === 1 || isDecouverteOwner;
  const isManager = unUser.role === 2;
  const canManageStock = isOwner || isManager;

  const onSubmit = (data: SousCategorieFormType) => {
    const user_id = unUser?.uuid || '';
    data.categorie_slug = uuid || '';
    if (data.image instanceof File) {
      const form = new FormData();
      form.append('libelle', data.libelle || '');
      form.append('user_id', user_id);
      form.append('categorie_slug', data.categorie_slug || '');
      form.append('image', data.image as File);
      ajoutSousCate(form as any);
    } else {
      const payload = { ...data, user_id };
      ajoutSousCate(payload as any);
    }
    closeopen();
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '12px', mb: 3 }} />
        <Grid container spacing={isMobile ? 2 : 3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={isMobile ? 160 : 200} 
                sx={{ borderRadius: '18px' }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: '14px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        >
          Problème de connexion ! Impossible de charger les sous-catégories.
        </Alert>
      </Box>
    );
  }

  const safeSousCates = getSousCates || [];
  const filteredCategories = safeSousCates.filter((post) =>
    post.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        
        {/* Navigation Breadcrumb / Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/categorie')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              color: isDark ? '#ffffff' : 'text.primary',
              mb: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(99,102,241,0.08)',
              },
            }}
          >
            Retour au Catalogue Général
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: '20px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              backdropFilter: 'blur(20px)',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(99,102,241,0.06)',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.4rem', sm: '1.8rem' },
                        letterSpacing: '-0.02em',
                        color: isDark ? '#ffffff' : 'text.primary',
                        lineHeight: 1.2,
                      }}
                    >
                      {unCategorie?.libelle ? `Sous-catégories de : ${unCategorie.libelle}` : 'Gestion des sous-catégories'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                      Cliquez sur une sous-catégorie pour consulter ses <strong>statistiques de ventes, stocks et mouvements</strong>.
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Chip
                label={`${filteredCategories.length} sous-catégorie(s)`}
                color="primary"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  height: 28,
                  borderRadius: '10px',
                }}
              />
            </Stack>
          </Paper>
        </Box>

        {/* Toolbar: Search + Add */}
        <Box sx={{ mb: 3.5 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} sm={6} md={5}>
              <TextField
                placeholder="Rechercher une sous-catégorie..."
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(30,41,59,0.7)' : '#ffffff',
                  },
                }}
              />
            </Grid>

            {canManageStock && (
              <Grid item xs={12} sm={6} md="auto">
                <Button
                  variant="contained"
                  onClick={functionopen}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                    px: 2.5,
                    py: 1,
                  }}
                >
                  Nouvelle Sous-Catégorie
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Subcategories Grid */}
        <Grid container spacing={2.5}>
          {filteredCategories && filteredCategories.length > 0 ? (
            filteredCategories.map((post, index) => (
              <Grid 
                key={post.uuid || index} 
                item 
                xs={6} 
                sm={4} 
                md={3} 
                lg={2.4}
              >
                <ShadowBox shadow={post} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: '18px',
                  background: isDark ? 'rgba(30,41,59,0.4)' : '#ffffff',
                  border: '1px dashed',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }}
              >
                <CategoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, color: 'text.secondary' }} />
                <Typography 
                  variant="body1" 
                  sx={{ fontWeight: 700, color: isDark ? '#ffffff' : 'text.primary' }}
                >
                  Aucune sous-catégorie trouvée
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {searchTerm ? 'Essayez de modifier votre recherche.' : 'Créez votre première sous-catégorie en cliquant sur le bouton ci-dessus.'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Create Subcategory Dialog */}
        <Dialog 
          open={open} 
          onClose={closeopen} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: '20px',
              bgcolor: isDark ? '#1e293b' : '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          <DialogTitle 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nouvelle Sous-Catégorie
            </Typography>
            <IconButton onClick={closeopen} size="small" sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
            <M_Abonnement />
          ) : (
            <DialogContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                <MyTextField
                  fullWidth
                  label="Nom de la sous-catégorie"
                  {...register("libelle", { required: "Ce champ est obligatoire" })}
                  error={!!errors.libelle}
                  helperText={errors.libelle?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
                
                {unEntreprise.licence_type !== "Stock Simple" && (
                  <MyTextField
                    fullWidth
                    label="Image illustrative"
                    type="file"
                    onChange={handleImageChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                )}

                <Box sx={{ pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                  <Button
                    onClick={closeopen}
                    variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      px: 3,
                    }}
                  >
                    Enregistrer
                  </Button>
                </Box>
              </form>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}

ShadowBox.propTypes = { shadow: PropTypes.object };
