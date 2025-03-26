import { Link } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import AuthWrapper from './AuthWrapper';
import AuthLogin from './auth-forms/AuthLogin';
import Bienvenue from '../../_components/Card/Bienvenue';


// ================================|| LOGIN ||================================ //

export default function Login() {
    return (
      <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Bienvenue />
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h4">Connexion</Typography>
            <Typography component={Link} to="/auth/register" variant="h4" sx={{ textDecoration: 'none' }} color="primary">
              Inscription ?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
        <Typography component={Link} to="/auth/mot_de_passe_oublier" className='mx-5' sx={{ textDecoration: 'none' }} color="primary">
          Mot de passe oublier ?
        </Typography>
      </Grid>
      </AuthWrapper>
    )
}
