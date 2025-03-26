import { UserPlusIcon } from "@heroicons/react/24/solid";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Grid,
  // TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
// import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAllClients, useCreateClient, useFetchEntreprise } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
// import { format } from "date-fns";
import { useStoreUuid } from "../../../usePerso/store";
import { ClienType } from "../../../typescript/UserType";
import M_Abonnement from "../../../_components/Card/M_Abonnement";
import { isLicenceExpired, stringAvatar } from "../../../usePerso/fonctionPerso";
import MainCard from "../../../components/MainCard";


export default function Client() {

  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)
  
  const [open, openchange] = useState(false);
  const functionopen = () => {
    openchange(true);
  };
  const closeopen = () => {
    openchange(false);
  };

  const { getClients: getUser, isLoading, isError } = useAllClients(uuid!);

  const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 25; // Nombre d'éléments par page

   const reversedclient = getUser?.slice().sort((a: ClienType, b: ClienType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const [filter, setFilter] = useState<1 | 2 | 3>(3);
  // const [startDate, setStartDate] = useState<string>(''); // Date de début
  // const [endDate, setEndDate] = useState<string>(''); // Date de fin

  const filteredClient = reversedclient?.filter((historyRow) => {
    // Filtrage par type
    
    const typeFilter = filter === 3 || historyRow.role === filter;
    // console.log("testing 11 ..", typeFilter)
    // Filtrage par date
    // const rowDate = new Date(historyRow.date ?? new Date());
    // const isAfterStartDate = startDate ? rowDate >= new Date(startDate) : true;
    // const isBeforeEndDate = endDate ? rowDate <= new Date(endDate) : true;

    return typeFilter;
  });

  console.log("testing ..", filteredClient)
 
   // Calcul du nombre total de pages
   const totalPages = Math.ceil(filteredClient.length / itemsPerPage);
 
   // Récupération des éléments à afficher sur la page courante
   const clientEntreprise = filteredClient.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
   );
   
   // Gestion du changement de page
   const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
     setCurrentPage(page);
   };
  
  const { createClient } = useCreateClient();

  const [formValues, setFormValues] = useState<ClienType>({
    nom: "",
    email: "",
    adresse: "",
    coordonne: "",
    numero: 0,
    role: 0,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["user_id"]= connect,
    formValues["entreprise_id"]= uuid!,

    createClient(formValues);

    // Réinitialisation des champs du formulaire
    setFormValues({
      nom: "",
      email: "",
      adresse: "",
      coordonne: "",
      numero: 0,
      role: 0,
    });

    // Fermez le dialogue (si nécessaire)
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
        {/* <CardHeader
          title={
            <>
              <Typography variant="h5" color="textPrimary">
                Listes des clients ou fournisseurs de cette entreprise
              </Typography>
              <Typography color="textSecondary">
                information sur les clients ou fournisseurs
              </Typography>
            </>
          }
          action={
            <Button onClick={functionopen} variant="outlined">
              <UserPlusIcon /> Ajouter client/fournisseur
            </Button>
          }
        /> */}
        <CardHeader className="mx-8"
          title={
            <Box>
              <Typography variant="h5" color="textPrimary">
                Listes des clients ou fournisseurs de cette entreprise
              </Typography>
              <Typography color="textSecondary">
                Information sur les clients ou fournisseurs
              </Typography>
            </Box>
          }
          action={
            <Button
              onClick={functionopen}
              variant="outlined"
              startIcon={<UserPlusIcon />}
            >
             Ajouter client/fournisseur
            </Button>
          }
        />
        
        <CardContent>
          {/* <Tabs value="all">
            {TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </Tabs> */}

          <Box className="flex justify-center mt-4" sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            <Button
              variant={filter === 3 ? 'contained' : 'outlined'}
              onClick={() => setFilter(3)}
              sx={{ marginRight: 1 }}
            >
              Tous
            </Button>
            <Button
              variant={filter === 1 ? 'contained' : 'outlined'}
              onClick={() => setFilter(1)}
              sx={{ marginRight: 1 }}
            >
              Client
            </Button>
            <Button
              variant={filter === 2 ? 'contained' : 'outlined'}
              onClick={() => setFilter(2)}
              sx={{ marginRight: 1 }}
            >
              Fournisseur
            </Button>            

            {/* Recherche par date */}
            {/* <Box sx={{ marginLeft: 2, display: 'flex', gap: 2 }}>
              <TextField
                label="Date début"
                className='bg-blue-200'
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date fin"
                type="date"
                className='bg-blue-200'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box> */}
          </Box>
          
          {/* <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="spanning table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Telephone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>
                    
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientEntreprise.map((post: any, index) => {
                const validDate = post.date ?? new Date();
                return <Fragment key={index} >
                  <TableRow>            
                      
                    <TableCell>                      
                      {format(new Date(validDate), 'dd/MM/yyyy')}
                    </TableCell>
                    
                    <TableCell>
                      {post.nom}                        
                    </TableCell>
                    <TableCell >{post.adresse}</TableCell>
                    <TableCell >{post.numero}</TableCell>
                    <TableCell >
                      {post.role===1 ? "Client" :
                        post.role===2 ? "Fournisseur" :
                        "Client/Fournisseur"
                      }
                    </TableCell>        
                    <TableCell>
                    <Link to={`/entreprise/client/info/${post.uuid}`}>
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
          
          <Grid container spacing={2}>
            {clientEntreprise.map((post: any) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}> 
              <Link to={`/entreprise/client/info/${post.uuid}`}>
                <MainCard className="my-3" sx={{ mb: 1 }} content={false}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar {...stringAvatar(`${post.nom}`)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={post.nom}
                      secondary={
                        <Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Tel : "} {post.numero}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Adresse : "} {post.adresse}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Coordonner : "} {post.coordonne}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            {"Etat de compte : "} 
                            {/* <Link to={`/entreprise/client/info/${post.uuid}`}> */}
                              <Chip
                                label={post.role === 1 ? "Client" : post.role === 2 ? "Fournisseur" : "Client/Fournisseur"}
                                variant="outlined"
                                color={post.role === 1 ? "primary" : post.role === 2 ? "info" : "success"}
                                sx={{ ml: "auto" }}
                              />
                            {/* </Link> */}
                          </Typography>
                        </Fragment>
                      }
                    />
                    {/* <Link to={`/entreprise/client/info/${post.uuid}`}>
                      <Chip
                        label={post.role === 1 ? "Client" : post.role === 2 ? "Fournisseur" : "Client/Fournisseur"}
                        variant="outlined"
                        color={post.role === 1 ? "primary" : post.role === 2 ? "info" : "success"}
                        sx={{ ml: "auto" }}
                      />
                    </Link> */}
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
            Ajout des clients ou fournisseurs 
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
                
                <MyTextField 
                label="Nom complet"
                name="nom"
                onChange={onChange}
                value={formValues.nom}
                fullWidth
                />
                <MyTextField 
                label="Adresse"
                name="adresse"
                onChange={onChange}
                value={formValues.adresse}
                fullWidth
                />
                
                <MyTextField 
                  label="Coordonne"
                  name="coordonne"
                  onChange={onChange}
                  value={formValues.coordonne}
                  fullWidth
                />
                <MyTextField 
                  label="Numero"
                  type="number"
                  name="numero"
                  onChange={onChange}
                  value={formValues.numero}
                  fullWidth
                />
                <MyTextField 
                  label="Email"
                  type="email"
                  name="email"
                  onChange={onChange}
                  value={formValues.email}
                  fullWidth
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-label">Type</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role-select"
                    name="role"
                    value={formValues.role || 0}
                    onChange={onSelectChange}
                    label="Role"
                  >
                    <MenuItem value={1}>Client</MenuItem>
                    <MenuItem value={2}>Fournisseur</MenuItem>
                    <MenuItem value={3}>Client/Fournisseur</MenuItem>
                  </Select>
                </FormControl>
                
                <Button type="submit" variant="contained" color="primary" >
                  Ajouter
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
