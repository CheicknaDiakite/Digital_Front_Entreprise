import { ChangeEvent, useEffect, useState } from 'react';
// material-ui
import Button from '@mui/material/Button';

// third party
// assets
import { FormValueType } from '../../../typescript/FormType';
import { Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import { useCreateUser } from '../../../usePerso/fonction.user';
import countryList from 'react-select-country-list';
import toast from 'react-hot-toast';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {

  // const {create} = useUtilisateur()
  const {create} = useCreateUser()

  const options = countryList().getData();
  
  const [formValues, setFormValues] = useState<FormValueType>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    numero: 0,
    password: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  let toastId: string | undefined;

  const handle = () => {
    // Affiche le toast et stocke son ID
    toastId = toast.loading("Chargement pour vous envoyer un email ...");

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


  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formValues.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
    } else if (formValues.password !== formValues.passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas");
    } else {
      // Action de création
      // handle(); // Appelle le toast de chargement
      // Simule une opération asynchrone
        create(formValues);
        
        setFormValues({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          passwordConfirm: "",
          numero: 0,
        });
       // Remplacez cette valeur pour le temps d'exécution de votre opération réelle
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ boxShadow: 0, bgcolor: 'transparent' }}>
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
          <Stack spacing={2} margin={2}>
            {/* <TextField variant="outlined" label="Nom d'utilisateur" name='username' onChange={onChange}></TextField> */}
            <TextField variant="outlined" label="Nom" name='last_name' value={formValues.last_name} onChange={onChange}></TextField>
            <TextField variant="outlined" label="Prenom" name='first_name' value={formValues.first_name} onChange={onChange}></TextField>
            <TextField type='email' variant="outlined" label="Email" name='email' value={formValues.email} onChange={onChange}></TextField>
            <TextField type='number' variant="outlined" label="Numero" name='numero' value={formValues.numero} onChange={onChange}></TextField>
            <FormControl fullWidth className='mb-4'>
              <InputLabel id="select-pays-label">Votre pays</InputLabel>
              <Select
                labelId="select-pays-label"
                // value={selectedCountry}
                onChange={onSelectChange}
                name='pays'
                placeholder="Choisir un pays"
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField type='password' value={formValues.password} variant="outlined" label="Mot de passe" name='password' onChange={onChange}></TextField>
            <TextField type='password' value={formValues.passwordConfirm} variant="outlined" label="Mot de passe de confirmation" name='passwordConfirm' onChange={onChange}></TextField>

            <Button type="submit" color="success" variant="outlined" onClick={handle} >Inscription</Button>
          </Stack>
        </form>
      </Card>
    </>
  );
}