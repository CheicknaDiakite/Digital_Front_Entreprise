import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Stack,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  BarChart as PresentationChartBarIcon, // Utilisation de BarChart à la place de PresentationChartBarIcon
  Category as CategoryIcon,
  AddCircle as AddCircleIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as UserCircleIcon,
  PowerSettingsNew as PowerIcon,
} from "@mui/icons-material";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link } from "react-router-dom";
import {connect} from "../../../../../_services/account.service";
import { useAddAvis, useFetchEntreprise, useFetchUser, useGetUserEntreprises } from "../../../../../usePerso/fonction.user";
import { logout } from "../../../../../usePerso/fonctionPerso";
import { useStoreUuid } from "../../../../../usePerso/store";
import backgroundImage from "../../../../../../public/icon-192x192.png";
import { BASE } from "../../../../../_services/caller.service";
import MyTextField from "../../../../../_components/Input/MyTextField";
import CloseIcon from "@mui/icons-material/Close";
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { AvisType } from "../../../../../typescript/UserType";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Example from "../../../../../boutique/Ct";

const NavSide: React.FC = () => {
  const [open, setOpen] = useState<number>(0); // Typing `open` as number
  const {unUser} = useFetchUser(connect)
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)

  const {userEntreprises} = useGetUserEntreprises(connect)
  const addId = useStoreUuid(state => state.addId)

  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  const urlEntre = unEntreprise.image ? BASE(unEntreprise.image) : url;
  // const navigate = useNavigate();

  const handleOpen = (value: number): void => {
    setOpen(open === value ? 0 : value);
  };

  // const handleGoHome = () => {
  //   navigate('/entreprise');
  //   localStorage.removeItem('entreprise-uuid')
  //   window.location.reload();
  // };

  // Pour avis

  const [openA, openchange] = useState(false);
  const functionopen = () => {
    openchange(true);
  };
  const closeopen = () => {
    openchange(false);
  };

  const [openO, openchangeO] = useState(false);
  const functionopenO = () => {
    openchangeO(true);
  };
  const closeopenO = () => {
    openchangeO(false);
  };

  const {createAvis} = useAddAvis()
  const [avisValues, setAvisValues] = useState<AvisType>({
    libelle: "",
    description: "",
    user_id: "",
  });

  const onChangeAvis = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAvisValues({
      ...avisValues,
      [name]: value,
    });
  };

  const onSubmitAvis = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    avisValues["user_id"]= connect,
    
    createAvis(avisValues);

    setAvisValues({
      libelle: "",
      description: "",
      user_id: "",
    })
    closeopen();
    
  };

  return (
    <Card sx={{ height: "calc(100vh - 2rem)", maxWidth: "20rem", p: 2, boxShadow: 3 }}
    style={{
      background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${url}) center center`, 
      backgroundSize: 'cover', // Peut être 'cover' ou 'contain' selon votre besoin
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
    >
      {/* <Link to={"#"} onClick={handleGoHome}> */}
      
      {/* <Button onClick={handleGoHome}> */}
      <CardContent className="border border-indigo-600 bg-sky-500/30 flex items-center gap-2 p-2 rounded">
        <img
          src={urlEntre}
          alt="brand"
          className="h-8 w-8 object-contain"
        />
        <Typography variant="h5" color="text.primary">
          {unEntreprise.nom}
        </Typography>
      </CardContent>

      {/* </Button> */}
      {/* </Link> */}

      <List>
        <ListItem button onClick={() => handleOpen(5)} selected={open === 5}>
          <ListItemIcon>
            <AddBusinessIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography             
            className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
          >
            Entreprise(s)
          </Typography>
          {open === 5 ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={open === 5} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

          {userEntreprises?.map((post: any) => {
            return <Link 
            to={`/entreprise`}
            className="block"
            onClick={() => addId(post.uuid)}
            >
            <ListItem button>
              <ListItemIcon>
                {/* <CategoryIcon color="inherit" fontSize="small" /> */}
              </ListItemIcon>
              <Typography 
                className="text-black bg-white bg-opacity-100 px-2 py-1 rounded"
              >
                {post.nom}
              </Typography>
            </ListItem>
          </Link>
          })}
            
          </List>
        </Collapse>

        {uuid && <>        
        <ListItem button onClick={() => handleOpen(1)} selected={open === 1}>
          <ListItemIcon>
            <PresentationChartBarIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography 
            
            className="text-white bg-gray-900 bg-opacity-100 px-2 py-1 rounded"
          >
            Accueil
          </Typography>
          {open === 1 ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        </>}
        {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3 ) && <>
        
        <Collapse in={open === 1} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
          {(unUser.role === 1 || unUser.role === 2) && 
          
            <Link to="/categorie">
              <ListItem button>
                <ListItemIcon>
                  <CategoryIcon color="inherit" fontSize="small" />
                </ListItemIcon>
                <Typography 
                  className="text-black bg-white bg-opacity-100 px-2 py-1 rounded"
                >
                  Article
                </Typography>
              </ListItem>
            </Link>
          }
            {(unUser.role === 1 || unUser.role === 2) &&             
            <Link to="/entre">
              <ListItem>
                <ListItemIcon>
                  <AddCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <Typography 
                className="text-white bg-green-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Entrer (Achat)
                </Typography>
              </ListItem>
            </Link>
            }

            <Link to="/sortie">
              <ListItem>
                <ListItemIcon>
                  <ExitToAppIcon color="error" fontSize="small" />
                </ListItemIcon>
                <Typography 
                className="text-white bg-red-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Sortie (Vente)
                </Typography>
              </ListItem>
            </Link>

            <Link to="/sortie/remise">
              <ListItem>
                <ListItemIcon>
                  <ExitToAppIcon color="error" fontSize="small" />
                </ListItemIcon>
                <Typography 
                className="text-white bg-red-400 bg-opacity-100 px-2 py-1 rounded"
                >
                  Remise Facture
                </Typography>
              </ListItem>
            </Link>

          </List>
        </Collapse>
        </>       
        }
        {((unUser.role === 1 || unUser.role === 2) && uuid) && 
        <>        
        {/* Inventaier Par moi */}
        <ListItem button onClick={() => handleOpen(2)} selected={open === 2}>
          <ListItemIcon>
            <HistoryEduIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography 
          className="text-white bg-gray-900 bg-opacity-100 px-2 py-1 rounded"
          >
            Inventaire
          </Typography>
          {open === 2 ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open === 2} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <Link to="/entreprise/inventaire/sortie">
              <ListItem button>
                <ListItemIcon>
                  {/* <CategoryIcon /> */}
                </ListItemIcon>
                <Typography 
                  className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Sortie
                </Typography>
              </ListItem>
            </Link>

            <Link to="/entreprise/inventaire/entrer">
              <ListItem button>
                <ListItemIcon>
                  {/* <CategoryIcon /> */}
                </ListItemIcon>
                <Typography 
                  className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Entrer
                </Typography>
              </ListItem>
            </Link>
                      
            <Link to="/entreprise/inventaire/EtaDesProduits">
              <ListItem>
                <ListItemIcon>
                  {/* <AddCircleIcon /> */}
                </ListItemIcon>
                <Typography 
                  className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Etat des produits
                </Typography>
              </ListItem>
            </Link>
          
          </List>
        </Collapse>

        </>
        }
        {(unUser.role === 1 && uuid) && 
        <>
        {/*  */}
        <ListItem button onClick={() => handleOpen(3)} selected={open === 3}>
          <ListItemIcon>
            <HistoryEduIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography 
            className="text-white bg-gray-900 bg-opacity-100 px-2 py-1 rounded"
          >
            Historique
          </Typography>
          {open === 3 ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open === 3} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/entreprise/historique">
              <ListItem button>
                <ListItemIcon>
                  {/* <CategoryIcon /> */}
                </ListItemIcon>
                <Typography
                className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded" 
                >
                  Historique d'entrer et sortie
                </Typography>
              </ListItem>
            </Link>
                      
            <Link to="/entreprise/historique/sppression">
              <ListItem>
                <ListItemIcon>
                  {/* <AddCircleIcon /> */}
                </ListItemIcon>
                <Typography 
                className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Historique des suppressions
                </Typography>
              </ListItem>
            </Link>
          
          </List>
        </Collapse>
        </>
        }

        {(unUser.role === 1 && unUser.is_superuser ) && <>
        
        <Link to="/user/admin">
          <ListItem button>
            <ListItemIcon>
              <UserCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <Typography 
            className="text-white bg-blue-900 bg-opacity-100 px-2 py-1 rounded"
            >
              Les Admin
            </Typography>
          </ListItem>
        </Link>
        
        <Link to="/user/avis">        
          <ListItem button>
            <ListItemIcon>
              <UserCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <Typography 
            className="text-white bg-blue-900 bg-opacity-100 px-2 py-1 rounded"
            >
              Les Avis
            </Typography>
          </ListItem>
        </Link>
        </>
        }
        
        <Link to="https://documentation.gest-stocks.com">
          <ListItem >
            <ListItemIcon>
              <DescriptionIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <Typography 
            className="text-white bg-sky-900 bg-opacity-100 px-2 py-1 rounded"
            >
              Documentation
            </Typography>
          </ListItem>
        </Link>

        <ListItem button onClick={functionopen}>
          <ListItemIcon>
            <HelpOutlineIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography 
          className="text-white bg-sky-900 bg-opacity-100 px-2 py-1 rounded"
          >
            Que pensez-vous ?
          </Typography>
        </ListItem>

        <ListItem button onClick={functionopenO}>
          <ListItemIcon>
            <HelpOutlineIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Typography 
          className="text-white bg-sky-900 bg-opacity-100 px-2 py-1 rounded"
          >
            Payement ?
          </Typography>
        </ListItem>

        <ListItem button onClick={logout}>
          <ListItemIcon>
            <PowerIcon color="error" fontSize="small" />
          </ListItemIcon>
          <Typography 
          className="text-white bg-red-600 bg-opacity-100 px-2 py-1 rounded"
          >
            Déconnexion
          </Typography>
        </ListItem>
        
      </List>

      <Dialog open={openA} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>
            Que pensez-vous de Gest-Stocks ?
            <IconButton onClick={closeopen} style={{float: "right"}}>
              <CloseIcon color="primary"></CloseIcon>
            </IconButton>            
          </DialogTitle>
                 
               
          <DialogContent>
            <form onSubmit={onSubmitAvis}>
              <Stack spacing={2}  margin={2}>
                
                <MyTextField 
                label="Titre"
                name="libelle"
                onChange={onChangeAvis}
                value={avisValues.libelle}
                fullWidth
                />
                <MyTextField 
                variant="outlined"
                label="Description"
                name="description"
                multiline
                rows={4} // Nombre de lignes visibles
                onChange={onChangeAvis}
                value={avisValues.description}
                fullWidth
                />
                
                <Button type="submit" variant="contained" color="primary" >
                  Envoyer
                </Button>
              </Stack>
            </form>
          </DialogContent>
        
      </Dialog>

      <Dialog open={openO} onClose={closeopenO} fullWidth maxWidth="sm">
        <DialogTitle>
          Pour l'abonnement de votre entreprise
          <IconButton onClick={closeopenO} style={{float: "right"}}>
            <CloseIcon color="primary"></CloseIcon>
          </IconButton>            
        </DialogTitle>                
              
        <DialogContent>
          <Example />
        </DialogContent>
      </Dialog>

      <Typography variant="h5" className="text-white bg-gray-600 bg-opacity-100 px-2 py-1 rounded">
        <a
          href="https://wa.me/91154834"
          style={{ textDecoration: 'none', color: 'inherit' }}
          target="_blank"
          rel="noopener noreferrer"
          >
          Tel = {" "}+223 91 15 48 34 {" "}
        </a>
         
      </Typography>
    </Card>
  );
};

export default NavSide;
