import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  CardActions,
  Tabs,
  Tab,
  TextField,
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
  Badge,
} from "@mui/material";
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FormValueType } from "../../../typescript/FormType";
import { useAllUsers, useCreateAdminUser } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
const TABS = [
  {
    label: "Tous",
    value: "all",
  },
  
];

export default function Users() {
  const [open, openchange] = useState(false);
  
  const closeopen = () => {
    openchange(false);
  };

  const { getUsers, isLoading, isError } = useAllUsers(connect);
  
  const { createAdmin } = useCreateAdminUser();

  const [formValues, setFormValues] = useState<FormValueType>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const reversedUser = getUsers?.slice().sort((a: any, b: any) => {
      if (a.id === undefined) return 1;
      if (b.id === undefined) return -1;
      return b.id - a.id;
    });

    // Récupération des éléments à afficher sur la page courante
   const usersEntreprise = reversedUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(getUsers.length / itemsPerPage);

  const getUs = getUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  console.log("user . ", getUs)

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
    createAdmin(formValues);
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

  if (getUsers) {
    return <>    
      <Nav />

      <Card>
        <CardHeader
          title={
            <>
              <Typography variant="h5" color="textPrimary">
                Les nouveaux inscrits
                
              </Typography>
              <Typography color="textSecondary">
                L'ensembles des administrateurs de Gest Stock
              </Typography>

            </>
          }
        />
        <CardContent>
          
          <Stack spacing={3} direction="row">
                
            <Badge color="secondary" overlap="circular" badgeContent={getUs.length}>
              <PersonAddAltIcon fontSize="large" color="primary" />
            </Badge>
            
          </Stack>
          <Tabs value="all">
            {TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </Tabs>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="spanning table">
              <TableHead>
                <TableRow>
                  
                  <TableCell>Nom</TableCell>
                  <TableCell>Numero</TableCell>
                  <TableCell>Type de compte</TableCell>
                  <TableCell>
                    
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersEntreprise.map((post: any, index) => (
                <Fragment key={index} >
                  <TableRow>            
                      
                    <TableCell>
                      {post.last_name} {post.first_name}                        
                    </TableCell>
                    <TableCell >{post.numero}</TableCell>
                    <TableCell className={post.role===1 ? "" : "bg-red-300 text-white"} >{post.role===1 ? "Activer" :
                                 "Visiteur"
                                }
                    </TableCell>        
                    <TableCell>
                    <Link to={`/user/admin/modif/${post.uuid}`}>
                      <Stack direction="row" spacing={2}>
                        {/* <Item>Modifier</Item> */}
                        <VisibilityIcon color="info" fontSize="medium" />
                      </Stack>
                    </Link>
                    </TableCell>        
                  </TableRow>
                </Fragment>
                ))}
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
        <Dialog open={open} onClose={closeopen}>
          <DialogTitle>
            Ajout des entrer
            <IconButton onClick={closeopen}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Username"
                  name="username"
                  onChange={onChange}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="last_name"
                  onChange={onChange}
                  fullWidth
                />
                <TextField
                  label="First Name"
                  name="first_name"
                  onChange={onChange}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  onChange={onChange}
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  onChange={onChange}
                  fullWidth
                />
                <Button type="submit" variant="contained" color="primary">
                  Add User
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
