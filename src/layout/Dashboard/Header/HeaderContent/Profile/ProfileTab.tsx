import PropTypes from 'prop-types';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EditIcon from '@mui/icons-material/BorderColor';

// assets
import LogoutIcon from '@mui/icons-material/Logout';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import { connect } from '../../../../../_services/account.service';
import { Link } from 'react-router-dom';
import { useFetchUser } from '../../../../../usePerso/fonction.user';
import { Box, Skeleton } from '@mui/material';
import { logout } from '../../../../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../../../../usePerso/store';


// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab() {
  const {unUser, isLoading} = useFetchUser()

  const uuid = useStoreUuid((state) => state.selectedId)
  
  if (isLoading) {
    // return <div>Chargement...</div>;
    
      return (
        <Box sx={{ width: 300 }}>
          <Skeleton animation="wave" variant="circular" width={40} height={40} />
          {/* <Skeleton animation="wave" variant="circular" width={40} height={40} /> */}
          {/* <Skeleton animation="wave" /> */}
          {/* <Skeleton animation={false} /> */}
        </Box>
      );

  }
  
  // if (isError) {
  //   window.location.reload();
  //   return <div>Une erreur s'est produite</div>;
  // }

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

  if (unUser) {
    return (
      <List component="nav" sx={{ p: 0 }}>
        <ListItemButton
          component={Link}
          to={`/entreprise/utilisateur/modif/${unUser.uuid}`}
          sx={listItemBtnSx}
        >
          <Box sx={iconBoxSx('rgba(99, 102, 241, 0.15)', '#818cf8')}>
            <EditIcon style={{ fontSize: '1.1rem' }} />
          </Box>
          <ListItemText
            primary="Modifier votre profil"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
          />
        </ListItemButton>

        {uuid && (
          <>
            {unUser.role === 1 && (
              <ListItemButton component={Link} to="/entreprise/personnel" sx={listItemBtnSx}>
                <Box sx={iconBoxSx('rgba(6, 182, 212, 0.15)', '#22d3ee')}>
                  <PeopleOutlineRoundedIcon style={{ fontSize: '1.1rem' }} />
                </Box>
                <ListItemText
                  primary="Voir les utilisateurs"
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </ListItemButton>
            )}

            {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && (
              <ListItemButton component={Link} to="/entreprise/client" sx={listItemBtnSx}>
                <Box sx={iconBoxSx('rgba(34, 197, 94, 0.15)', '#4ade80')}>
                  <PeopleOutlineRoundedIcon style={{ fontSize: '1.1rem' }} />
                </Box>
                <ListItemText
                  primary="Clients ou fournisseurs"
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </ListItemButton>
            )}

            {unUser.role === 1 && (
              <ListItemButton component={Link} to="/entreprise/detail" sx={listItemBtnSx}>
                <Box sx={iconBoxSx('rgba(168, 85, 247, 0.15)', '#c084fc')}>
                  <AddBusinessIcon style={{ fontSize: '1.1rem' }} />
                </Box>
                <ListItemText
                  primary="Détails entreprise"
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </ListItemButton>
            )}

            <ListItemButton onClick={logout} sx={{ ...listItemBtnSx, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)', transform: 'translateX(4px)' } }}>
              <Box sx={iconBoxSx('rgba(239, 68, 68, 0.15)', '#f87171')}>
                <LogoutIcon style={{ fontSize: '1.1rem' }} />
              </Box>
              <ListItemText
                primary="Déconnexion"
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#f87171' }}
              />
            </ListItemButton>
          </>
        )}
      </List>
    );
  }
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
