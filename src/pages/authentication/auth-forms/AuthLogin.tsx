import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Stack,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useLoginUser } from '../../../usePerso/fonction.user';

interface LoginFormData {
  username: string;
  password: string;
}

const AuthLogin: FC = () => {
  const { login } = useLoginUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    const isSuccess = localStorage.getItem('inscriptionSuccess') === 'true';
    if (isSuccess) {
      toast.success('Inscription réussie', { duration: 5000 });
      localStorage.removeItem('inscriptionSuccess');
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  // Styles communs pour les champs
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: isMobile ? 'rgba(255,255,255,0.07)' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(248,250,252,1)',
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: isMobile ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        transition: 'border-color 0.2s ease',
      },
      '&:hover fieldset': {
        borderColor: '#6366f1',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6366f1',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      color: isMobile ? 'rgba(255,255,255,0.55)' : 'text.secondary',
      '&.Mui-focused': { color: '#6366f1' },
    },
    '& .MuiOutlinedInput-input': {
      color: isMobile ? '#f1f5f9' : 'text.primary',
    },
    '& .MuiFormHelperText-root': {
      color: '#ef4444',
    },
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 460,
        animation: 'fadeInUp 0.45s ease both',
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          // Sur mobile : glassmorphism sur fond sombre
          ...(isMobile
            ? {
                bgcolor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
              }
            : {
                bgcolor: '#fff',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              }),
        }}
      >
        <Box sx={{ p: { xs: 3.5, sm: 4.5, md: 5 } }}>
          {/* En-tête */}
          <Box sx={{ mb: 4 }}>
            {/* Icône de cadenas stylisée */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}
            >
              <LockOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: isMobile ? '#f1f5f9' : 'text.primary',
                mb: 0.5,
                fontSize: { xs: '1.6rem', sm: '1.9rem' },
              }}
            >
              Bon retour 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: isMobile ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
            >
              Connectez-vous à votre espace GestStocks
            </Typography>
          </Box>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {errors.root && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: '12px', ...(isMobile && { bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' }) }}
                >
                  {errors.root.message}
                </Alert>
              )}

              <TextField
                label="Identifiant ou numéro de téléphone"
                placeholder="Entrez votre identifiant"
                error={!!errors.username}
                helperText={errors.username?.message}
                {...register('username', { required: 'Ce champ est requis' })}
                fullWidth
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: isMobile ? 'rgba(255,255,255,0.4)' : '#6366f1', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={fieldSx}
              />

              <TextField
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password', { required: 'Ce champ est requis' })}
                fullWidth
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: isMobile ? 'rgba(255,255,255,0.4)' : '#6366f1', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                        size="small"
                        sx={{ color: isMobile ? 'rgba(255,255,255,0.4)' : 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                variant="outlined"
                sx={fieldSx}
              />

              {/* Options remember / forgot */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: isMobile ? 'rgba(255,255,255,0.3)' : 'action.disabled',
                        '&.Mui-checked': { color: '#6366f1' },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: isMobile ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.83rem' }}
                    >
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Typography
                  component={Link}
                  to="/auth/mot_de_passe_oublier"
                  variant="body2"
                  sx={{
                    color: '#818cf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.83rem',
                    '&:hover': { color: '#6366f1', textDecoration: 'underline' },
                    transition: 'color 0.2s ease',
                  }}
                >
                  Mot de passe oublié ?
                </Typography>
              </Box>

              {/* Bouton principal */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                endIcon={!isSubmitting && <ArrowForwardRoundedIcon />}
                sx={{
                  mt: 0.5,
                  py: 1.6,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 28px rgba(99,102,241,0.55)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0px)' },
                  '&.Mui-disabled': {
                    background: 'rgba(99,102,241,0.35)',
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Se connecter'}
              </Button>
            </Stack>
          </form>

          {/* Séparateur */}
          <Divider
            sx={{
              my: 3.5,
              '&::before, &::after': {
                borderColor: isMobile ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                color: isMobile ? 'rgba(255,255,255,0.3)' : 'text.disabled',
                fontWeight: 500,
                letterSpacing: 1,
              }}
            >
              OU
            </Typography>
          </Divider>

          {/* Lien inscription */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8 }}>
            <Typography
              variant="body2"
              sx={{ color: isMobile ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontSize: '0.88rem' }}
            >
              Pas encore de compte ?
            </Typography>
            <Typography
              component={Link}
              to="/auth/register"
              variant="body2"
              sx={{
                color: '#818cf8',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                '&:hover': { textDecoration: 'underline', color: '#6366f1' },
                transition: 'color 0.2s ease',
              }}
            >
              S'inscrire gratuitement →
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthLogin;
