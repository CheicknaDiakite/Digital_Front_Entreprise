import { UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  CardActions,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  Box,
  Skeleton,
  TableContainer,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FormValueType } from "../../../typescript/FormType";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useCreateAdminUser, useFetchAllUsers } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";
import { format } from "date-fns";

const TABS = [
  {
    label: "Tous",
    value: "all",
  },
  // {
  //   label: "Monitored",
  //   value: "monitored",
  // },
  // {
  //   label: "Unmonitored",
  //   value: "unmonitored",
  // },
];


export default function Personnel() {
  const uuid = useStoreUuid((state) => state.selectedId)
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
      numero: 0,
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
        <CardHeader
          title={
            <>
              <Typography variant="h5" color="textPrimary">
                Listes des membres de cet entreprise
              </Typography>
              <Typography color="textSecondary">
                information sur les membres de l'entreprise
              </Typography>
            </>
          }
          action={
            <Button onClick={functionopen} variant="outlined">
              <UserPlusIcon /> Ajout d'un membre
            </Button>
          }
        />
        <CardContent>
          <Tabs value="all">
            {TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </Tabs>
          
          <TableContainer component={Paper}>
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
                        {/* <Item>Modifier</Item> */}
                        <VisibilityIcon color="info" fontSize="medium" />
                      </Stack>
                    </Link>
                    </TableCell>        
                  </TableRow>
                </Fragment>
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions>
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
                  label="Numero"
                  name="numero"
                  onChange={onChange}
                  type="number"
                  fullWidth
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
        </Dialog>
      </Card>
    </>
    ;
  }

  return null;
}
