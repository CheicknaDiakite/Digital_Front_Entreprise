import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDeleteFacSortie, useFacSortie, useUpdateFacSortie } from '../../../../usePerso/fonction.facture'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'

import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { BASE } from '../../../../_services/caller.service';
import { connect } from '../../../../_services/account.service';
import PdfViewer from '../../../../usePerso/PdfFile';
import Nav from '../../../../_components/Button/Nav';


export default function ModifProduitSortie() {
  const {uuid} = useParams()
  
  const {unFacSortie, setUnFacSortie} = useFacSortie(uuid!)
  const {deleteFacSortie} = useDeleteFacSortie()
  const {updateFacSortie} = useUpdateFacSortie()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteFacSortie(unFacSortie);
    }
  };
  
  unFacSortie["user_id"] = connect

  let url = BASE(unFacSortie.facture ?? "defaultFacture"); // valeur par défaut

  console.log(url)

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnFacSortie({
      ...unFacSortie,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    unFacSortie["user_id"] = connect
    unFacSortie["facture"] = image
    // unEntre["categorie_slug"] = validSlug

    updateFacSortie(unFacSortie)
  };
  return (<>
  
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
            value={unFacSortie.libelle} 
            label="LIBELLE" 
            name='libelle' 
            onChange={onChange}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            ></TextField>

            <TextField 
            variant="outlined" 
            value={unFacSortie.ref} 
            label="Ref" 
            name='ref' 
            onChange={onChange}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
            ></TextField>

            <TextField 
            variant="outlined" 
            value={unFacSortie.date} 
            label="Date"
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
              label='Fichier pdf' 
              // name='image' 
              // value={unBoutique.nom} 
              onChange={handleImageChange}
              InputLabelProps={{
                shrink: true, // Force le label à rester au-dessus du champ
              }}
              ></TextField>

            {unFacSortie.facture && 
              <div>
                
                <a href={url} color="success">Afficher PDF</a>
                <PdfViewer fileUrl={url} />
              </div>
            }

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
