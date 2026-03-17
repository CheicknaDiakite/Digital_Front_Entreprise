// material-ui
import Grid from '@mui/material/Grid';

// project import
import AuthWrapper from './AuthWrapper';
import AuthMdpUpdate from './auth-forms/AuthMdpUpdate';

// ================================|| LOGIN ||================================ //

export default function MdpUpdate() {  
  
    return (
      <AuthWrapper>
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100%' }}>        
          <AuthMdpUpdate />      
        </Grid>
      </AuthWrapper>
    )
  }
