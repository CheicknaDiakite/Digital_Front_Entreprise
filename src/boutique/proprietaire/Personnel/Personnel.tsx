// import { UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  CardActions,
  // Tabs,
  // Tab,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  Box,
  Skeleton,
  // TableContainer,
  // TableCell,
  // TableRow,
  // Table,
  // TableHead,
  // TableBody,
  // Paper,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
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

// const TABS = [
//   {
//     label: "Tous",
//     value: "all",
//   },
//   {
//     label: "Monitored",
//     value: "monitored",
//   },
//   {
//     label: "Unmonitored",
//     value: "unmonitored",
//   },
// ];


export default function Personnel() {
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)
  
  const [open, openchange] = useState(false);
  const functionopen = () => {
    openchange(true);
  };
  const closeopen = () => {
    openchange(false);
  };

  const top = {
    entreprise_id: uuid,
    user_id: connect,
  };

  const { getUser, isLoading, isError } = useFetchAllUsers(top);
  // const {unEntreprise} = useFetchEntreprise(uuid!)
  // const { userEntreprises } = useGetUserEntreprises(connect);
  const { createAdmin } = useCreateAdminUser();

  const [formValues, setFormValues] = useState<FormValueType>({
    username: "",
    first_name: "",
    last_name: "",
    email_user: "",
    password: "",
  });

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

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["entreprise_id"] = uuid!
    
    createAdmin(formValues);
    
    // Réinitialisation des champs du formulaire
    setFormValues({
      username: "",
      first_name: "",
      last_name: "",
      email_user: "",
      numero: "",
      password: "",
    });
    closeopen();

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
    return <div>Error ...</div>
  }

  if (getUser) {
    return <>    
      <Nav />

      <Card>
        <CardHeader className="mx-8"
          title={
            <>
              <Typography variant="h5" color="textPrimary">
                Listes des membres de cette entreprise
              </Typography>
              <Typography color="textSecondary">
                information sur les membres de l'entreprise
              </Typography>
            </>
          }
          action={
            <Button onClick={functionopen} variant="outlined">
             Ajout d'un membre
            </Button>
          }
        />

        <CardContent>
          {/* <Tabs value="all">
            {TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </Tabs> */}
          
          {/* <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="spanning table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Numero</TableCell>
                  <TableCell>Compte</TableCell>
                  <TableCell>
                    
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getUs.map((post: any, index) => {
                const validDate = post.date ?? new Date();
                return <Fragment key={index} >
                  <TableRow>            
                      
                    <TableCell>                      
                      {format(new Date(validDate), 'dd/MM/yyyy')}
                    </TableCell>
                    
                    <TableCell>
                      {post.last_name} {post.first_name}                        
                    </TableCell>
                    <TableCell >{post.numero}</TableCell>
                    <TableCell >{post.role===1 ? "Admin" :
                                post.role===2 ? "Gerant" :
                                post.role===3 ? "Caissier(e)" : "Visiteur"
                                }
                    </TableCell>        
                    <TableCell>
                    <Link to={`/entreprise/personnel/modif/${post.uuid}`}>
                      <Stack direction="row" spacing={2}>
                        
                        <VisibilityIcon color="info" fontSize="medium" />
                      </Stack>
                    </Link>
                    </TableCell>        
                  </TableRow>
                </Fragment>
                })}
              </TableBody>
            </Table>
          </TableContainer> */}

          {/* {getUs.map((post: any, index) => {
           return <MainCard className="m-5" sx={{ mb: 1 }} content={false} key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar {...stringAvatar(`${post.last_name} ${post.first_name}`)} />
                </ListItemAvatar>
                <ListItemText
                  primary={(`${post.last_name} ${post.first_name}`)}
                  secondary={
                    <Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {"Type de compte : "} {post.role===1 ? "Admin" :
                                post.role===2 ? "Gerant" :
                                post.role===3 ? "Caissier(e)" : "Visiteur"}
                      </Typography>
                      
                    </Fragment>
                  }
                />

                <Link to={`/entreprise/personnel/modif/${post.uuid}`}>
                  <Chip
                    label={"Modifier"}
                    variant="outlined"
                    color={"info"}
                    sx={{ ml: "auto" }} // Aligner le Chip à droite
                  />
                </Link>
              </ListItem>
            </MainCard>
          })} */}

          <Grid container spacing={2}>
            {getUs.map((post: any) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>   
              <Link to={`/entreprise/personnel/modif/${post.uuid}`}>              
                <MainCard className="my-3" sx={{ mb: 1 }} content={false}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar {...stringAvatar(`${post.last_name} ${post.first_name}`)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={(`${post.last_name} ${post.first_name}`)}
                      secondary={
                        <Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Tel : "} {post.numero}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Email : "} {post.email_user}
                          </Typography>
                          <br />
                          {/* <Typography component="span" variant="body2" color="text.primary">
                            {"Coordonner : "} {post.coordonne}
                          </Typography> */}
                          <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {"Type de compte : "}

                              {/* {post.role===1 ? "Admin" :
                                post.role===2 ? "Gerant" :
                                post.role===3 ? "Caissier(e)" : "Visiteur"} */}

                                <Chip
                                  label={post.role === 1 ? "Admin" : post.role === 2 ? "Gerant" : post.role===3 ? "Caissier(e)" : "Visiteur"}
                                  variant="outlined"
                                  color={post.role === 1 ? "primary" : post.role === 2 ? "primary" : "info"}
                                  sx={{ ml: "auto" }}
                                />
                            </Typography>
                        </Fragment>
                      }
                    />
                    {/* <Link to={`/entreprise/personnel/modif/${post.uuid}`}> */}
                      {/* <Chip
                        label={"Modifier"}
                        variant="outlined"
                        color={"info"}
                        sx={{ ml: "auto" }} // Aligner le Chip à droite
                      /> */}
                    {/* </Link> */}
                  </ListItem>
                </MainCard>
              </Link>           
              </Grid>
            ))}
          </Grid>
        </CardContent>

        <CardActions sx={{ justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </CardActions>
        <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>
            Ajout des utilisateurs 
            <IconButton onClick={closeopen} style={{float: "right"}}>
              <CloseIcon color="primary"></CloseIcon>
            </IconButton>            
          </DialogTitle>
          
          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <M_Abonnement />  
          )
            :        
          
          <DialogContent>
            <form onSubmit={onSubmit}>
              <Stack spacing={2}  margin={2}>
                
                {/* <MyTextField 
                label="Nom d'utilisateur"
                name="username"
                onChange={onChange}
                fullWidth
                /> */}
                <MyTextField 
                label="Prenom"
                name="last_name"
                onChange={onChange}
                fullWidth
                />
                
                <MyTextField 
                  label="Nom de famille"
                  name="first_name"
                  onChange={onChange}
                  fullWidth
                />
                <MyTextField
                  required
                  type="text"
                  variant="outlined"
                  label="Numéro"
                  name="numero"
                  onChange={onChange}
                  inputProps={{
                    pattern: "^[+]?\\d*$", // Permet uniquement les chiffres et éventuellement un "+" au début
                    maxLength: 15, // Limite la longueur à un nombre raisonnable pour un numéro international
                  }}
                />
                <MyTextField 
                  label="Email"
                  type="email"
                  name="email_user"
                  onChange={onChange}
                  fullWidth
                />
                <MyTextField 
                  label="Mot de passe"
                  type="password"
                  name="password"
                  onChange={onChange}
                  fullWidth
                />
                
                <Button type="submit" variant="contained" color="primary">
                  Ajouter l'utilisateur
                </Button>
              </Stack>
            </form>
          </DialogContent>
          }
          
        </Dialog>
      </Card>
    </>
    ;
  }

  return null;
}
