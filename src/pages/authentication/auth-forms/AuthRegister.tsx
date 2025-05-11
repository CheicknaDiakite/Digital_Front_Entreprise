import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import { Card, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useCreateUser } from "../../../usePerso/fonction.user";
import countryList from "react-select-country-list";
import toast from "react-hot-toast";

type FormType = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  numero: string;
  password: string;
  passwordConfirm: string;
  pays: string;
};

export default function AuthRegister() {
  const { create } = useCreateUser();
  const options = countryList().getData();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormType>();

  const password = watch("password");

  let toastId: string | undefined;

  const handle = () => {
    toastId = toast.loading("Chargement pour vous envoyer un email ...");
    setTimeout(() => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    }, 6500);
  };

  useEffect(() => {
    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  const onSubmit = (data: FormType) => {
    create(data);
    reset();
    // toast.success("Inscription réussie !");
  };

  return (
    <Card variant="outlined" sx={{ boxShadow: 0, bgcolor: "transparent" }}>
      <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} margin={2}>
          <TextField
            label="Nom"
            variant="outlined"
            {...register("last_name", { required: "Ce champ est obligatoire" })}
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />

          <TextField
            label="Prénom"
            variant="outlined"
            {...register("first_name", { required: "Ce champ est obligatoire" })}
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />

          <TextField
            label="Email"
            type="email"
            variant="outlined"
            {...register("email", {
              required: "L'email est obligatoire",
              pattern: { value: /^\S+@\S+$/i, message: "Format d'email invalide" },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Numéro"
            variant="outlined"
            {...register("numero", {
              required: "Le numéro est obligatoire",
              pattern: { value: /^[+]?[0-9]{5,15}$/, message: "Format de numéro invalide" },
            })}
            error={!!errors.numero}
            helperText={errors.numero?.message}
          />

          <FormControl fullWidth error={!!errors.pays}>
            <InputLabel>Votre pays</InputLabel>
            <Select {...register("pays", { required: "Veuillez sélectionner un pays" })}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.label}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.pays && <p style={{ color: "red", fontSize: "12px" }}>{errors.pays.message}</p>}
          </FormControl>

          <TextField
            label="Mot de passe"
            type="password"
            variant="outlined"
            {...register("password", {
              required: "Le mot de passe est obligatoire",
              minLength: { value: 6, message: "Doit contenir au moins 6 caractères" },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Confirmer le mot de passe"
            type="password"
            variant="outlined"
            {...register("passwordConfirm", {
              required: "La confirmation est obligatoire",
              validate: (value) => value === password || "Les mots de passe ne correspondent pas",
            })}
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
          />

          <Button type="submit" color="success" variant="outlined" onClick={handle}>
            Inscription
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
