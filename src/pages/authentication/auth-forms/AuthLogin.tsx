import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Stack, Card, TextField, CircularProgress, Box } from '@mui/material';
import toast from 'react-hot-toast';
import { useLoginUser } from '../../../usePerso/fonction.user';

interface LoginFormData {
  username: string;
  password: string;
}

const AuthLogin: FC = () => {
  const { login } = useLoginUser();

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
        toast.success('Inscription réussie');
        toast.success('Un mail vous a été envoyé');
        localStorage.removeItem('inscriptionSuccess');
      }
    };

    checkRegistrationSuccess();
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      await delay(4000);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la connexion');
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
            label="Nom d'utilisateur ou Numéro"
            error={!!errors.username}
            helperText={errors.username?.message || ''}
            {...register('username', { 
              required: 'Le nom d\'utilisateur est requis'
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
            label="Mot de passe"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message || ''}
            {...register('password', { 
              required: 'Le mot de passe est requis'
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
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

export default AuthLogin;
