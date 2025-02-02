import PropTypes from 'prop-types';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project import
import AuthFooter from '../../components/cards/AuthFooter';
import Logo from '../../components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from '../../assets/images/auth/AuthBackground';
import { ChildrenProps } from '../../typescript/Account';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }: ChildrenProps) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AuthBackground />
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
          <Logo />
        </Grid>
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
          >
            <div className=" flex justify-center mx-5 text-2xl font-extrabold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
                En cas d'incompréhension contacter :
                <a
                href="https://wa.me/91154834"
                style={{ textDecoration: 'none', color: 'inherit' }}
                target="_blank"
                rel="noopener noreferrer"
                >
                {" "}+223 91 15 48 34 {" "}
                </a>                  
                sur whatsapp 
              </span>
            </div>
            <Grid item>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </Box>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
