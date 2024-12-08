import { ChangeEvent, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { RouteParams } from '../../typescript/DataType'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { connect } from '../../_services/account.service'
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteEntre, useFetchEntre, useUpdateEntre } from '../../usePerso/fonction.entre'
import Nav from '../../_components/Button/Nav'
import { useFetchUser } from '../../usePerso/fonction.user'
import { useStoreUuid } from '../../usePerso/store'

export default function ModifEntre() {
  const {uuid} = useParams<RouteParams>()
  const entreprise_id = useStoreUuid((state) => state.selectedId)

  const {unEntre, setUnEntre} = useFetchEntre(uuid!)
  const {unUser} = useFetchUser(connect)
  const {updateEntre} = useUpdateEntre()
  const {deleteEntre} = useDeleteEntre()
  
  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteEntre(unEntre);
    }
  };
  // const {souscategories} = useFetchAllSousCate(top)
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnEntre({
      ...unEntre,
      [name]: value,
    });
  };

  
  unEntre["user_id"] = connect
  unEntre["entreprise_id"] = entreprise_id!
  console.log(unEntre);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateEntre(unEntre)
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
          {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Word of the Day
          </Typography> */}
          <div className='flex justify-center items-center flex-col'>

          <DialogTitle>Entre Modification</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>

              <TextField variant="outlined" disabled value={unEntre.libelle} label="Designation" name='libelle' onChange={onChange}></TextField>
              <TextField variant="outlined" value={unEntre.pu} label="PU" name='pu' onChange={onChange}></TextField>
              <TextField variant="outlined" value={unEntre.qte} label="QTE" name='qte' onChange={onChange}></TextField>
              
              <Button type="submit" color="success" variant="outlined">Envoyer</Button>
            </Stack>
          </form>
          </DialogContent>
          </div>
        </CardContent>
        
    </Card>
  </>
  )
}
