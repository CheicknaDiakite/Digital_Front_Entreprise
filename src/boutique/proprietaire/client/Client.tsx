import {
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Box,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Grid,
  Paper
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useAllClients, useCreateClient, useFetchEntreprise } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";
import { ClienType } from "../../../typescript/UserType";
import M_Abonnement from "../../../_components/Card/M_Abonnement";
import { isLicenceExpired, stringAvatar } from "../../../usePerso/fonctionPerso";
import MainCard from "../../../components/MainCard";
import { useForm } from "react-hook-form";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function Client() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid!);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClienType>();
  const [open, setOpen] = useState(false);
    
  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset();
    setOpen(false);
  };

  const { getClients: getUser, isLoading, isError } = useAllClients(uuid!);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

   const reversedclient = getUser?.slice().sort((a: ClienType, b: ClienType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const [filter, setFilter] = useState<1 | 2 | 3>(3);

  const filteredClient = reversedclient?.filter((historyRow) => {
    return filter === 3 || historyRow.role === filter;
  });

   const totalPages = Math.ceil(filteredClient.length / itemsPerPage);
   const clientEntreprise = filteredClient.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
   );
   
   const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
     setCurrentPage(page);
   };
  
  const { createClient } = useCreateClient();

  const onSubmit = (data: ClienType) => {
    data.user_id = connect;
    data.entreprise_id = uuid!;
    createClient(data);
    closeopen();
  };

  if (isLoading) {
    return (
      <Box className="p-4">
        <Skeleton variant="rectangular" height={200} className="mb-4" />
        <Skeleton variant="rectangular" height={100} className="mb-2" />
        <Skeleton variant="rectangular" height={100} />
  </Box>
    );
  }

  if (isError) {
    return (
      <Box className="p-4">
        <Typography variant="h6" color="error">
          Une erreur est survenue lors du chargement des données
        </Typography>
      </Box>
    );
  }

  if (getUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Nav />

          <Paper elevation={0} className="mt-6 rounded-lg overflow-hidden">
            <Box className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-6 mb-6">
                <div>
                  <Typography variant="h4" className="font-semibold text-gray-900">
                    Gestion des Clients et Fournisseurs
              </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Gérez vos relations commerciales
              </Typography>
                </div>
            <Button
              onClick={functionopen}
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
            >
                  Ajouter un contact
            </Button>
              </div>

              {/* Filters */}
              <Paper elevation={0} className="p-4 mb-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <FilterListIcon className="text-gray-500" />
                  <Typography variant="subtitle1" className="font-medium text-gray-700">
                    Filtrer par type
                  </Typography>
                </div>
                <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 3 ? 'contained' : 'outlined'}
              onClick={() => setFilter(3)}
                    size="small"
                    className={filter === 3 ? 'bg-blue-600' : ''}
            >
              Tous
            </Button>
            <Button
              variant={filter === 1 ? 'contained' : 'outlined'}
              onClick={() => setFilter(1)}
                    size="small"
                    className={filter === 1 ? 'bg-blue-600' : ''}
            >
                    Clients
            </Button>
            <Button
              variant={filter === 2 ? 'contained' : 'outlined'}
              onClick={() => setFilter(2)}
                    size="small"
                    className={filter === 2 ? 'bg-blue-600' : ''}
            >
                    Fournisseurs
            </Button>            
                </div>
              </Paper>
          
              {/* Grid of Client Cards */}
              <Grid container spacing={3}>
            {clientEntreprise.map((post: any) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}> 
              <Link to={`/entreprise/client/info/${post.uuid}`}>
                      <MainCard 
                        className="transition-all duration-200 hover:shadow-md"
                        sx={{ height: '100%' }}
                        content={false}
                      >
                        <ListItem alignItems="flex-start" className="h-full">
                    <ListItemAvatar>
                            <Avatar {...stringAvatar(post.nom)} />
                    </ListItemAvatar>
                    <ListItemText
                            primary={
                              <Typography variant="subtitle1" className="font-medium">
                                {post.nom}
                              </Typography>
                            }
                      secondary={
                        <Fragment>
                                <div className="space-y-1 mt-1">
                                  <Typography variant="body2" color="text.secondary">
                                    Tél : {post.numero}
                          </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Email : {post.email}
                          </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Adresse : {post.adresse}
                          </Typography>
                                  <div className="mt-2">
                              <Chip
                                      label={
                                        post.role === 1 ? "Client" :
                                        post.role === 2 ? "Fournisseur" :
                                        "Client/Fournisseur"
                                      }
                                variant="outlined"
                                      color={
                                        post.role === 1 ? "primary" :
                                        post.role === 2 ? "secondary" :
                                        "default"
                                      }
                                      size="small"
                                    />
                                  </div>
                                </div>
                        </Fragment>
                      }
                    />
                  </ListItem>
                </MainCard>
              </Link>             
              </Grid>
            ))}
          </Grid>

              {/* Pagination */}
              <Box className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
                  size="large"
          />
              </Box>
            </Box>
          </Paper>

          {/* Add Client/Supplier Dialog */}
          <Dialog 
            open={open} 
            onClose={closeopen} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
              elevation: 0,
              className: "rounded-lg"
            }}
          >
            <DialogTitle className="flex justify-between items-center border-b pb-3">
              <Typography variant="h6" className="font-semibold">
                Ajouter un nouveau contact
              </Typography>
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
                  label="Nom complet"
                  {...register("nom", { required: "Ce champ est obligatoire" })}
                  error={!!errors.nom}
                  helperText={errors.nom?.message}
                    fullWidth
                />

                <MyTextField                                              
                    label="Téléphone"
                  {...register("numero")}
                  error={!!errors.numero}
                  helperText={errors.numero?.message}
                    inputProps={{
                      pattern: "^[+]?\\d*$",
                      maxLength: 15,
                    }}
                    fullWidth
                />
                
                <MyTextField 
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                    fullWidth
                />

                <MyTextField                                              
                  label="Adresse"
                  {...register("adresse")}
                  error={!!errors.adresse}
                  helperText={errors.adresse?.message}
                    fullWidth
                />
                
                <MyTextField                                              
                    label="Coordonnées supplémentaires"
                  {...register("coordonne")}
                  error={!!errors.coordonne}
                  helperText={errors.coordonne?.message}
                    fullWidth
                    multiline
                    rows={2}
                />

                  <FormControl fullWidth>
                    <InputLabel id="role-label">Type de contact</InputLabel>
                  <Select
                    labelId="role-label"
                      label="Type de contact"
                    {...register("role", { required: "Ce champ est obligatoire" })}
                    error={!!errors.role}
                  >
                    <MenuItem value={1}>Client</MenuItem>
                    <MenuItem value={2}>Fournisseur</MenuItem>
                    <MenuItem value={3}>Client/Fournisseur</MenuItem>
                  </Select>
                </FormControl>
                
                  <div className="pt-4 flex justify-end space-x-3">
                    <Button onClick={closeopen} variant="outlined">
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                  Ajouter
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

  return null;
}
