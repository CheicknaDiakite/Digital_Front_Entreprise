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
import clsx from 'clsx';

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
  description: ReactNode;
}

interface EntrepriseFormValues extends EntrepriseType {
  libelle?: string;
}

interface LicenceTagProps {
  type: string;
  children: ReactNode;
}

const LicenceTag: FC<LicenceTagProps> = ({ type, children }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
      {
        "bg-red-50 text-red-700 ring-red-700/10": type === "Free",
        "bg-yellow-50 text-yellow-700 ring-yellow-700/10": type === "Basic",
        "bg-green-50 text-green-700 ring-green-700/10": type === "Premium",
      }
    )}
  >
    {children}
  </span>
);

const IconsGrid: FC<IconsGridProps> = ({ icon, title, description, image }) => (
  <div className="icon-box bg-white p-4 shadow-md rounded-lg text-center hover:shadow-lg transition-shadow duration-200">
    <div className="icon flex justify-center items-center text-4xl mb-4">
      <img src={image} alt={title} className="h-16 w-16 object-cover rounded-full" />
    </div>
    <h4 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
      <span className="text-blue-600">{title}</span>
      {icon}
    </h4>
    <div className="text-gray-600">{description}</div>
  </div>
);

const LoadingState = () => (
  <Box sx={{ width: 300, margin: '2rem auto' }}>
    <Skeleton height={60} />
    <Skeleton animation="wave" height={60} />
    <Skeleton animation={false} height={60} />
  </Box>
);

const ErrorState = () => {
  window.location.reload();
  return <Typography color="error">Une erreur est survenue. Rechargement...</Typography>;
};

const EntrepriseDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formValues: EntrepriseFormValues;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  licenceType: string;
  onLicenceChange: (event: SelectChangeEvent) => void;
  onCountryChange: (event: any, value: string | RecupType) => void;
}> = ({
  open,
  onClose,
  onSubmit,
  formValues,
  onChange,
  licenceType,
  onLicenceChange,
  onCountryChange
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Ajouter une entreprise</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <Stack spacing={3}>
          <MyTextField
            label="Nom de l'entreprise"
            name="nom"
            value={formValues.nom}
            onChange={onChange}
            required
          />
          <MyTextField
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={onChange}
            required
          />
          <MyTextField
            label="Numéro de téléphone"
            name="numero"
            type="tel"
            value={formValues.numero || ''}
            onChange={onChange}
            required
          />
          <MyTextField
            label="Adresse"
            name="adresse"
            value={formValues.adresse}
            onChange={onChange}
            required
          />
          <CountrySelect onChange={onCountryChange} />
          <FormControl fullWidth>
            <InputLabel>Type de licence</InputLabel>
            <Select
              value={licenceType}
              label="Type de licence"
              onChange={onLicenceChange}
              required
            >
              <MenuItem value="Free">Gratuit</MenuItem>
              <MenuItem value="Basic">Basique</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Ajouter l'entreprise
          </Button>
        </Stack>
      </form>
    </DialogContent>
  </Dialog>
);

export default function Entreprise() {

    const {userEntreprises, isLoading, isError} = useGetUserEntreprises(connect)
    const {unUser} = useFetchUser(connect)
    const {ajoutEntreprise} = useCreateEntreprise()
    // const options = countryList().getData();

    const addId = useStoreUuid(state => state.addId)

    const [age, setAge] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleChange = (event: SelectChangeEvent) => {
      setAge(event.target.value as string);
    };
    
    const [formValues, setFormValues] = useState<EntrepriseFormValues>({
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
        setIsDialogOpen(false)
      };

  if (isLoading) {
    return <LoadingState />
  }

  if (isError) {
    return <ErrorState />
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
      <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
        Ajout de l'Entreprise
      </Button>
    </Typography>
  </Grid>
  :
  (unUser.role === 2 || unUser.role === 3 || unUser.role === 4)  ?
  ""
  :
  <Typography 
    variant="h5" 
    className='box-decoration-clone bg-linear-to-r p-5 m-5 text-white' 
    color="primary" 
    sx={{ mt: 1 }}>
    Nous vous remercions pour votre inscription sur Gest Stocks.<br/>
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
                <div className="space-y-2">
                  <p>Cette entreprise est activée et possède une licence</p>
                  <LicenceTag type={post.licence_type}>
                    {post.licence_type}
                  </LicenceTag>
                  <p>jusqu'au</p>
                  <LicenceTag type={post.licence_type}>
                    {post.licence_date_expiration}
                  </LicenceTag>
                </div>
              )
            }
          />
        </Link>
        {isLicenceExpired(post.licence_date_expiration) && (
          <Typography variant="h5" color="error" sx={{ mt: 1 }}>
            L'abonnement de cette entreprise a expiré !
          </Typography>
        )}
      </Grid>
    );
  })}
  </Grid>
    
    <EntrepriseDialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onSubmit={onSubmit}
      formValues={formValues}
      onChange={onChange}
      licenceType={age}
      onLicenceChange={handleChange}
      onCountryChange={handleAutoFourChange}
    />
  </>
  } else {

  return <>
  <Grid className='py-2'>
    <Typography variant="h5">
      <Button variant="outlined" onClick={() => setIsDialogOpen(true)} >Ajout de l'entreprise</Button>
    </Typography>
  </Grid>
  </>
  };
}
