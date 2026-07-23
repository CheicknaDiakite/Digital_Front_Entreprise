
// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

// assets
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Link } from 'react-router-dom';
import { useFetchEntreprise, useFetchUser } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const { unUser } = useFetchUser();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const listItemBtnSx = {
    borderRadius: '12px',
    mb: 0.5,
    py: 1,
    px: 1.5,
    color: '#e2e8f0',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: 'rgba(99, 102, 241, 0.15)',
      transform: 'translateX(4px)',
      '& .MuiListItemIcon-root': {
        transform: 'scale(1.1)',
      },
    },
  };

  const iconBoxSx = (bgColor: string, color: string) => ({
    minWidth: 32,
    width: 32,
    height: 32,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: bgColor,
    color: color,
    mr: 1.5,
    transition: 'transform 0.2s ease',
  });

  const isStockSimple = unEntreprise?.licence_type === 'Stock Simple';

  return (
    <List component="nav" sx={{ p: 0 }}>
      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&
        (!isStockSimple ? (
          <ListItemButton component={Link} to="/entreprise/produit/sortie" sx={listItemBtnSx}>
            <Box sx={iconBoxSx('rgba(99, 102, 241, 0.15)', '#818cf8')}>
              <FileCopyIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Factures de sortie"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton sx={{ ...listItemBtnSx, opacity: 0.6 }}>
            <Box sx={iconBoxSx('rgba(148, 163, 184, 0.15)', '#94a3b8')}>
              <FileCopyIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Factures de sortie"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              secondary="Non inclus dans votre offre"
              secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748b' }}
            />
          </ListItemButton>
        ))}

      {(unUser.role === 1 || unUser.role === 2) &&
        (!isStockSimple ? (
          <ListItemButton component={Link} to="/entreprise/produit/entre" sx={listItemBtnSx}>
            <Box sx={iconBoxSx('rgba(34, 197, 94, 0.15)', '#4ade80')}>
              <FileOpenIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Factures d'entrée"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton sx={{ ...listItemBtnSx, opacity: 0.6 }}>
            <Box sx={iconBoxSx('rgba(148, 163, 184, 0.15)', '#94a3b8')}>
              <FileOpenIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Factures d'entrée"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              secondary="Non inclus dans votre offre"
              secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748b' }}
            />
          </ListItemButton>
        ))}

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&
        (!isStockSimple ? (
          <ListItemButton component={Link} to="/entreprise/depense" sx={listItemBtnSx}>
            <Box sx={iconBoxSx('rgba(239, 68, 68, 0.15)', '#f87171')}>
              <MonetizationOnIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Gestion des dépenses"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton sx={{ ...listItemBtnSx, opacity: 0.6 }}>
            <Box sx={iconBoxSx('rgba(148, 163, 184, 0.15)', '#94a3b8')}>
              <MonetizationOnIcon style={{ fontSize: '1.1rem' }} />
            </Box>
            <ListItemText
              primary="Gestion des dépenses"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              secondary="Non inclus dans votre offre"
              secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748b' }}
            />
          </ListItemButton>
        ))}
    </List>
  );
}
