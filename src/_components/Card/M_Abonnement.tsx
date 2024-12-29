import { Box, Typography } from '@mui/material'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';

export default function M_Abonnement() {
  return (
    <Box sx={{ mt: 2 }} className="m-5">
        <Typography variant="h5" color="error">
            L'abonnement de cet Entreprise a expiré !
        </Typography>
        <Typography variant="h6" component="div">
            <a
            href="https://wa.me/91154834"
            style={{ textDecoration: 'none', color: 'inherit' }}
            target="_blank"
            rel="noopener noreferrer"
            >
            contacter-nous sur WhatsApp&nbsp;
            <LocalPhoneIcon fontSize="medium" color="primary" />
            </a>
        </Typography>
    </Box>
  )
}
