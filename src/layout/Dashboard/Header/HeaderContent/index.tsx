import Box from '@mui/material/Box';

// project import
import Search from './Search';
import Notification from './Notification';
import Profile from './Profile';
import { useStoreUuid } from '../../../../usePerso/store';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const uuid = useStoreUuid((state) => state.selectedId);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        justifyContent: 'space-between', 
        ml: { xs: 0.5, sm: 2 },
        minWidth: 0
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, mr: { xs: 1, sm: 2 } }}>
        <Search />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto', flexShrink: 0 }}>
        {uuid && <Notification />}
        <Profile />
      </Box>
    </Box>
  );
}
