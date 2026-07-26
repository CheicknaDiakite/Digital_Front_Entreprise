// material-ui
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  
  return (
    <Container maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        spacing={2}
        textAlign={{ xs: 'center', sm: 'inherit' }}
      >
        <Typography variant="subtitle2" color="secondary">
          Gestion de Stock{' '}
          <Typography component={Link} variant="subtitle2" href="https://documentation.gest-stocks.com" target="_blank" rel="noopener noreferrer" underline="hover">
            Avez-vous besoin d'aide ?
          </Typography>
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} textAlign={{ xs: 'center', sm: 'inherit' }}>
          <Typography
            variant="subtitle2"
            color="primary"
            
          >
            <a
              href="https://wa.me/22391154834"
              style={{ textDecoration: 'none', color: 'inherit' }}
              target="_blank"
              rel="noopener noreferrer"
              >
              {" "}+223 91 15 48 34 
            </a>                  
              
          </Typography>
          
          <Typography
            variant="subtitle2"
            className="text-slate-300"
            component={Link}
            href="https://diakitedigital.com"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            Gestion de Stock
          </Typography>
        </Stack>
      </Stack>

    </Container>
  );
}
