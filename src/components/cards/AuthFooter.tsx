// material-ui
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import PdfViewer from '../../usePerso/PdfFile';
import url from "../../../public/assets/file/dd.pdf"

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  // Modal 
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const [openM, setOpenM] = useState(false);

  const handleClickOpen = () => {
    setOpenM(true);
  };

  const handleClose = () => {
    setOpenM(false);
  };
  // Fin modal
  return (
    <Container maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        spacing={2}
        textAlign={{ xs: 'center', sm: 'inherit' }}
      >
        <Typography variant="subtitle2" color="secondary">
          Diakite Digital{' '}
          <Typography component={Link} variant="subtitle2" onClick={handleClickOpen} target="_blank" underline="hover">
            help ?
          </Typography>
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} textAlign={{ xs: 'center', sm: 'inherit' }}>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://diakitedigital.com"
            target="_blank"
            underline="hover"
          >
            +223 
          </Typography>
          
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://diakitedigital.com"
            target="_blank"
            underline="hover"
          >
            Diakite Digital
          </Typography>
        </Stack>
      </Stack>

      <Dialog
        fullScreen={fullScreen}
        open={openM}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Documentation du Logiciel de Gestion de Stock de Diakite Digital qui contient les informations pour mieux s'en sortir
        </DialogTitle>
        <DialogContent>
          <DialogContentText >
            {/* Documentation du Logiciel de Gestion de Stock de Diakite Digital */}
            <PdfViewer fileUrl={url} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
