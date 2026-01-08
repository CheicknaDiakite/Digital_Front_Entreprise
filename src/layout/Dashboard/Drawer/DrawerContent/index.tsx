// project import

// import Navigation from './Navigation';
import { Box, CardContent, IconButton, Typography } from '@mui/material';
import SimpleBar from '../../../../components/third-party/SimpleBar';
import NavSide from './Navigation/NavSide';
import { Link } from 'react-router-dom';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchEntreprise } from '../../../../usePerso/fonction.user';
import { BASE } from '../../../../_services/caller.service';
import { handlerDrawerOpen, useGetMenuMaster } from '../../../../api/menu';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const logoUrl = unEntreprise.image ? BASE(unEntreprise.image) : "/icon-192x192.png";
  
  return (
    <>
      <SimpleBar sx={{ 
        '& .simplebar-content': { display: 'flex', flexDirection: 'column' },
        background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${logoUrl}) center/cover no-repeat`,
      }}>
        {/* <Navigation /> */}
        {/* header/logo : logo + nom (tronqué si long) et bouton en fin */}
        <CardContent
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            // classes visuelles existantes conservées via sx pour meilleure cohérence MUI
            background: 'linear-gradient(90deg, rgba(59,130,246,0.85), rgba(16,185,129,0.85))',
            color: 'common.white',
            borderRadius: 2,
            m: 2
          }}
        >
          {/* zone cliquable : logo + nom (navigue vers /) */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
            <img
              src={logoUrl}
              alt={unEntreprise.nom ? unEntreprise.nom : "Gest_Stocks"}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }}
            />

            <Box sx={{ ml: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'common.white'
                }}
                title={unEntreprise.nom}
              >
                {unEntreprise.nom ? unEntreprise.nom : "Gest Stocks"}
              </Typography>
            </Box>
          </Link>

          {/* bouton en fin, toujours aligné à droite */}
          <IconButton
            disableRipple
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => handlerDrawerOpen(!drawerOpen)}
            sx={{
              ml: 'auto',
              color: 'common.white',
              bgcolor: 'rgba(255,255,255,0.06)',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              flexShrink: 0
            }}
          >
            {!drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </IconButton>
        </CardContent>
       
        <NavSide />
        {/* <NavCard /> */}
      </SimpleBar>
    </>
  );
}
