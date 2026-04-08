import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
// project import
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Skeleton, TextField, Tooltip, Fade, alpha, useTheme, useMediaQuery } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { connect } from '../../_services/account.service';
import { Link } from 'react-router-dom';
import { useCategoriesEntreprise, useCreateCategorie } from '../../usePerso/fonction.categorie';
import MyTextField from '../../_components/Input/MyTextField';
import { CategorieFormType } from '../../typescript/FormType';
import { CateBouType } from '../../typescript/DataType';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise } from '../../usePerso/fonction.user';
import { isLicenceExpired } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import img from '../../../public/icon-192x192.png'
import M_Abonnement from '../../_components/Card/M_Abonnement';
import { useForm } from 'react-hook-form';
import './mobile-shadows.css';

// ===============================|| SHADOW BOX ||=============================== //
interface ShadowBoxProps {
  shadow: CateBouType,
}

function ShadowBox({ shadow }: ShadowBoxProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // let url = BASE(shadow.image);
  const url = shadow.image ? BASE(shadow.image) : img;
  console.log('URL de image:', shadow.image);
  return (
    <Paper 
      elevation={isMobile ? 2 : 0} 
      className={`relative p-4 rounded-lg transition-all duration-200 hover:shadow-md border-x-2 animate-border-rotate mobile-shadow-card mobile-hover-effect ${isMobile ? 'mobile-glass' : 'mobile-glass'}`}
      sx={{
        borderRadius: isMobile ? '20px' : '8px',
        minHeight: { xs: '140px', sm: '160px' }
      }}
    >
      <Link to={`/categorie/sous/${shadow.uuid}`} className="block">
        <div className="flex flex-col items-center space-y-3 p-2">
          <Box
            className="mobile-article-image"
            sx={{
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <img 
              src={url} 
              alt={shadow.libelle} 
              className="w-full h-full object-cover"
            />
          </Box>
          <div className="text-center">
            <Typography 
              variant="subtitle1" 
              className="font-medium text-white"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600
              }}
            >
              {shadow.libelle}
            </Typography>
            <Typography 
              variant="body2" 
              className="text-gray-300"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              {shadow.sous_categorie_count}
            </Typography>
          </div>
        </div>
      </Link>
      
      <div className="absolute top-2 right-2">
        {/* <Tooltip title="Modifier" arrow TransitionComponent={Fade}> */}
          <Link to={`/categorie/modif/${shadow.uuid}`}>
            <IconButton 
              size="small" 
              className={`bg-white hover:bg-gray-50 shadow-sm mobile-edit-button ${isMobile ? 'mobile-glass' : ''}`}
              sx={{
                borderRadius: isMobile ? '12px' : '4px'
              }}
            >
              <EditIcon fontSize="small" className="text-blue-600" />
            </IconButton>
          </Link>
        {/* </Tooltip> */}
      </div>
    </Paper>
  );
}

export default function ComponentShadow() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const uuid = useStoreUuid((state) => state.selectedId);

  const { unEntreprise } = useFetchEntreprise(uuid);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CategorieFormType>();
  
  const [open, setOpen] = useState(false);

  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset(); // Réinitialise le formulaire à la fermeture
    setOpen(false);
  };

  const { cateEntreprises, isLoading } = useCategoriesEntreprise(uuid!);

  const { ajoutCategorie } = useCreateCategorie();

  const [searchTerm, setSearchTerm] = useState<string>(''); // Nouvel état pour le champ de recherche

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("image", e.target.files[0]); // Stocke l'image dans useForm
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onSubmit = (data: CategorieFormType) => {
    data.user_id = connect;
    data.entreprise_id = uuid!;

    ajoutCategorie(data);
    closeopen();
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', padding: { xs: 2, sm: 3 } }} className="mobile-loading">
        <Grid container spacing={isMobile ? 2 : 3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={isMobile ? 140 : 160} 
                className="rounded-lg"
                sx={{ borderRadius: isMobile ? '20px' : '8px' }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (cateEntreprises) {
    const filteredCategories = cateEntreprises.filter((post) =>
      post.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className={`min-h-screen ${isMobile ? '' : ''}`}>
        {/* <Nav /> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <Typography 
              variant="h4" 
              className={`font-semibold text-gray-50`}
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem' },
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Articles
            </Typography>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <TextField
                placeholder="Rechercher un article..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                className={`bg-white ${isMobile ? 'mobile-search-container' : ''}`}
                InputProps={{
                  startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
                }}
                size="small"
                sx={{
                  borderRadius: isMobile ? '16px' : '4px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: isMobile ? '16px' : '4px',
                  }
                }}
              />
              
              <Button
                variant="contained"
                onClick={functionopen}
                startIcon={<AddIcon />}
                className={`bg-blue-600 hover:bg-blue-700 whitespace-nowrap ${isMobile ? 'mobile-button' : ''}`}
                sx={{
                  borderRadius: isMobile ? '12px' : '6px',
                  fontWeight: isMobile ? 600 : 400
                }}
              >
                Nouvel Article
              </Button>
            </div>
          </div>

          <Grid 
            container 
            spacing={isMobile ? 2 : 3} 
            className={'mt-3'}
            sx={{
              '& .MuiGrid-item': {
                padding: { xs: '6px', sm: '12px' }
              }
            }}
          >
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((post, index) => (
                <Grid 
                  key={index} 
                  item 
                  xs={6} 
                  sm={4} 
                  md={3} 
                  lg={2}
                  className={`mobile-stagger-${(index % 6) + 1}`}
                  sx={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <ShadowBox shadow={post} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  className={`p-8 text-center border rounded-lg ${isMobile ? 'mobile-empty-card' : ''}`}
                  sx={{ 
                    borderRadius: isMobile ? '16px' : '8px',
                    padding: { xs: '24px', sm: '32px' }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    className="text-gray-500"
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Aucun article trouvé
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Dialog 
            open={open} 
            onClose={closeopen} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
              elevation: 0,
              className: "rounded-10",
              sx: isMobile ? {
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              } : {}
            }}
          >
            <DialogTitle 
              className={`flex justify-between items-center border-b pb-3 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white`}
              sx={{
                borderRadius: isMobile ? '20px 20px 0 0' : '8px 8px 0 0'
              }}
            >
              <Typography 
                variant="h6"
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}
              >
                Nouvel Article
              </Typography>
              <IconButton 
                onClick={closeopen} 
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />
            ) : (
              <DialogContent className="mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <MyTextField
                    fullWidth
                    label="Nom de l'article"
                    {...register("libelle", { required: "Ce champ est obligatoire" })}
                    error={!!errors.libelle}
                    helperText={errors.libelle?.message}
                    className={isMobile ? 'mobile-form-field' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: isMobile ? '12px' : '4px',
                      }
                    }}
                  />

                  {(unEntreprise.licence_type != "Stock Simple") &&
                  
                  <MyTextField
                    fullWidth
                    label="Image"
                    type="file"
                    onChange={handleImageChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <ImageIcon className="mr-2 text-gray-400" />,
                    }}
                    className={isMobile ? 'mobile-form-field' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: isMobile ? '12px' : '4px',
                      }
                    }}
                  />
                  }


                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      type="submit"
                      variant="contained"
                      className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'mobile-button' : ''}`}
                      sx={{
                        borderRadius: isMobile ? '12px' : '4px',
                        fontWeight: isMobile ? 600 : 400
                      }}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }
}

ShadowBox.propTypes = { shadow: PropTypes.string };

// CustomShadowBox.propTypes = { shadow: PropTypes.string, label: PropTypes.string, color: PropTypes.string, bgcolor: PropTypes.string };
