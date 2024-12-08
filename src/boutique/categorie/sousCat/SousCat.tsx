import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import CloseIcon from "@mui/icons-material/Close"

import Typography from '@mui/material/Typography';

// project import

import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Stack } from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import { RecupType, RouteParams } from '../../../typescript/DataType';
import { connect } from '../../../_services/account.service';
import { Link, useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/BorderColor';
import img from '../../../../public/icon-192x192.png'
import { useAllGetSousCate, useCreateSousCate, useFetchAllCategorie } from '../../../usePerso/fonction.categorie';
import MyTextField from '../../../_components/Input/MyTextField';
import Nav from '../../../_components/Button/Nav';
import { SousCategorieFormType } from '../../../typescript/FormType';
import { useStoreUuid } from '../../../usePerso/store';
import { useFetchEntreprise } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import MainCard from '../../../components/MainCard';

// ==============================|| DASHBOARD - DEFAULT ||============================== //
export interface SousCategorie {
  libelle: string;
  all_inventaire: number;
  slug: string;
}

export interface CardSousCateProps {
  post: RecupType;
}

interface ShadowBoxProps {
  shadow: RecupType,
}

function ShadowBox({ shadow }: ShadowBoxProps) {
 
  const url = shadow.image ? BASE(shadow.image) : img;
  // let url = BASE(unEntreprise.image);
  return (
    <div className="relative flex flex-col items-center space-y-2">
      <Link to={`/categorie/info/${shadow.uuid}`} className="w-full">
        <MainCard border={false} shadow={shadow.id} boxShadow>
          <Stack spacing={1} justifyContent="center" alignItems="center">
            <img src={url} alt="img" className="h-16 w-16" />
            <Typography variant="h6">{shadow.libelle}</Typography>
            {/* <Typography variant="subtitle1">{shadow.libelle}</Typography> */}
          </Stack>
        </MainCard>
      </Link>
      
      <Link to={`/categorie/sous/modif/${shadow.uuid}`}>
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

export default function SousCat() {

  const {uuid} = useParams<RouteParams>()
  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(entreprise_uuid!)
  const [open, openchange]= useState(false);
  const functionopen = () => {
    openchange(true)
  }
  const closeopen = () => {
    openchange(false)
  }
  
  const recup = {
    slug: uuid,
    user_id: connect
  }
  const {categories} = useFetchAllCategorie(recup)
  const {getSousCates, isLoading, isError} = useAllGetSousCate(uuid!)
  // const {souscategories} = useFetchAllSousCate(top)
  const {ajoutSousCate} = useCreateSousCate()

  const [image, setImage] = useState<File | null>(null);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const [formValues, setFormValues] = useState<SousCategorieFormType>({
    libelle: '',
    categorie_slug: '',
    user_id: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validSlug = uuid || '';

    formValues["user_id"] = connect
    formValues["image"] = image
    formValues["categorie_slug"] = validSlug
    
    ajoutSousCate(formValues)

    console.log("dd ..", formValues)

    setFormValues({
      libelle: '',
      categorie_slug: '',
      user_id: '',
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

  if (getSousCates) {
    return <>
      <Nav />
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        {/* row 1 */}
        
        {categories?.map((post, index) => (
          <Grid item key={index} xs={12} sx={{ mb: -2.25 }}>
            <Typography variant="h2" color="blue">{post.libelle}</Typography>
          </Grid>
        ))}
  
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">
            <Button variant="outlined" onClick={functionopen} >Ajout du Produit</Button>
          </Typography>
        </Grid>
  
        {getSousCates?.map((post, index) => {
          // return <CardSousCate key={index} post={post} />
          return <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
          <ShadowBox shadow={post} />
        </Grid>
        })}
        
        <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
        {/* Modal */}
        <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>Nom du produit<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <Typography variant="h5" color="error" sx={{ mt: 1 }}>
            L'abonnement de cet Entreprise a expiré !
          </Typography>)
          :
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
              <Stack spacing={2} margin={2}>
                {/* <TextField variant="outlined" label="libelle" name='libelle' onChange={onChange}></TextField> */}
                <MyTextField 
                  label={"libelle"}
                  name={"libelle"}
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

                <Button type="submit" color="success" variant="outlined">Envoyer</Button>
              </Stack>
            </form>
          </DialogContent>
          }
        </Dialog>
      </Grid>
    </>
    ;
  }
}

ShadowBox.propTypes = { shadow: PropTypes.string };
