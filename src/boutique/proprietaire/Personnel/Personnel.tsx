// import { UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Typography,
  Button,
  // Tabs,
  // Tab,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Box,
  Skeleton,
  Paper,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FormValueType } from "../../../typescript/FormType";
// import VisibilityIcon from '@mui/icons-material/Visibility';
import { useCreateAdminUser, useFetchAllUsers, useFetchEntreprise } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";
// import { format } from "date-fns";
import M_Abonnement from "../../../_components/Card/M_Abonnement";
import { isLicenceExpired, stringAvatar } from "../../../usePerso/fonctionPerso";
import MainCard from "../../../components/MainCard";
import { useForm } from "react-hook-form";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Personnel() {
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValueType>();
  
  const [open, setOpen] = useState(false);
    
  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset(); // Réinitialise le formulaire à la fermeture
    setOpen(false);
  };

  const top = {
    entreprise_id: uuid,
    user_id: connect,
  };

  const { getUser, isLoading, isError } = useFetchAllUsers(top);
  // const {unEntreprise} = useFetchEntreprise(uuid!)
  // const { userEntreprises } = useGetUserEntreprises(connect);
  const { createAdmin } = useCreateAdminUser();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(getUser.length / itemsPerPage);

  const getUs = getUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = (data: FormValueType) => {
    // data.user_id = connect;
    data.entreprise_id = uuid!;


    createAdmin(data);
    
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
                    Gestion du Personnel
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Gérez les membres de votre entreprise
                  </Typography>
                </div>
                <Button
                  onClick={functionopen}
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ajouter un membre
                </Button>
              </div>

              {/* Grid of Personnel Cards */}
              <Grid container spacing={3}>
                {getUs.map((post: any) => (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <Link to={`/entreprise/personnel/modif/${post.uuid}`}>
                      <MainCard 
                        className="transition-all duration-200 hover:shadow-md"
                        sx={{ height: '100%' }}
                        content={false}
                      >
                        <ListItem alignItems="flex-start" className="h-full">
                          <ListItemAvatar>
                            <Avatar {...stringAvatar(`${post.last_name} ${post.first_name}`)} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" className="font-medium">
                                {post.last_name} {post.first_name}
                              </Typography>
                            }
                            secondary={
                              <Fragment>
                                <div className="space-y-1 mt-1">
                                  <Typography variant="body2" color="text.secondary">
                                    Tél : {post.numero}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Email : {post.email_user}
                                  </Typography>
                                  <div className="mt-2">
                                    <Chip
                                      label={
                                        post.role === 1 ? "Admin" :
                                        post.role === 2 ? "Superviseur" :
                                        post.role === 3 ? "Caissier(e)" : "Visiteur"
                                      }
                                      variant="outlined"
                                      color={post.role === 1 ? "primary" : post.role === 2 ? "primary" : "info"}
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

          {/* Add Member Dialog */}
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
                Ajouter un nouveau membre
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
                    label="Prénom"
                    {...register("last_name", { required: "Ce champ est obligatoire" })}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    fullWidth
                  />

                  <MyTextField
                    label="Nom"
                    {...register("first_name", { required: "Ce champ est obligatoire" })}
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    fullWidth
                  />

                  <MyTextField
                    label="Téléphone"
                    {...register("numero", { required: "Ce champ est obligatoire" })}
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
                    {...register("email_user", { required: "Ce champ est obligatoire" })}
                    error={!!errors.email_user}
                    helperText={errors.email_user?.message}
                    fullWidth
                  />

                  <MyTextField
                    label="Mot de passe"
                    type="password"
                    {...register("password", { required: "Ce champ est obligatoire" })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                  />

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
