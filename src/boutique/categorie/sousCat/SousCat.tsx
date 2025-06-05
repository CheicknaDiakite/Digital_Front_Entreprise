import PropTypes from 'prop-types';
// material-ui
import Grid from '@mui/material/Grid';
import CloseIcon from "@mui/icons-material/Close"

import Typography from '@mui/material/Typography';

// project import

import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, TextField, Paper, Tooltip, Fade } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { RecupType, RouteParams } from '../../../typescript/DataType';
import { connect } from '../../../_services/account.service';
import { Link, useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import img from '../../../../public/icon-192x192.png'
import { useAllGetSousCate, useCreateSousCate, useFetchAllCategorie } from '../../../usePerso/fonction.categorie';
import MyTextField from '../../../_components/Input/MyTextField';
import Nav from '../../../_components/Button/Nav';
import { SousCategorieFormType } from '../../../typescript/FormType';
import { useStoreUuid } from '../../../usePerso/store';
import { useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import M_Abonnement from '../../../_components/Card/M_Abonnement';
import { useForm } from 'react-hook-form';

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
  const { unUser } = useFetchUser(connect);

  return (
    <Paper elevation={0} className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-md border-x-2 animate-border-rotate">
      {(unUser.role === 1 || unUser.role === 2) ? (
        <Link to={`/categorie/info/${shadow.uuid}`} className="block">
          <div className="flex flex-col items-center space-y-3 p-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img src={url} alt={shadow.libelle} className="w-16 h-16 object-contain" />
            </div>
            <Typography variant="subtitle1" className="font-medium text-gray-900">
              {shadow.libelle}
            </Typography>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-center space-y-3 p-2">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            <img src={url} alt={shadow.libelle} className="w-16 h-16 object-contain" />
          </div>
          <Typography variant="subtitle1" className="font-medium text-gray-900">
            {shadow.libelle}
          </Typography>
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <Tooltip title="Modifier" arrow TransitionComponent={Fade}>
          <Link to={`/categorie/sous/modif/${shadow.uuid}`}>
            <IconButton size="small" className="bg-white hover:bg-gray-50 shadow-sm">
              <EditIcon fontSize="small" className="text-blue-600" />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    </Paper>
  );
}

export default function SousCat() {
  const { uuid } = useParams<RouteParams>();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid!);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SousCategorieFormType>();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const recup = {
    slug: uuid,
    user_id: connect
  };

  const { categories } = useFetchAllCategorie(recup);
  const { getSousCates, isLoading, isError } = useAllGetSousCate(uuid!);
  const { ajoutSousCate } = useCreateSousCate();

  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset();
    setOpen(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("image", e.target.files[0]);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onSubmit = (data: SousCategorieFormType) => {
    data.user_id = connect;
    data.categorie_slug = uuid || '';
    ajoutSousCate(data);
    closeopen();
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', padding: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item}>
              <Skeleton variant="rectangular" height={160} className="rounded-lg" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert 
        severity="error" 
        className="m-4"
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      >
        Problème de connexion ! Veuillez réessayer.
      </Alert>
    );
  }

  if (getSousCates) {
    const filteredCategories = getSousCates.filter((post) =>
      post.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {categories?.map((category, index) => (
            <div key={index} className="mb-6">
              <Typography variant="h4" className="font-semibold text-gray-900">
                {category.libelle}
              </Typography>
            </div>
          ))}

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <TextField
                placeholder="Rechercher un produit..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-white"
                InputProps={{
                  startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
                }}
                size="small"
              />
              
              <Button
                variant="contained"
                onClick={functionopen}
                startIcon={<AddIcon />}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                Nouveau Produit
              </Button>
            </div>
          </div>

          <Grid container spacing={3}>
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((post, index) => (
                <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
                  <ShadowBox shadow={post} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={0} className="p-8 text-center border rounded-lg">
                  <Typography variant="body1" className="text-gray-500">
                    Aucun produit trouvé
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Dialog 
            open={open} 
            onClose={closeopen} 
            fullWidth 
            maxWidth="xs"
            PaperProps={{
              elevation: 0,
              className: "rounded-lg"
            }}
          >
            <DialogTitle className="flex justify-between items-center border-b pb-3">
              <Typography variant="h6">Nouveau Produit</Typography>
              <IconButton onClick={closeopen} size="small">
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
                    label="Nom du produit"
                    {...register("libelle", { required: "Ce champ est obligatoire" })}
                    error={!!errors.libelle}
                    helperText={errors.libelle?.message}
                  />

                  <MyTextField
                    fullWidth
                    label="Image"
                    type="file"
                    onChange={handleImageChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <ImageIcon className="mr-2 text-gray-400" />,
                    }}
                  />

                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      type="submit"
                      variant="contained"
                      className="bg-blue-600 hover:bg-blue-700"
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
