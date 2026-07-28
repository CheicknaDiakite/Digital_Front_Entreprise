import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// project import
import Search from './Search';
import Notification from './Notification';
import Profile from './Profile';
import { useStoreUuid } from '../../../../usePerso/store';
import { useThemeMode } from '../../../../themes/ThemeModeContext';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', ml: { xs: 1, sm: 2 } }}>
      <Search />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto' }}>
        <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
        {uuid && <Notification />}
        <Profile />
      </Box>
    </Box>
  );
}
