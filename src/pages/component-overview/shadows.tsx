import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from '@mui/icons-material/BorderColor';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
// project import
import MainCard from '../../components/MainCard';
import ComponentWrapper from './ComponentWrapper';
import ComponentSkeleton from './ComponentSkeleton';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Skeleton } from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
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
  const uuid = useStoreUuid((state) => state.selectedId)

  const {unEntreprise} = useFetchEntreprise(uuid!)

  const [open, openchange]= useState(false);
  const functionopen = () => {
      openchange(true)
  }
  const closeopen = () => {
      openchange(false)
  }
  
  // const {categories, ajoutCategorie} = useCategorie(top)
  const {cateEntreprises, isLoading, isError} = useCategoriesEntreprise(connect, uuid!)
  
  const {ajoutCategorie} = useCreateCategorie()
  
  const [formValues, setFormValues] = useState<CategorieFormType>({
    libelle: '',
    user_id: '',
    entreprise_id: '',
  });

  const [image, setImage] = useState<File | null>(null);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {

  const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formValues["user_id"] = connect
    formValues["image"] = image
    formValues["entreprise_id"] = uuid!
    console.log("oiu ..", formValues)
    ajoutCategorie(formValues)
    setFormValues({
      libelle: '',
      user_id: '',
      entreprise_id: '',
    })
    closeopen()
  };

  if (isLoading) {
    return <Box sx={{ width: 300 }}>
    <Skeleton />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
  </Box>
  }

  if (isError) {
    window.location.reload();
    return <div>Erroeur ...</div>
  }

  if (cateEntreprises) {
    return (
      <ComponentSkeleton>
        <ComponentWrapper>
          <Nav />
          <Grid container spacing={3}>
            <Grid item xs={12}>
                {/* <Typography variant="body1" className="text-center w-full"> */}
                
                {/* </Typography> */}
                <Grid item className='py-3'>
                  <Typography variant="h5">
                    <Button variant="outlined" onClick={functionopen} >Ajout Categorie</Button>
                    
                  </Typography>
                </Grid>
              
              {/* <MainCard className='bg-zinc-100' title={<Button variant="outlined" onClick={functionopen} >Ajout Categorie</Button>}> */}
                <Grid container spacing={2}>                  
                {cateEntreprises && cateEntreprises.length > 0 ? (
                  cateEntreprises?.map((post, index) => (
                    <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
                      <ShadowBox shadow={post} />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body1" className="text-center w-full">
                    Pas de Categorie
                  </Typography>
                )}
                  <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
                      <DialogTitle>
                        Categorie<IconButton onClick={closeopen} style={{float: "right"}}>
                          <CloseIcon color="primary"></CloseIcon></IconButton> 
                      </DialogTitle>
                      
                        {/* <DialogContentText>Categorie</DialogContentText> */}                        
                      
                      {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
                        <Typography variant="h5" color="error" sx={{ mt: 1 }}>
                          L'abonnement de cet Entreprise a expiré !
                          <Link to={'https://wa.me/70781242'}>
                            contacter sur whatsapp
                            <LocalPhoneIcon fontSize='medium' color='primary' />
                          </Link>
                        </Typography>)
                        :
                        <DialogContent>
                          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
                            <Stack spacing={2} margin={2}>
                              
                              <MyTextField 
                              label={"libelle"}
                              name={"libelle"}
                              value={formValues.libelle}
                              onChange={onChange}
                              />

                              <MyTextField 
                                label={"Image"}
                                name={"image"}
                                type='file'
                                onChange={handleImageChange}
                                InputLabelProps={{
                                  shrink: true, // Force le label à rester au-dessus du champ
                                }}
                              />
                              
                              <Button type="submit" color="success" variant="outlined" >Envoyer</Button>
                            </Stack>
                          </form>
                        </DialogContent>
                      }
                  </Dialog>
                  
                </Grid>
              {/* </MainCard> */}
            </Grid>
  
          </Grid>
        </ComponentWrapper>
      </ComponentSkeleton>
    );
  }
}

ShadowBox.propTypes = { shadow: PropTypes.string };

// CustomShadowBox.propTypes = { shadow: PropTypes.string, label: PropTypes.string, color: PropTypes.string, bgcolor: PropTypes.string };