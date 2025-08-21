import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Button, 
  Card, 
  FormControl, 
  FormHelperText,
  InputLabel, 
  MenuItem, 
  Select, 
  Stack, 
  TextField,
  CircularProgress,
  Box
} from '@mui/material';
import { useCreateUser } from '../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import toast from 'react-hot-toast';

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

const AuthRegister: FC = () => {
  const { create } = useCreateUser();
  const countryOptions = countryList().getData();

  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await create(data);
      await delay(4000);
      
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      );
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        boxShadow: 0, 
        bgcolor: 'transparent',
        '& .MuiTextField-root': { mb: 2 }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        {isSubmitting && (
          <Box className="flex justify-center items-center pb-4">
            <CircularProgress size={36} color="primary" />
          </Box>
        )}
        <Stack spacing={2}>
          <TextField
            label="Nom"
            error={!!errors.last_name}
            helperText={errors.last_name?.message || ''}
            {...register('last_name', { 
              required: 'Le nom est requis',
              minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
            })}
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <TextField
            label="Prénom"
            error={!!errors.first_name}
            helperText={errors.first_name?.message || ''}
            {...register('first_name', { 
              required: 'Le prénom est requis',
              minLength: { value: 2, message: 'Le prénom doit contenir au moins 2 caractères' }
            })}
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <TextField
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message || ''}
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
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <TextField
            label="Numéro de téléphone"
            error={!!errors.numero}
            helperText={errors.numero?.message || ''}
            {...register('numero', {
              required: 'Le numéro est requis',
              pattern: { 
                value: /^[+]?[0-9]{8,15}$/, 
                message: 'Format de numéro invalide' 
              }
            })}
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <FormControl fullWidth error={!!errors.pays}>
            <InputLabel>Pays</InputLabel>
            <Select
              {...register('pays', { required: 'Le pays est requis' })}
              label="Pays"
              disabled={isSubmitting}
            >
              {countryOptions.map((option) => (
                <MenuItem key={option.value} value={option.label}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.pays && (
              <FormHelperText error>{errors.pays.message}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Mot de passe"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message || ''}
            {...register('password', {
              required: 'Le mot de passe est requis',
              minLength: { 
                value: 6, 
                message: 'Le mot de passe doit contenir au moins 6 caractères' 
              },
              // pattern: {
              //   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
              //   message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
              // }
            })}
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <TextField
            label="Confirmer le mot de passe"
            type="password"
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message || ''}
            {...register('passwordConfirm', {
              required: 'La confirmation du mot de passe est requise',
              validate: value => 
                value === password || 'Les mots de passe ne correspondent pas'
            })}
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              sx: {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

export default AuthRegister;
