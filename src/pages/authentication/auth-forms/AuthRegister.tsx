import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { useCreateUser } from '../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';

interface RegisterFormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  numero: string;
  password: string;
  passwordConfirm: string;
  pays: string;
}

const steps = ['Informations personnelles', 'Coordonnées', 'Sécurité'];

const AuthRegister: FC = () => {
  const { create } = useCreateUser();
  const countryOptions = countryList().getData();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      numero: '',
      password: '',
      passwordConfirm: '',
      pays: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await create(data);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  // Styles communs pour les champs
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: isMobile
        ? 'rgba(255,255,255,0.06)'
        : theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(248,250,252,1)',
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: isMobile ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)',
        transition: 'border-color 0.2s ease',
      },
      '&:hover fieldset': { borderColor: '#6366f1' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': {
      color: isMobile ? 'rgba(255,255,255,0.5)' : 'text.secondary',
      '&.Mui-focused': { color: '#6366f1' },
    },
    '& .MuiOutlinedInput-input': {
      color: isMobile ? '#f1f5f9' : 'text.primary',
    },
    '& .MuiFormHelperText-root': { color: '#ef4444' },
    '& .MuiSelect-icon': {
      color: isMobile ? 'rgba(255,255,255,0.4)' : 'text.secondary',
    },
  };

  const adornmentColor = isMobile ? 'rgba(255,255,255,0.35)' : '#6366f1';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 680,
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
          ...(isMobile
            ? {
                bgcolor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
              }
            : {
                bgcolor: '#fff',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              }),
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          {/* En-tête */}
          <Box sx={{ mb: 4 }}>
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
              <PersonAddAltIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: isMobile ? '#f1f5f9' : 'text.primary',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
              }}
            >
              Créer un compte
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: isMobile ? 'rgba(255,255,255,0.45)' : 'text.secondary' }}
            >
              Rejoignez GestStocks et gérez vos stocks simplement
            </Typography>
          </Box>

          {/* Indicateur d'étapes (décoratif) */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mb: 4,
              flexWrap: 'wrap',
            }}
          >
            {steps.map((step, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  bgcolor: isMobile ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '20px',
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 13, color: '#818cf8' }} />
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isMobile ? '#a5b4fc' : '#6366f1',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {errors.root && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: '12px',
                    ...(isMobile && { bgcolor: 'rgba(239,68,68,0.12)', color: '#fca5a5' }),
                  }}
                >
                  {errors.root.message}
                </Alert>
              )}

              {/* Section 1 : Informations personnelles */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isMobile ? '#a5b4fc' : '#6366f1',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    mb: 1.5,
                  }}
                >
                  Informations personnelles
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nom"
                      placeholder="Votre nom"
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                      {...register('last_name', {
                        required: 'Le nom est requis',
                        minLength: { value: 2, message: 'Min 2 caractères' }
                      })}
                      fullWidth
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Prénom"
                      placeholder="Votre prénom"
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      {...register('first_name', {
                        required: 'Le prénom est requis',
                        minLength: { value: 2, message: 'Min 2 caractères' }
                      })}
                      fullWidth
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Section 2 : Coordonnées */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isMobile ? '#a5b4fc' : '#6366f1',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    mb: 1.5,
                  }}
                >
                  Coordonnées
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Adresse email"
                      type="email"
                      placeholder="exemple@email.com"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...register('email', {
                        required: "L'email est requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Adresse email invalide'
                        }
                      })}
                      fullWidth
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Numéro de téléphone"
                      placeholder="Ex: 00223..."
                      error={!!errors.numero}
                      helperText={errors.numero?.message}
                      {...register('numero', {
                        required: 'Le numéro est requis',
                        pattern: {
                          value: /^[+]?[0-9]{8,15}$/,
                          message: 'Format invalide'
                        }
                      })}
                      onInput={(e) => {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        const cleaned = val.replace(/\s+/g, '');
                        if (cleaned !== val) {
                          setValue('numero', cleaned, { shouldValidate: true, shouldDirty: true });
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      disabled={isSubmitting}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.pays} sx={fieldSx}>
                      <InputLabel>Pays</InputLabel>
                      <Select
                        {...register('pays', { required: 'Le pays est requis' })}
                        label="Pays"
                        disabled={isSubmitting}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 280,
                              borderRadius: '12px',
                              bgcolor: isMobile ? '#1e1b4b' : '#fff',
                            },
                          },
                        }}
                        startAdornment={
                          <InputAdornment position="start" sx={{ ml: 0.5 }}>
                            <PublicOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        }
                      >
                        {countryOptions.map((option) => (
                          <MenuItem
                            key={option.value}
                            value={option.label}
                            sx={{
                              fontSize: '0.88rem',
                              ...(isMobile && { color: '#e2e8f0', '&:hover': { bgcolor: 'rgba(99,102,241,0.2)' } }),
                            }}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.pays && <FormHelperText>{errors.pays.message}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Section 3 : Sécurité */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isMobile ? '#a5b4fc' : '#6366f1',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    mb: 1.5,
                  }}
                >
                  Sécurité
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      {...register('password', {
                        required: 'Requis',
                        minLength: { value: 6, message: 'Min 6 caractères' }
                      })}
                      fullWidth
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
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
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirmer le mot de passe"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.passwordConfirm}
                      helperText={errors.passwordConfirm?.message}
                      {...register('passwordConfirm', {
                        required: 'Requis',
                        validate: value =>
                          value === password || 'Les mots de passe ne correspondent pas'
                      })}
                      fullWidth
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: adornmentColor, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(prev => !prev)}
                              edge="end"
                              size="small"
                              sx={{ color: isMobile ? 'rgba(255,255,255,0.4)' : 'text.secondary' }}
                            >
                              {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Bouton inscription */}
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
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Créer mon compte"}
              </Button>
            </Stack>
          </form>

          {/* Séparateur */}
          <Divider
            sx={{
              my: 3,
              '&::before, &::after': {
                borderColor: isMobile ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
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

          {/* Lien connexion */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8 }}>
            <Typography
              variant="body2"
              sx={{ color: isMobile ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontSize: '0.88rem' }}
            >
              Vous avez déjà un compte ?
            </Typography>
            <Typography
              component={Link}
              to="/auth/login"
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
              Se connecter →
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthRegister;
