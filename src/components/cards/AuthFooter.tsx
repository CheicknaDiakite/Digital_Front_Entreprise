// material-ui
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          py: { xs: 2.5, md: 3 },
          px: { xs: 1, md: 2 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'center', sm: 'space-between' }}
          alignItems={{ xs: 'center', sm: 'center' }}
          spacing={{ xs: 2, sm: 3 }}
          textAlign={{ xs: 'center', sm: 'inherit' }}
          sx={{ flexWrap: 'wrap' }}
        >
          <Typography
            variant="subtitle2"
            color="secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' } }}
          >
            Gestion de Stock{' '}
            <Typography
              component={Link}
              variant="subtitle2"
              href="https://documentation.gest-stocks.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: 'primary.main', fontSize: { xs: '0.9rem', md: '0.95rem' } }}
            >
              Avez-vous besoin d'aide ?
            </Typography>
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2.5 }}
            alignItems="center"
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
            sx={{ flexWrap: 'wrap' }}
          >
            <a
              href="https://wa.me/22391154834"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.24)',
                  borderRadius: '999px',
                  px: { xs: 1.8, md: 2.4 },
                  py: { xs: 0.8, md: 1 },
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 18px rgba(34, 197, 94, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(34, 197, 94, 0.16)',
                    borderColor: 'rgba(34, 197, 94, 0.38)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <WhatsAppIcon sx={{ color: '#22c55e', fontSize: { xs: 18, md: 20 } }} />
                <Typography sx={{ color: '#22c55e', fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 700, letterSpacing: 0.3 }}>
                  +223 91 15 48 34
                </Typography>
              </Box>
            </a>

            <Typography
              variant="subtitle2"
              component={Link}
              href="https://diakitedigital.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.9rem', md: '0.95rem' },
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Diakite Digital
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
