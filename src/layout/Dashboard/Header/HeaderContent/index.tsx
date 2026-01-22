// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';

// project import
import Search from './Search';
import Notification from './Notification';
import Profile from './Profile';
import { useStoreUuid } from '../../../../usePerso/store';

// project import

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const uuid = useStoreUuid((state) => state.selectedId)
  return (
    <>
      {!downLG && <Search />}
      {downLG && <Search />}
      {/* {downLG && <Box sx={{ width: '100%', ml: 1 }} />} */}
      {uuid &&       
        <Notification />
      }
      {!downLG && <Profile />}
      {downLG && <Profile />}
      {/* {downLG && <MobileSection />} */}
    </>
  );
}
