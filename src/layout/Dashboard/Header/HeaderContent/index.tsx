import Box from '@mui/material/Box';

// project import
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
        justifyContent: 'flex-end', 
        ml: { xs: 0.5, sm: 2 },
        minWidth: 0
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto', flexShrink: 0 }}>
        {uuid && <Notification />}
        <Profile />
      </Box>
    </Box>
  );
}

