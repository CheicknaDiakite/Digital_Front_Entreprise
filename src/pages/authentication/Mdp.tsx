// material-ui
import Grid from '@mui/material/Grid';

// project import
import AuthWrapper from './AuthWrapper';
import AuthMdp from './auth-forms/AuthMdp';

// ================================|| LOGIN ||================================ //

export default function Mdp() {  
  
    return (
      <AuthWrapper>
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100%' }}>
          <AuthMdp />
        </Grid>
      </AuthWrapper>
    )
  }
