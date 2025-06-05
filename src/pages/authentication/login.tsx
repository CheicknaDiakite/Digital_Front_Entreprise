import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Stack, Typography } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthLogin from './auth-forms/AuthLogin';
import Bienvenue from '../../_components/Card/Bienvenue';

const Login: FC = () => {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Bienvenue />
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="baseline" 
            sx={{ 
              mb: { xs: -0.5, sm: 0.5 } 
            }}
          >
            <Typography variant="h4" color="text.primary">
              Connexion
            </Typography>
            <Typography
              component={Link}
              to="/auth/register"
              variant="h4"
              sx={{ 
                textDecoration: 'none',
                transition: 'color 0.3s',
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
              color="primary"
            >
              Inscription ?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
        <Grid item xs={12}>
          <Typography
            component={Link}
            to="/auth/mot_de_passe_oublier"
            sx={{ 
              textDecoration: 'none',
              ml: 2,
              transition: 'color 0.3s',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
            color="primary"
          >
            Mot de passe oublié ?
          </Typography>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
