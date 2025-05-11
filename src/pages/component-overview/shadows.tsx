import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from '@mui/icons-material/BorderColor';
// project import
import MainCard from '../../components/MainCard';
import ComponentWrapper from './ComponentWrapper';
import ComponentSkeleton from './ComponentSkeleton';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { connect } from '../../_services/account.service';
import { Link } from 'react-router-dom';
import { useCategoriesEntreprise, useCreateCategorie } from '../../usePerso/fonction.categorie';
import MyTextField from '../../_components/Input/MyTextField';
import Nav from '../../_components/Button/Nav';
import { CategorieFormType } from '../../typescript/FormType';
import { CateBouType } from '../../typescript/DataType';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise } from '../../usePerso/fonction.user';
import { isLicenceExpired } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import img from '../../../public/icon-192x192.png'
import M_Abonnement from '../../_components/Card/M_Abonnement';
import { useForm } from 'react-hook-form';

// ===============================|| SHADOW BOX ||=============================== //
interface ShadowBoxProps {
  shadow: CateBouType,
}

function ShadowBox({ shadow }: ShadowBoxProps) {
  
  // let url = BASE(shadow.image);
  const url = shadow.image ? BASE(shadow.image) : img;
  return (
    <div className="relative flex flex-col items-center space-y-2">
      <Link to={`/categorie/sous/${shadow.uuid}`} className="w-full">
        <MainCard border={false} shadow={shadow.id} boxShadow>
          <Stack spacing={1} justifyContent="center" alignItems="center">
            <img src={url} alt="img" className="h-16 w-16" />
            <Typography variant="h6">{shadow.libelle}</Typography>
            <Typography variant="subtitle1">{shadow.sous_categorie_count}</Typography>
          </Stack>
        </MainCard>
      </Link>
      
      <Link to={`/categorie/modif/${shadow.slug}`}>
        <Button 
          size="small" 
          className="rounded-full shadow-md shadow-indigo-500/50 flex items-center justify-center"
        >
          <EditIcon color="primary" fontSize="small" />
        </Button>
      </Link>
    </div>
  );
}

export default function ComponentShadow() {
  const uuid = useStoreUuid((state) => state.selectedId);

  const { unEntreprise } = useFetchEntreprise(uuid!);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CategorieFormType>();


  const [open, setOpen] = useState(false);

  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset(); // Réinitialise le formulaire à la fermeture
    setOpen(false);
  };

  const { cateEntreprises, isLoading, isError } = useCategoriesEntreprise(connect, uuid!);

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
      <Box sx={{ width: 300 }}>
        <Skeleton />
        <Skeleton animation="wave" />
        <Skeleton animation={false} />
      </Box>
    );
  }

  if (isError) {
    return (
    <Stack sx={{ width: '100%' }} spacing={2}>        
      <Alert severity="error">Probleme de connexion !</Alert>
    </Stack>
  );
  }

  if (cateEntreprises) {
    const filteredCategories = cateEntreprises.filter((post) =>
      post.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <ComponentSkeleton>
        <ComponentWrapper>
          <Nav />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid item className="py-3">
                <Typography variant="h5">
                  <Button variant="outlined" className="rounded border-x-1 animate-border-rotate" onClick={functionopen}>
                    Ajout d'article
                  </Button>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} className="py-2">
                <TextField
                  label="Rechercher un article"
                  variant="outlined"
                  className='bg-blue-200'
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearchChange}                  
                />
              </Grid>
              <Grid container spacing={2}>
                {filteredCategories && filteredCategories.length > 0 ? (
                  filteredCategories.map((post, index) => (
                    <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
                      <ShadowBox shadow={post} />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body1" className="text-center w-full p-5 m-5">
                    Aucun article trouvé
                  </Typography>
                )}
                <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
                  <DialogTitle>
                    Article
                    <IconButton onClick={closeopen} style={{ float: 'right' }}>
                      <CloseIcon color="primary" />
                    </IconButton>
                  </DialogTitle>
                  {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
                    <M_Abonnement />
                  ) : (
                    <DialogContent>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2} margin={2}>
                          <MyTextField
                            
                            label="Nom de l'article"
                            {...register("libelle", { required: "Ce champ est obligatoire" })}
                            error={!!errors.libelle}
                            helperText={errors.libelle?.message}
                          />
                          <MyTextField
                            label="Image"
                            type="file"
                            onChange={handleImageChange}
                            InputLabelProps={{ shrink: true }}
                          />
                          <Button type="submit" color="success" variant="outlined">
                            Envoyer
                          </Button>
                        </Stack>
                      </form>
                    </DialogContent>
                  )}
                </Dialog>
              </Grid>
            </Grid>
          </Grid>
        </ComponentWrapper>
      </ComponentSkeleton>
    );
  }
}

ShadowBox.propTypes = { shadow: PropTypes.string };

// CustomShadowBox.propTypes = { shadow: PropTypes.string, label: PropTypes.string, color: PropTypes.string, bgcolor: PropTypes.string };
