import { ChangeEvent, FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RouteParams } from '../../typescript/DataType'
import { Button, Card, CardContent, Checkbox, DialogContent, DialogTitle, FormControlLabel, Stack, TextField } from '@mui/material'
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

  const [ajout_terminer, setTerminer] = useState(true);
  
  const Ajout_Terminer = () => {
    ajout_terminer ? setTerminer(false) : setTerminer(true);
  };
  
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
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    unEntre["is_sortie"] = ajout_terminer

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

          <DialogTitle>Entrer Modification</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>

              <TextField variant="outlined" disabled value={unEntre.categorie_slug} label="Designation" name='libelle' onChange={onChange}></TextField>
              <TextField variant="outlined" value={unEntre.libelle} label="libelle" name='libelle' onChange={onChange}></TextField>
              <TextField variant="outlined" value={unEntre.qte} label="QTE" name='qte' onChange={onChange}></TextField>
              <TextField variant="outlined" value={unEntre.pu} label="Prix de vente" name='pu' onChange={onChange}></TextField>
              
              {unUser.role === 1 &&               
              <TextField variant="outlined" value={unEntre.pu_achat} label="Prix d'achat" name='pu_achat' onChange={onChange}></TextField>
              }
              
              <FormControlLabel
                control={<Checkbox 
                  onChange={Ajout_Terminer} // Appelle la fonction Ajout_Terminer lors du changement
                />
                }
                label="Vous ne voulez pas sortir ce produit ?"
                labelPlacement="end"
                onClick={Ajout_Terminer}
                
              />
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
