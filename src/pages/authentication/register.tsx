import { FC } from 'react';
import { Grid } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthRegister from './auth-forms/AuthRegister';

const Register: FC = () => {
  return (
    <AuthWrapper>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100%' }}>
        <AuthRegister />
      </Grid>
    </AuthWrapper>
  );
};

export default Register;
