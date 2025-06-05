import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Stack, Typography } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthRegister from './auth-forms/AuthRegister';
import Bienvenue from '../../_components/Card/Bienvenue';

const Register: FC = () => {
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
              Inscription
            </Typography>
            <Typography
              component={Link}
              to="/auth/login"
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
              Connexion ?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthRegister />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Register;
