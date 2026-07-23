import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';

// project import
import Search from './Search';
import Notification from './Notification';
import Profile from './Profile';
import { useStoreUuid } from '../../../../usePerso/store';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const uuid = useStoreUuid((state) => state.selectedId);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', ml: { xs: 1, sm: 2 } }}>
      <Search />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto' }}>
        {uuid && <Notification />}
        <Profile />
      </Box>
    </Box>
  );
}
