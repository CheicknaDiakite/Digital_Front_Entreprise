import { ChangeEvent, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { connect } from '../../_services/account.service'
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteSortie, useFetchSortie, useUpdateSortie } from '../../usePerso/fonction.entre'
import Nav from '../../_components/Button/Nav'
import { useFetchUser } from '../../usePerso/fonction.user'
import { useStoreUuid } from '../../usePerso/store';

export default function ModifSortie() {
  const {uuid} = useParams()
  const entreprise_id = useStoreUuid((state) => state.selectedId)

  const {unUser} = useFetchUser(connect)
  const {unSortie, setUnSortie} = useFetchSortie(uuid!)
 
  unSortie["user_id"] = connect
  unSortie["entreprise_id"] = entreprise_id!
  const {updateSortie} = useUpdateSortie()
  const {deleteSortie} = useDeleteSortie()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteSortie(unSortie);
    }
  };
  // const {unSortie, setUnSortie, updateSortie, deleteSortie} = useSortie(slug!)
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSortie({
      ...unSortie,
      [name]: value,
    });
  };
  
  // const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>,
  //   value: string | RecupType | null,
  //   // reason: AutocompleteChangeReason
  //   ) => {
  //   if (typeof value === 'object' && value !== null) {
  //     setUnSortie({
  //       ...unSortie,
  //       entre_id: value.uuid ?? '',
  //     });
  //   } else {
  //       setUnSortie({
  //       ...unSortie,
  //       entre_id: '',
  //     });
  //   }
  // };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    unSortie["user_id"]= connect
    // formValues["user_id"]= connect
    // formValues["user_id"]= connect

    updateSortie(unSortie)
  };
  
  return (<>
  <Nav>
    {unUser.role === 1 &&     
      <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
        <DeleteIcon fontSize='small' />
      </Button>
    }
    </Nav>
    <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Modification du produit sortie
          </Typography>
          <div className='flex justify-center items-center flex-col'>
          <DialogTitle>Modification Sortie</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>

              {/* <Autocomplete
                id="free-solo-demo"
                freeSolo
                options={entres}
                getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.categorie_libelle} (${option.libelle})`  || '')}
                onChange={handleAutoCompleteChange}
                renderInput={(params) => <TextField {...params} onChange={onChange} label="Categorie" />}
              /> */}

              {/* <TextField variant="outlined" label="libelle" name='libelle' onChange={onChange}></TextField> */}
              <TextField 
              variant="outlined"
              label="Designation" 
              value={unSortie.categorie_libelle} 
              disabled 
              InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
              }}></TextField>

              <TextField 
              variant="outlined" 
              type='number' 
              label="PU" 
              value={unSortie.pu} 
              name='pu'
               onChange={onChange}></TextField>
               
              <TextField 
              variant="outlined" 
              type='number' 
              label="QTE" 
              value={unSortie.qte} 
              name='qte'
               onChange={onChange}></TextField>
              
              {/* <Button type="submit" color="success" variant="outlined">Yes</Button> */}
            </Stack>
          </form>
          </DialogContent>
          </div>
        </CardContent>
        
    </Card>
  </>
  )
}
