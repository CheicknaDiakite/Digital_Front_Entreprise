import React, { useState } from "react";
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
  DialogContent,
  DialogContentText,
  DialogActions,
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
import { Link, useNavigate } from "react-router-dom";
import {connect} from "../../../../../_services/account.service";
import { useFetchEntreprise, useFetchUser } from "../../../../../usePerso/fonction.user";
import { logout } from "../../../../../usePerso/fonctionPerso";
import { useStoreUuid } from "../../../../../usePerso/store";
import pdf from "../../../../../../public/assets/file/dd.pdf";
import backgroundImage from "../../../../../../public/icon-192x192.png"
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import PdfViewer from "../../../../../usePerso/PdfFile";
import { BASE } from "../../../../../_services/caller.service";

const NavSide: React.FC = () => {
  const [open, setOpen] = useState<number>(0); // Typing `open` as number
  const {unUser} = useFetchUser(connect)
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  const urlEntre = unEntreprise.image ? BASE(unEntreprise.image) : url;
  const navigate = useNavigate();

  // Modal 
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const [openM, setOpenM] = useState(false);

  const handleClickOpen = () => {
    setOpenM(true);
  };

  const handleClose = () => {
    setOpenM(false);
  };
  // Fin modal
  
  const handleOpen = (value: number): void => {
    setOpen(open === value ? 0 : value);
  };

  const handleGoHome = () => {
    navigate('/');
    localStorage.removeItem('entreprise-uuid')
    window.location.reload();
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
      <Button onClick={handleGoHome}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={urlEntre} alt="brand" style={{ height: "2rem", width: "2rem" }} />
          <Typography variant="h5" color="textPrimary">
            Accueil principal
          </Typography>
        </CardContent>
      </Button>
      <List>
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
                  <CategoryIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <Typography 
                  className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Catégorie
                </Typography>
              </ListItem>
            </Link>
          }
            {(unUser.role === 1 || unUser.role === 2) &&             
            <Link to="/entre">
              <ListItem>
                <ListItemIcon>
                  <AddCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <Typography 
                className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Entrer
                </Typography>
              </ListItem>
            </Link>
            }

            <Link to="/sortie">
              <ListItem>
                <ListItemIcon>
                  <ExitToAppIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <Typography 
                className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Sortie
                </Typography>
              </ListItem>
            </Link>
          </List>
        </Collapse>
        </>       
        }
        {(unUser.role === 1 && uuid) && 
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
              <ListItem>
                <ListItemIcon>
                  {/* <AddCircleIcon /> */}
                </ListItemIcon>
                <Typography 
                  className="text-white bg-gray-500 bg-opacity-100 px-2 py-1 rounded"
                >
                  Entrer
                </Typography>
              </ListItem>
            </Link>
          
          </List>
        </Collapse>
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

        {(unUser.role === 1 && unUser.is_superuser ) && 
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
        }

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

        <ListItem button >
          <ListItemIcon>
            <DescriptionIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <Button 
          className="text-white bg-sky-900 bg-opacity-100 px-2 py-1 rounded"
          onClick={handleClickOpen}>
            Documentation
          </Button>
        </ListItem>

      </List>

      <Dialog
        fullScreen={fullScreen}
        open={openM}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Documentation du Logiciel de Gestion de Stock de Diakite Digital qui contient les informations pour mieux s'en sortir
        </DialogTitle>
        <DialogContent>
          <DialogContentText >
            {/* Documentation du Logiciel de Gestion de Stock de Diakite Digital */}
            <PdfViewer fileUrl={pdf} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" className="text-white bg-gray-600 bg-opacity-100 px-2 py-1 rounded">
        Tel = 91 15 48 34
      </Typography>
    </Card>
  );
};

export default NavSide;
