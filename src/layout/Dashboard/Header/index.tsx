import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar, { AppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import backgroundImage from '../../../../public/assets/img/img.jpg'
// project import
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';

import { handlerDrawerOpen, useGetMenuMaster } from '../../../api/menu';

// assets
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //
interface AppBarStyledProps extends AppBarProps {
  open?: boolean;
}
export default function Header() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isEntreprise = location.pathname === '/entreprise';

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const appBarCommonSx = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    borderBottom: `1px solid ${theme.palette.divider}`,
    // background with darker overlay and blend for better contrast
    backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundBlendMode: 'multiply',
    backdropFilter: 'blur(4px)',
  };

  // common header
  const mainHeader = (
    <Toolbar>
      {/* bouton gauche */}
      {isHome ? null : isEntreprise ? (
        <IconButton
          disableRipple
          aria-label="open drawer"
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          edge="start"
          color="secondary"
          className='text-white border-indigo-600 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 border border-dashed animate-border-rotate rounded-lg'
          // sx={{ color: 'text.primary', bgcolor: drawerOpen ? iconBackColorOpen : iconBackColor, ml: { xs: 0, lg: -2 } }}
        >
          {!drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </IconButton>
      ) : (
        <IconButton
          disableRipple
          aria-label="go back"
          onClick={() => navigate(-1)}
          edge="start"
          color="secondary"
          className='text-white border-indigo-600 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 border border-dashed animate-border-rotate rounded-lg'
          // sx={{ color: 'text.primary', bgcolor: iconBackColor, ml: { xs: 0, lg: -2 } }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}      
      
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar: AppBarStyledProps = {
    position: 'fixed',
    color: 'transparent', // Utilisez une couleur valide ici
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    open: drawerOpen // Ajoutez l'état 'open' si nécessaire
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled {...appBar} sx={appBarCommonSx}>
          
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar} sx={appBarCommonSx}>{mainHeader}</AppBar>
      )}
    </>
  );
}
