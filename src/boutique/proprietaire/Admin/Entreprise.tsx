import { ChangeEvent, FC, FormEvent, ReactNode, SyntheticEvent, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close"
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Dialog, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Stack } from '@mui/material';
import { EntrepriseType } from '../../../typescript/Account';
import { connect } from '../../../_services/account.service';
import EntrepriseIcon from '@mui/icons-material/ProductionQuantityLimits';
import { Link } from 'react-router-dom';
import { useCreateEntreprise, useFetchUser, useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import backgroundImage from '../../../../public/assets/img/img.jpg'
import MyTextField from '../../../_components/Input/MyTextField';
// import countryList from 'react-select-country-list';
import { useStoreUuid } from '../../../usePerso/store';
import CountrySelect from '../../../_components/Liste_Pays/CountrySelect';
import { RecupType } from '../../../typescript/DataType';

// const CARD = ({post}) => (
  
//   <Fragment>
//     <CardContent>
//       <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
//         {post.adresse}
//       </Typography>
//       <Typography variant="h5" component="div">
//         {post.nom}
//       </Typography>
//       <Typography sx={{ mb: 1.5 }} color="text.secondary">
//         {post.email}
//       </Typography>
//       <Typography variant="body2">
//        Votre licence doit expirer le {post.licence_date_expiration}.
//         <br />
//         Tel : {post.numero}
//       </Typography>
//     </CardContent>
//     <CardActions>
//       <Link to={`/user/Entreprise/${post.id}`}>Info <AdsClickIcon color='primary' /></Link>
//     </CardActions>
//   </Fragment>
// );

interface IconsGridProps {
  icon: ReactNode;
  title: string;
  image: string;
  description: string;
}

const IconsGrid: FC<IconsGridProps> = ({ icon, title, description, image }) => (
  <div className="icon-box bg-white p-4 shadow-md rounded-lg text-center">
    <div className="icon flex justify-center items-center text-4xl mb-4">
      <img src={image} alt={title} className="h-16 w-16" />
    </div>
    <h4 className="text-xl font-semibold mb-2">
      <a href="#" className="text-blue-500 hover:underline">
        {title} {" "} {icon}
      </a>
    </h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Entreprise() {

    const {userEntreprises, isLoading, isError} = useGetUserEntreprises(connect)
    const {unUser} = useFetchUser(connect)
    const {ajoutEntreprise} = useCreateEntreprise()
    // const options = countryList().getData();

    const addId = useStoreUuid(state => state.addId)

    const [age, setAge] = useState('');

    const handleChange = (event: SelectChangeEvent) => {
      setAge(event.target.value as string);
    };
    
    const [open, openchange]= useState(false);
    const functionopen = () => {
        openchange(true)
    }
    const closeopen = () => {
        openchange(false)
    }

    const [formValues, setFormValues] = useState<EntrepriseType>({
        nom: '',
        email: '',
        numero: 0,
        adresse: '',
        user_id: '',
    });

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
          ...formValues,
          [name]: value,
        });
      };

      // const onSelectChange = (e: SelectChangeEvent<string>) => {
      //   setFormValues({
      //     ...formValues,
      //     [e.target.name]: e.target.value,
      //   });
      // };

      const handleAutoFourChange = (_: SyntheticEvent<Element, Event>,
        value: string | RecupType,
        // reason: AutocompleteChangeReason
        ) => {
        if (typeof value === 'object' && value !== null) {
          
          setFormValues({
            ...formValues,
            pays: value.label ?? '',
            // phone: value.phone ?? '',
          });
        } else {
          setFormValues({
            ...formValues,
            pays: '',
          });
        }
      };
    
      const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        formValues["user_id"]= connect
        // formValues["user_id"]= connect
        formValues["libelle"]= age

        ajoutEntreprise(formValues)

        setFormValues({
          nom: '',
          email: '',
          numero: 0,
          adresse: '',
          user_id: '',
          libelle: '',
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
    return <div>Error</div>
  }

  if (userEntreprises) {
  return <>
  {/* <Nav /> */}
  <Grid
  container
  spacing={3}
  justifyContent="center"
  alignItems="center"
  className='py-5'
  style={{
    background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${backgroundImage}) center center`, 
    backgroundSize: 'cover', // Peut être 'cover' ou 'contain' selon votre besoin
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
  
>
{unUser.role === 1 ? 
  <Grid item xs={12} sx={{ textAlign: 'center', mb: 3 }}>
    <Typography variant="h5">
      <Button variant="contained" onClick={functionopen}>
        Ajout de l'Entreprise
      </Button>
    </Typography>
  </Grid>
  :
  (unUser.role === 2 || unUser.role === 3 || unUser.role === null)  ?
  ""
  :
  <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
    Nous vous remercions pour votre inscription sur Gest Stock.<br/>
    Veuillez-vous patienter avant l'activation de votre compte !<br/>
    Pour plus d'information contacter (91 15 48 34 // 63 83 51 14)
  </Typography>
  
}

  {userEntreprises?.map((post: any, index) => {
    let url = BASE(post.image);
    return (
      <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
        <Link
          to={`/entreprise`}
          className="block"
          onClick={() => addId(post.uuid)}
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <IconsGrid
            icon={<EntrepriseIcon fontSize="small" />}
            image={url}
            title={post.nom}
            description={
              post.licence_active && (
                <p>
                  Cet entreprise est activé et possède une licence
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                    {post.licence_type}
                  </span>{' '}
                  jusqu'au{' '}
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                    {post.licence_date_expiration}
                  </span>
                </p>
              )
            }
          />
        </Link>
        {isLicenceExpired(post.licence_date_expiration) && (
          <Typography variant="h5" color="error" sx={{ mt: 1 }}>
            L'abonnement de cet Entreprise a expiré !
          </Typography>
        )}
      </Grid>
    );
  })}
  </Grid>
    
    <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
        <DialogTitle>Ajout de l'Entreprise<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
        <DialogContent>
          
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
          <Stack spacing={2} margin={2}>
           
            <MyTextField required
              variant="outlined" 
              label="nom" 
              name='nom' 
              onChange={onChange}
              sx={{
                "& .MuiFormLabel-asterisk": {
                  color: "red", // Personnalise la couleur de l'étoile en rouge
                },
              }}
            />

            <MyTextField
              variant="outlined" 
              label="adresse" 
              name='adresse' 
              onChange={onChange}
            />

            <MyTextField
              type='number'
              variant="outlined" 
              label="numero" 
              name='numero' 
              onChange={onChange}
              
            />

            <MyTextField
              type='email'
              variant="outlined" 
              label="email" 
              name='email' 
              onChange={onChange}
              
            />

            {/* <MyTextField
              type='text'
              variant="outlined" 
              label="Type d'entreprise" 
              name='libelle' 
              onChange={onChange}
              
            /> */}

            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Type d'entreprise</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Type d'entreprise"
                onChange={handleChange}
              >
                <MenuItem value={"Boutique"}>Boutique</MenuItem>
                <MenuItem value={"Quincaillerie"}>Quincaillerie</MenuItem>
                <MenuItem value={"Super marché"}>Super marché</MenuItem>
                <MenuItem value={"Boulangerie"}>Boulangerie</MenuItem>
                <MenuItem value={"Pharmacie"}>Pharmacie</MenuItem>
                <MenuItem value={"Pâtisserie"}>Pâtisserie</MenuItem>
                <MenuItem value={"Autre"}>Autre</MenuItem>
              </Select>
              
            </FormControl>

            <CountrySelect
            onSelectChange={handleAutoFourChange}
            label={"Choisisez le pays ou se trouve l'entreprise !"}             
            />
            
            {/* <FormControl fullWidth className='mb-4'>
              <InputLabel id="select-pays-label">Choisisez le pays ou se trouve l'entreprise</InputLabel>
              <Select
                labelId="select-pays-label"
                // value={selectedCountry}
                onChange={onSelectChange}
                name='pays'
                placeholder="Choisir un pays"
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
            <Button type="submit" color="success" variant="outlined" >Envoyer</Button>
          </Stack>
        </form>
        </DialogContent>
    </Dialog>
  </>
  } else {

  return <>
  <Grid className='py-2'>
    <Typography variant="h5">
      <Button variant="outlined" onClick={functionopen} >Ajout de la Entreprise</Button>
    </Typography>
  </Grid>
  </>
  };
}
