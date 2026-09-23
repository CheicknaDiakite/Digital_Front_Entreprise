import { CircularProgress, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useFetchUser } from '../usePerso/fonction.user';

export default function TermsGuard({ children }: { children: JSX.Element }) {
  const { unUser, isLoading } = useFetchUser();
  const location = useLocation();

  if (isLoading) return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  if (unUser.conditions_a_accepter) {
    return <Navigate to="/conditions-utilisation" replace state={{ from: location.pathname }} />;
  }
  return children;
}
