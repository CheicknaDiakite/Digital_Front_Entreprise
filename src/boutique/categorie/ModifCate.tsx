import { useParams } from 'react-router-dom'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import { connect } from '../../_services/account.service';
import { RouteParams } from '../../typescript/DataType';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteCategorie, useFetchCategorie, useUpdateCategorie } from '../../usePerso/fonction.categorie';
import Nav from '../../_components/Button/Nav';
import MyTextField from '../../_components/Input/MyTextField';
export default function ModifCate() {
  const {slug} = useParams<RouteParams>()
  
  // const {unCategorie, setCategorie, updateCategorie, deleteCategorie} = useCategorie(slug!)
  const {unCategorie, setUnCategorie} = useFetchCategorie(slug!)
  const {updateCategorie} = useUpdateCategorie()
  const {deleteCategorie} = useDeleteCategorie()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteCategorie(unCategorie);
    }
  };
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnCategorie({
      ...unCategorie,
      [name]: value,
    });
  };

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  unCategorie["user_id"] = connect
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    unCategorie["user_id"] = connect
    unCategorie["image"] = image

    updateCategorie(unCategorie)
  };

  return (
    <>
      <Nav>
        <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
          <DeleteIcon fontSize='small' />
        </Button>
      </Nav>
      
      <Card sx={{ minWidth: 275 }}>
        <CardContent >
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Modification de la categorie
          </Typography>
          <div className='flex justify-center items-center flex-col'>
            <DialogTitle>Categorie</DialogTitle>
            <DialogContent>
              {/* <DialogContentText>Categorie</DialogContentText> */}
              <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
              <Stack spacing={2} margin={2}>
                <TextField 
                  variant="outlined" 
                  name='libelle' 
                  value={unCategorie.libelle} 
                  onChange={onChange}
                ></TextField>

                <MyTextField 
                  label={"Image"}
                  name={"image"}
                  type='file'
                  onChange={handleImageChange}
                  InputLabelProps={{
                    shrink: true, // Force le label à rester au-dessus du champ
                  }}
                />
                <Button type="submit" color="success" variant="outlined">Modifier</Button>
              </Stack>
              </form>
            </DialogContent>
          </div>
        </CardContent>
        
      </Card>
      
    </>
  )
}
