import PropTypes from 'prop-types';
import { ChangeEvent, FormEvent, useState } from 'react';
// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Card, TextField, CircularProgress, Box, CardContent, Typography, Divider, Avatar } from '@mui/material';
import { useForgotUser } from '../../../usePerso/fonction.user';
import { Link } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import Bienvenue from '../../../_components/Card/Bienvenue';

// ============================|| JWT - FORGOT PASSWORD ||============================ //

export default function AuthMdp() {

  const { forgout, isPending } = useForgotUser();

  const [email, setEmail] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      forgout({ email });
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 450,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <LockResetIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Mot De Passe Oublier
              </Typography>

              <Bienvenue />
            </Box>

            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
              <Stack spacing={2} margin={2}>
                <TextField
                  variant="outlined"
                  label="Votre email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  disabled={isPending}
                />
                <Button
                  type="submit"
                  color="success"
                  variant="contained"
                  disabled={isPending || !email}
                  startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                  {isPending ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 4 }}>
              <Typography variant="caption" color="text.secondary">
                OU
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              
              <Typography
                component={Link}
                to="/auth/register"
                variant="subtitle2"
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
              >
                S'inscrire
              </Typography>
              <Typography variant="caption" color="text.secondary">
                OU
              </Typography>

              <Typography
                component={Link}
                to="/auth/login"
                variant="subtitle2"
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
              >
                Se connecter
              </Typography>
            </Box>

          </CardContent>
        </Card>
      </Box>

    </>
  );
}

AuthMdp.propTypes = { isDemo: PropTypes.bool };
