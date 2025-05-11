import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Card, TextField } from '@mui/material';
import toast from 'react-hot-toast';
import { useLoginUser } from '../../../usePerso/fonction.user';

// Définition du type de formulaire
type FormType = {
  username: string;
  password: string;
};

export default function AuthLogin() {
  const { login } = useLoginUser();

  // Utilisation de react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormType>();

  let toastId: string | undefined;

  const handle = () => {
    // Affiche le toast et stocke son ID
    toastId = toast.loading("Chargement ...");

    // Ferme automatiquement le toast après 6.5 secondes
    setTimeout(() => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    }, 6500);
  };

  useEffect(() => {
    // Nettoie le toast lorsque le composant est démonté
    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  useEffect(() => {
    // Vérifie si l'inscription a réussi
    if (localStorage.getItem("inscriptionSuccess") === "true") {
      toast.success("Inscription réussie");
      toast.success("Un mail vous a été envoyé");
      localStorage.removeItem("inscriptionSuccess");
    }
  }, []);

  // Fonction de soumission du formulaire
  const onSubmit = (data: FormType) => {
    
    login(data);
    reset(); // Réinitialise les valeurs du formulaire
  };
  
  return (
    <Card variant="outlined" sx={{ boxShadow: 0, bgcolor: 'transparent' }}>
      <form
        className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={2} margin={2}>
          <TextField
            // required
            variant="outlined"
            label="Nom d'utilisateur ou Numero"
            error={!!errors.username}
            helperText={errors.username ? 'Ce champ est requis' : ''}
            {...register('username', { required: true })}
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red",
              },
            }}
          />
          <TextField
            // required
            variant="outlined"
            label="Mot de passe"
            type="password"
            error={!!errors.password}
            helperText={errors.password ? 'Ce champ est requis' : ''}
            {...register('password', { required: true })}
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red",
              },
            }}
          />
          <Button
            type="submit"
            color="success"
            variant="outlined"
            onClick={handle}
          >
            Connecter
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
