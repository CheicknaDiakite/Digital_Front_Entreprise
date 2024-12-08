import Nav from '../../../_components/Button/Nav'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import PdfViewer from '../../../usePerso/PdfFile'
import { useParams } from 'react-router-dom'
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteDepense, useFetchDepense, useUpdateDepense } from '../../../usePerso/fonction.entre'
import { connect } from '../../../_services/account.service'
import { ChangeEvent, FormEvent, useState } from 'react'
import { BASE } from '../../../_services/caller.service'

export default function DepenseModif() {
  const {uuid} = useParams()
  const {unDepense, setUnDepense} = useFetchDepense(uuid!)
  const {updateDepense} = useUpdateDepense()
  const {deleteDepense} = useDeleteDepense()
  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteDepense(unDepense);
    }
  };

  unDepense["user_id"] = connect

  let url = BASE(unDepense.facture ? unDepense.facture : '')
  
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnDepense({
      ...unDepense,
      [name]: value,
    });
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    unDepense["user_id"] = connect
    unDepense["facture"] = image
    console.log("depense  ..",unDepense)
    updateDepense(unDepense)
  };
  return <>
  <Nav>
    <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
      <DeleteIcon fontSize='small' />
    </Button>
  </Nav>

  <Card sx={{ minWidth: 275 }}>
    <CardContent>
      
      <div className='flex justify-center items-center flex-col'>

      <DialogTitle>Entre Modif</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>Categorie</DialogContentText> */}
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
        <Stack spacing={2} margin={2}>

          <TextField 
          variant="outlined" 
          value={unDepense.libelle} 
          label="LIBELLE" 
          name='libelle' 
          onChange={onChange}
          InputLabelProps={{
            shrink: true, // Force le label à rester au-dessus du champ
          }}
          ></TextField>

          <TextField 
          variant="outlined" 
          value={unDepense.somme} 
          label="Somme" 
          name='somme' 
          onChange={onChange}
          InputLabelProps={{
            shrink: true, // Force le label à rester au-dessus du champ
          }}
          ></TextField>

          <TextField 
          variant="outlined" 
          value={unDepense.date} 
          label={unDepense.date}
          type='date' 
          name='date' 
          onChange={onChange}
          InputLabelProps={{
            shrink: true, // Force le label à rester au-dessus du champ
          }}
          ></TextField>

          <TextField 
            variant="outlined" 
            type='file'
            label='Facture' 
            // name='image' 
            // value={unBoutique.nom} 
            onChange={handleImageChange}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            ></TextField>

          {unDepense.facture &&          
          <div>
            <a href={url} color="success">Afficher un PDF</a>
            <PdfViewer fileUrl={url} />
          </div>
          }

          <Button type="submit" color="success" variant="outlined">Modifier</Button>
        </Stack>
      </form>
      </DialogContent>
      </div>
    </CardContent>
  </Card>
</>
}
