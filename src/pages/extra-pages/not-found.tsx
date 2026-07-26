import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import MainCard from '../../components/MainCard';

export default function NotFound() {
  return (
    <MainCard
      boxShadow
      sx={{
        maxWidth: 560,
        mx: 'auto',
        mt: { xs: 5, md: 9 },
        textAlign: 'center',
      }}
      contentSX={{ p: { xs: 3, sm: 5 } }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: 2 }}>
          Erreur 404
        </Typography>
        <Typography variant="h3">Page introuvable</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 390 }}>
          Le lien demandé est invalide ou la page a été déplacée. Retournez à votre espace de travail.
        </Typography>
        <Button component={Link} to="/" variant="contained" startIcon={<ArrowBackRoundedIcon />} sx={{ mt: 1 }}>
          Retour à l'accueil
        </Button>
      </Stack>
    </MainCard>
  );
}
