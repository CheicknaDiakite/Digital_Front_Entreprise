import { FC } from 'react';
import { Grid, Box } from '@mui/material';
// import { TypeAnimation } from 'react-type-animation';
import AuthFooter from '../../components/cards/AuthFooter';
import Logo from '../../components/logo';
// import AuthCard from './AuthCard';
import AuthBackground from '../../assets/images/auth/AuthBackground';
import { ChildrenProps } from '../../typescript/Account';

// const CONTACT_MESSAGES = [
//   "En cas de besoin, contacter : +223 91 15 48 34",
//   "En cas de souci, contacter : Pour plus d'information",
//   "En cas de problème, contacter : +223 91 15 48 34",
//   "En cas de question, contacter : Pour plus d'information"
// ] as const;

// const ContactAnimation: FC = () => (
//   <Box 
//     sx={{ 
//       display: 'flex', 
//       justifyContent: 'center',
//       mx: 5,
//       typography: {
//         fontSize: { xs: '1.25rem', sm: '1.5rem' },
//         fontWeight: 800
//       }
//     }}
//   >
//     <Typography
//       component="span"
//       className='rounded border-x-2 animate-border-rotate'
//       variant="h5"
//       sx={{
//         backgroundImage: 'linear-gradient(to right, #60A5FA, #86EFAC)',
//         backgroundClip: 'text',
//         // color: 'transparent',
//         // borderRadius: 1,
//         // border: 2,
//         // borderColor: 'primary.main',
//         px: 2,
//         py: 1,
//         // animation: 'border-rotate 3s linear infinite',
//         // '@keyframes border-rotate': {
//         //   '0%': {
//         //     borderColor: '#60A5FA'
//         //   },
//         //   '50%': {
//         //     borderColor: '#86EFAC'
//         //   },
//         //   '100%': {
//         //     borderColor: '#60A5FA'
//         //   }
//         // }
//       }}
//     >
//       <TypeAnimation
//         sequence={CONTACT_MESSAGES.map(msg => [msg, 1000]).flat()}
//         wrapper="span"
//         speed={50}
//         style={{ display: 'inline-block' }}
//         repeat={Infinity}
//       />
//     </Typography>
//   </Box>
// );

const AuthWrapper: FC<ChildrenProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AuthBackground />
      <Grid 
        container 
        direction="column" 
        justifyContent="flex-end" 
        sx={{ minHeight: '100vh' }}
      >
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
            sx={{ 
              minHeight: { 
                xs: 'calc(100vh - 210px)', 
                sm: 'calc(100vh - 134px)', 
                md: 'calc(100vh - 112px)' 
              } 
            }}
          >
            {/* <ContactAnimation /> */}
            <Grid item >
              {/* <AuthCard> */}
                {children}
              {/* </AuthCard> */}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuthWrapper;
