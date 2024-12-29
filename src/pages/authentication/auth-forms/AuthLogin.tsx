import PropTypes from 'prop-types';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Card, TextField } from '@mui/material';
import { FormType } from '../../../typescript/FormType';
import { useLoginUser } from '../../../usePerso/fonction.user';
import toast from 'react-hot-toast';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin() {

  // const {login} = useAuth()
  const {login} = useLoginUser()

  const [formVal, setFormValues] = useState<FormType>({
    username: '',
    password: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formVal,
      [name]: value,
    });
  };

  let toastId: string | undefined;

  const handle = () => {
    // Affiche le toast et stocke son ID
    toastId = toast.loading("Chargement ...");

    // Ferme automatiquement le toast après 1 minute
    setTimeout(() => {
      if (toastId) {
        toast.dismiss(toastId); // Supprime le toast
      }
    }, 6500); // 1 minute en millisecondes
  };

  useEffect(() => {
    // Nettoie le toast lorsque le composant est démonté
    return () => {
      if (toastId) {
        toast.dismiss(toastId); // Supprime le toast
      }
    };
  }, []);


  useEffect(() => {
    // Vérifie si l'inscription a réussi
    if (localStorage.getItem("inscriptionSuccess") === "true") {
      // Affiche les toasts
      toast.success("Inscription réussie");
      toast.success("Un mail vous a été envoyé");

      // Supprime l'indicateur pour éviter les répétitions
      localStorage.removeItem("inscriptionSuccess");
    }
  }, []);


  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(formVal)

    setFormValues({
      username: '',
      password: '',
    })
  };

  return (
    <>
      <Card variant="outlined" sx={{ boxShadow: 0, bgcolor: 'transparent' }}>
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
          <Stack spacing={2} margin={2}>          
            <TextField variant="outlined" label="Nom d'utilisateur ou Numero" value={formVal.username} name='username' onChange={onChange}></TextField>
            <TextField variant="outlined" label="Mot de passe" type='password' value={formVal.password} name='password' onChange={onChange}></TextField>
            <Button type="submit" color="success" variant="outlined" onClick={handle} >connecter</Button>
          </Stack>
        </form>
      </Card>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
