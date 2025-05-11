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
  Badge,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ChangeEvent, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FormValueType } from "../../../typescript/FormType";
import { useAllMesUsers, useCreateCabinetUser } from "../../../usePerso/fonction.user";
import { connect } from "../../../_services/account.service";
import Nav from "../../../_components/Button/Nav";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import MyTextField from "../../../_components/Input/MyTextField";
import { useForm } from "react-hook-form";
import countryList from "react-select-country-list";
import toast from "react-hot-toast";
const TABS = [
  {
    label: "Tous",
    value: "all",
  },
  
];

export default function MesInscrit() {

  const { register, watch, handleSubmit, reset, formState: { errors } } = useForm<FormValueType>();

  const options = countryList().getData();

  const password = watch("password");
  
    let toastId: string | undefined;
  
    const handle = () => {
      toastId = toast.loading("Chargement pour vous envoyer un email ...");
      setTimeout(() => {
        if (toastId) {
          toast.dismiss(toastId);
        }
      }, 6500);
    };
  
  const [open, setOpen] = useState(false);
    
  const functionopen = () => setOpen(true);
  const closeopen = () => {
    reset(); // Réinitialise le formulaire à la fermeture
    setOpen(false);
  };

  const { getMesUsers, isLoading, isError } = useAllMesUsers(connect);
  
  const { createCabinetAdmin } = useCreateCabinetUser();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const reversedUser = getMesUsers?.slice().sort((a: any, b: any) => {
      if (a.id === undefined) return 1;
      if (b.id === undefined) return -1;
      return b.id - a.id;
    });

    // Récupération des éléments à afficher sur la page courante
   const usersEntreprise = reversedUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(getMesUsers.length / itemsPerPage);

  // const getUs = getMesUsers.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  
  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = (data: FormValueType) => {
    // data.user_id = connect;

    createCabinetAdmin(data);
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

  if (getMesUsers) {
    return <>    
      <Nav />

      <Card>
        <CardHeader
          title={
            <>
              <Typography variant="h5" color="textPrimary">
                Mes nouveaux inscrits                
              </Typography>
              <Typography color="textSecondary">
                L'ensembles des administrateurs de Gest Stock
              </Typography>
            </>
          }
          action={
            <Button onClick={functionopen} className="rounded border-x-1 animate-border-rotate mx-3" variant="outlined">
              Inscription
            </Button>
          }
        />
        <CardContent>
          
          <Stack spacing={3} direction="row">
                
            <Badge color="secondary" overlap="circular" badgeContent={getMesUsers.length}>
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
                  <TableCell>Email</TableCell>
                  <TableCell>Compte</TableCell>
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
                    <TableCell >{post.email}</TableCell>
                    <TableCell>
                      
                      <span 
                        className={post.role===1 ? 
                        "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10" :
                        "inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10"
                        }
                      >
                        {post.role===1 ? "Activer" :
                          "Desactiver"
                        }
                      </span>
                    </TableCell>        
                    {/* <TableCell className={post.role===1 ? "" : "bg-red-300 text-white"} >{post.role===1 ? "Activer" :
                                 "Visiteur"
                                }
                    </TableCell>         */}
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
        <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>
            Ajout des utilisateurs 
            <IconButton onClick={closeopen} style={{float: "right"}}>
              <CloseIcon color="primary"></CloseIcon>
            </IconButton>            
          </DialogTitle>

          <DialogContent>
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2} margin={2}>
                <MyTextField
                  label="Nom"
                  variant="outlined"
                  {...register("last_name", { required: "Ce champ est obligatoire" })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
      
                <MyTextField
                  label="Prénom"
                  variant="outlined"
                  {...register("first_name", { required: "Ce champ est obligatoire" })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
      
                <MyTextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  {...register("email", {
                    required: "L'email est obligatoire",
                    pattern: { value: /^\S+@\S+$/i, message: "Format d'email invalide" },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
      
                <MyTextField
                  label="Numéro"
                  variant="outlined"
                  {...register("numero", {
                    required: "Le numéro est obligatoire",
                    pattern: { value: /^[+]?[0-9]{5,15}$/, message: "Format de numéro invalide" },
                  })}
                  error={!!errors.numero}
                  helperText={errors.numero?.message}
                />
      
                <FormControl fullWidth error={!!errors.pays}>
                  <InputLabel>Votre pays</InputLabel>
                  <Select {...register("pays", { required: "Veuillez sélectionner un pays" })}>
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.pays && <p style={{ color: "red", fontSize: "12px" }}>{errors.pays.message}</p>}
                </FormControl>
      
                <MyTextField
                  label="Mot de passe"
                  type="password"
                  variant="outlined"
                  {...register("password", {
                    required: "Le mot de passe est obligatoire",
                    minLength: { value: 6, message: "Doit contenir au moins 6 caractères" },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
      
                <MyTextField
                  label="Confirmer le mot de passe"
                  type="password"
                  variant="outlined"
                  {...register("passwordConfirm", {
                    required: "La confirmation est obligatoire",
                    validate: (value) => value === password || "Les mots de passe ne correspondent pas",
                  })}
                  error={!!errors.passwordConfirm}
                  helperText={errors.passwordConfirm?.message}
                />
      
                <Button type="submit" color="success" variant="outlined" onClick={handle}>
                  Inscription
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
