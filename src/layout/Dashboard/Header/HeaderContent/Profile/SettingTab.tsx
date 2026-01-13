
// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Link } from 'react-router-dom';
import { useFetchEntreprise, useFetchUser } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const {unUser} = useFetchUser()
  const uuid = useStoreUuid((state) => state.selectedId)
  const { unEntreprise } = useFetchEntreprise(uuid)

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        (unEntreprise.licence_type != "Stock Simple") ? 
        <Link to={`/entreprise/produit/sortie`}>      
          <ListItemButton >
            <ListItemIcon>
              <FileCopyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Facture sortie" />
          </ListItemButton>
        </Link>
        :
        // <Link to={`/entreprise/produit/sortie`}>      
          <ListItemButton >
            <ListItemIcon>
              <FileCopyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Facture sortie" />
          </ListItemButton>
        // </Link>
        
      }
      {(unUser.role === 1 || unUser.role === 2) && 
        (unEntreprise.licence_type != "Stock Simple") ?       
        <Link to={`/entreprise/produit/entre`}>      
          <ListItemButton >
            <ListItemIcon>
              <FileOpenIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Facture entre" />
          </ListItemButton>
        </Link>
        :             
        <ListItemButton >
          <ListItemIcon>
            <FileOpenIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Facture entre" />
        </ListItemButton>
        
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && 
      (unEntreprise.licence_type != "Stock Simple") ? 
        <Link to={"/entreprise/depense"}>        
          <ListItemButton >
            <ListItemIcon>
              <MonetizationOnIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Depense(s)" />
          </ListItemButton>
        </Link>
        :  
        <ListItemButton >
          <ListItemIcon>
            <MonetizationOnIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Depense(s)" />
        </ListItemButton>
        
      }
      
    </List>
  );
}
