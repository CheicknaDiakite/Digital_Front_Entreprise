import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom';
// import Select from 'react-select';
import { useFetchUser, useUpdateUser } from '../../../usePerso/fonction.user';
import { connect } from '../../../_services/account.service';
import countryList from 'react-select-country-list';
import toast from 'react-hot-toast';
import { logout } from '../../../usePerso/fonctionPerso';
import Nav from '../../../_components/Button/Nav';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
export default function Admin() {
  const {uuid} = useParams()
  
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {unUser, setUnUser, isLoading} = useFetchUser(uuid!)
  
  const {updateUser} = useUpdateUser()
  
  // const [pays, setPays] = useState(null);
  const options = countryList().getData();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnUser({
      ...unUser,
      [name]: value,
    });
  };
  
  const onSelectChange = (e: SelectChangeEvent<string>) => {
    setUnUser({
      ...unUser,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    unUser["user_id"] = connect
    // unEntre["categorie_slug"] = validSlug
    
    
    updateUser(unUser)
  };

  const onSubmitPass = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    unUser["uuid"] = connect
    unUser["user_id"] = connect
    if(unUser.password !== unUser.repassword){
        toast.error("Les deux mots de passe ne correspondent pas");
    } else {
      updateUser(unUser)
      logout()
    }
    
    
  };

  if (isLoading) {
    <div>ChangeEvent ...</div>
  }

  if (unUser) {
    return (<>
      <Nav />
        <div>
          {/* <Button onClick={handleOpen}>Open modal</Button> */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style} className="m-2">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Changement de mot de passe
              </Typography>
              <form className="grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={onSubmitPass}>
              
              <TextField
                label="Change le mot de passe"
                name="password"
                onChange={onChange}
                variant="outlined"
                className="my-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                // {...register('last_name')}
                fullWidth
              />
              <TextField
                label="Confirmer le mot de passe"
                name="repassword"
                onChange={onChange}
                className="my-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                // {...register('first_name')}
                fullWidth
              />
              
              <div className="col-span-1 lg:col-span-2">
                <Button variant="contained" color="primary" type="submit" >
                  Modifier votre mot de passe
                </Button>
              </div>
            </form>
            </Box>
          </Modal>
        </div>
    
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Card header */}
          {/* <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1">Profile Details</h3>
            <p className="text-gray-600">Les details de votre profile.</p>
          </div> */}
          {/* Card body */}
          <div className="flex lg:flex-row flex-col items-center justify-between mb-6">
            {/* <UserImg post={unUser} /> */}
            <div className="mt-4 lg:mt-0">
              <Button variant="outlined" size="small" onClick={handleOpen} >
                Changer mot de passe
              </Button>

              {/* <Button onClick={handleOpen}>Open modal</Button> */}
            </div>
          </div>
          <hr className="my-5" />
          <div>
            <h4 className="text-lg font-semibold mb-2">Detail de l'utilisateur</h4>
            <p className="text-gray-600 mb-4">Les details de votre profile.</p>
            {/* Form */}
            <form className="grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={onSubmit}>
              <TextField
                label="Nom d'utilisateur"
                name="username"
                value={unUser.username}
                variant="outlined"
                onChange={onChange}
                className="mb-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                disabled
                // {...register('username')}
                fullWidth
              />
              <TextField
                label="Nom"
                name="last_name"
                value={unUser.last_name}
                variant="outlined"
                onChange={onChange}
                className="mb-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                // {...register('last_name')}
                fullWidth
              />
              <TextField
                label="Prenom"
                name="first_name"
                value={unUser.first_name}
                onChange={onChange}
                className="mb-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                // {...register('first_name')}
                fullWidth
              />
              <TextField
                label="Numero"
                name="numero"
                value={unUser.numero}
                onChange={onChange}
                className="mb-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                // {...register('numero')}
                fullWidth
              />
              <FormControl fullWidth className='mb-4'>
                <InputLabel id="select-pays-label">Pays = {unUser.pays}</InputLabel>
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
              
              <TextField
                label="Email"
                name="email"
                type="email"
                value={unUser.email}
                onChange={onChange}
                className="mb-4"
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}                
                fullWidth
              />
    
              <div className="col-span-1 lg:col-span-2">
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Modifier votre profile
                </Button>
              </div>
            </form>
          </div>
        </div>
    </>
      );
    };
  }
