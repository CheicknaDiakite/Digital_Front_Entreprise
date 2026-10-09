
// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

// assets
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Link } from 'react-router-dom';
import { useFetchEntreprise, useFetchUser } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';
import { usePlanAccess } from '../../../../../hooks/usePlanAccess';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const theme = useTheme();
  const { unUser } = useFetchUser();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const isOwner = unUser.role === 1 || !unUser.role || unUser.role === 0;
  const isManager = unUser.role === 2;
  const canManageStock = isOwner || isManager;
  const canSell = isOwner || isManager || unUser.role === 3;

  const listItemBtnSx = {
    borderRadius: '12px',
    mb: 0.5,
    py: 1,
    px: 1.5,
    color: theme.palette.text.primary,
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

  return (
    <List component="nav" sx={{ p: 0 }}>
      {canSell && (
        <ListItemButton component={Link} to="/entreprise/produit/sortie" sx={listItemBtnSx}>
          <Box sx={iconBoxSx('rgba(99, 102, 241, 0.15)', '#818cf8')}>
            <FileCopyIcon style={{ fontSize: '1.1rem' }} />
          </Box>
          <ListItemText
            primary="Factures de sortie"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            secondary={planAccess.isDecouverte ? "Formule Stock Simple" : undefined}
            secondaryTypographyProps={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}
          />
          {planAccess.isDecouverte && (
            <Chip
              label="Simple"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            />
          )}
        </ListItemButton>
      )}

      {canManageStock && (
        <ListItemButton component={Link} to="/entreprise/produit/entre" sx={listItemBtnSx}>
          <Box sx={iconBoxSx('rgba(34, 197, 94, 0.15)', '#4ade80')}>
            <FileOpenIcon style={{ fontSize: '1.1rem' }} />
          </Box>
          <ListItemText
            primary="Factures d'entrée"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            secondary={planAccess.isDecouverte ? "Formule Stock Simple" : undefined}
            secondaryTypographyProps={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}
          />
          {planAccess.isDecouverte && (
            <Chip
              label="Simple"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            />
          )}
        </ListItemButton>
      )}

      {canSell && (
        <ListItemButton component={Link} to="/entreprise/depense" sx={listItemBtnSx}>
          <Box sx={iconBoxSx('rgba(239, 68, 68, 0.15)', '#f87171')}>
            <MonetizationOnIcon style={{ fontSize: '1.1rem' }} />
          </Box>
          <ListItemText
            primary="Gestion des dépenses"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            secondary={!planAccess.canManageExpenses ? "Formule Stock Pro" : undefined}
            secondaryTypographyProps={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 600 }}
          />
          {!planAccess.canManageExpenses && (
            <Chip
              label="Pro"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: 'rgba(139, 92, 246, 0.12)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            />
          )}
        </ListItemButton>
      )}
    </List>
  );
}
