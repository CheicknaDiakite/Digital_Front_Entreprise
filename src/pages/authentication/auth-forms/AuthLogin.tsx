import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Stack,
  Card,
  TextField,
  CircularProgress,
  Box,
  CardContent,
  Avatar,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useLoginUser } from '../../../usePerso/fonction.user';
import Bienvenue from '../../../_components/Card/Bienvenue';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

// Note: Removed Bienvenue and scrolling text for a cleaner, more professional look.

interface LoginFormData {
  username: string;
  password: string;
}

const AuthLogin: FC = () => {
  const { login, googleLogin } = useLoginUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  useEffect(() => {
    const checkRegistrationSuccess = () => {
      const isSuccess = localStorage.getItem('inscriptionSuccess') === 'true';
      if (isSuccess) {
        toast.success('Inscription réussie', { duration: 5000 });
        localStorage.removeItem('inscriptionSuccess');
      }
    };
    checkRegistrationSuccess();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Removed artificial delay for snappy UX
      reset();
    } catch (error) {
      // Handled by interceptors mainly, but safe backup
      console.error(error);
    }
  };

  return (
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
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Connexion
            </Typography>

            <Bienvenue />
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {errors.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}

              <TextField
                label="Nom d'utilisateur ou Numero de telephone"
                placeholder="Entrez votre identifiant ou numero de telephone"
                error={!!errors.username}
                helperText={errors.username?.message}
                {...register('username', {
                  required: 'Ce champ est requis'
                })}
                fullWidth
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password', {
                  required: 'Ce champ est requis'
                })}
                fullWidth
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                        color='info'
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                variant="outlined"
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                  label="Se souvenir de moi"
                />
                <Typography
                  component={Link}
                  to="/auth/mot_de_passe_oublier"
                  variant="body2"
                  color="primary"
                  sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                >
                  Mot de passe oublié ?
                </Typography>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="text.secondary">
              OU
            </Typography>
          </Divider>

          {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <GoogleLogin
              onSuccess={(credentialResponse: CredentialResponse) => {
                if (credentialResponse.credential) {
                  googleLogin(credentialResponse.credential);
                }
              }}
              onError={() => {
                toast.error('Échec de la connexion Google');
              }}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </Box> */}

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Vous n'avez pas de compte ?
            </Typography>
            <Typography
              component={Link}
              to="/auth/register"
              variant="subtitle2"
              color="primary"
              sx={{ textDecoration: 'none', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
            >
              S'inscrire
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthLogin;
