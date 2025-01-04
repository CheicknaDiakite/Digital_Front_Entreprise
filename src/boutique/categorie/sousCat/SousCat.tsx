import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import CloseIcon from "@mui/icons-material/Close"

import Typography from '@mui/material/Typography';

// project import

import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Stack, TextField } from '@mui/material';
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
import { useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import MainCard from '../../../components/MainCard';
import M_Abonnement from '../../../_components/Card/M_Abonnement';

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
  const {unUser} = useFetchUser(connect)
  // let url = BASE(unEntreprise.image);
  return (
    <div className="relative flex flex-col items-center space-y-2">
      {unUser.role === 1 ? 
      
      <Link to={`/categorie/info/${shadow.uuid}`} className="w-full">
        <MainCard border={false} shadow={shadow.id} boxShadow>
          <Stack spacing={1} justifyContent="center" alignItems="center">
            <img src={url} alt="img" className="h-16 w-16" />
            <Typography variant="h6">{shadow.libelle}</Typography>
            {/* <Typography variant="subtitle1">{shadow.libelle}</Typography> */}
          </Stack>
        </MainCard>
      </Link>
      :
      <MainCard border={false} shadow={shadow.id} boxShadow className="w-full">
        <Stack spacing={1} justifyContent="center" alignItems="center">
          <img src={url} alt="img" className="h-16 w-16" />
          <Typography variant="h6">{shadow.libelle}</Typography>
          {/* <Typography variant="subtitle1">{shadow.libelle}</Typography> */}
        </Stack>
      </MainCard>
      }
      
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
  const [searchTerm, setSearchTerm] = useState<string>(''); 

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    const filteredCategories = getSousCates.filter((post) =>
      post.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return <>
      <Nav />
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
          {/* row 1 */}
          
          {categories?.map((post, index) => (
            <Grid item key={index} xs={12} sx={{ mb: -2.25 }} className="py-2">
              <Typography variant="h2" color="blue">{post.libelle}</Typography>
            </Grid>
          ))}
    
          <Grid item className="py-3">
            <Typography variant="h5">
              <Button variant="outlined" onClick={functionopen} >Ajout du Produit</Button>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} className="py-2">
            <TextField
              label="Rechercher un produit"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid container spacing={2}>
            {filteredCategories?.map((post, index) => {
              // return <CardSousCate key={index} post={post} />
              return <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
              <ShadowBox shadow={post} />
            </Grid>
            })}
          </Grid>  
          
          <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
          {/* Modal */}
          <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
            <DialogTitle>Nom du produit<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
            <M_Abonnement />
            )
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
      </Grid>
    </>
    ;
  }
}

ShadowBox.propTypes = { shadow: PropTypes.string };
