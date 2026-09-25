import { CircularProgress, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useFetchUser } from '../usePerso/fonction.user';

export default function TermsGuard({ children }: { children: JSX.Element }) {
  const { unUser, us, isLoading } = useFetchUser();
  const location = useLocation();

  if (isLoading) return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  
  const currentUser = us || unUser;
  if (currentUser?.conditions_a_accepter) {
    const fromPath = (!location.pathname || location.pathname.includes('conditions-utilisation'))
      ? '/'
      : location.pathname;
    return <Navigate to="/conditions-utilisation" replace state={{ from: fromPath }} />;
  }
  return children;
}
