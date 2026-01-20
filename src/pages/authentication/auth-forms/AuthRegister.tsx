import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  CircularProgress,
  Box,
  Avatar,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Grid
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

import { useCreateUser } from '../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import toast from 'react-hot-toast';
import Bienvenue from '../../../_components/Card/Bienvenue';

interface RegisterFormData {
  username: string; // Not in form visually based on previous code, but likely needed by backend. Assuming email/phone or auto-generated? Or maybe removed? Using previous fields.
  // Actually, previous code had username in interface but not in visual form. I will keep it in interface but check if it was used.
  // Looking at the previous form, "last_name", "first_name", "email", "numero", "pays", "password", "passwordConfirm" were present.
  // "username" was in defaultValues but not in the JSX. I will keep it that way or remove it if unused.
  // Wait, backend usually needs username. It might be auto-generated from email.
  first_name: string;
  last_name: string;
  email: string;
  numero: string;
  password: string;
  passwordConfirm: string;
  pays: string;
}

const AuthRegister: FC = () => {
  const { create } = useCreateUser();
  const countryOptions = countryList().getData();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Removed delay function for better UX

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await create(data);
      // Removed artificial delay
      reset();
    } catch (error) {
      // Error handled by interceptor or here as fallback
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 800, // Slightly wider for double columns
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
              <PersonAddAltIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Créer un compte
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Bienvenue />
            </Box>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Global Error Alert if needed */}
              {errors.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}

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
                          <BadgeOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
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
                          <PersonOutlineIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="exemple@email.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email', {
                      required: 'L\'email est requis',
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
                          <EmailOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
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
                          <PhoneOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.pays}>
                    <InputLabel>Pays</InputLabel>
                    <Select
                      {...register('pays', { required: 'Le pays est requis' })}
                      label="Pays"
                      disabled={isSubmitting}
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <PublicOutlinedIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      {countryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.label}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.pays && (
                      <FormHelperText>{errors.pays.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

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
                          <LockOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(prev => !prev)}
                            edge="end"
                            color='info'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
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
                      validate: value => value === password || 'Les mots de passe ne correspondent pas'
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
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            edge="end"
                            color='info'
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

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
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="text.secondary">
              OU
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?
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
  );
};

export default AuthRegister;
