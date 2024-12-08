import { useParams } from "react-router-dom"
import { RouteParams } from "../../../typescript/DataType"
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material"
import { ChangeEvent, FormEvent, useState } from "react";
import { connect } from "../../../_services/account.service";
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteSousCate, useFetchSousCate, useUpdateSousCate } from "../../../usePerso/fonction.categorie";
import Nav from "../../../_components/Button/Nav";
import MyTextField from "../../../_components/Input/MyTextField";

export default function ModifSousCate() {
  const {slug} = useParams<RouteParams>()

  // const {unSousCate, setUnSousCate, updateSousCate, deleteSousCate} = useSousCategorie(slug!)
  const {unSousCate, setUnSousCate} = useFetchSousCate(slug!)

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const {updateSousCate} = useUpdateSousCate()
  const {deleteSousCate} = useDeleteSousCate()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteSousCate(unSousCate);
    }
  };
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSousCate({
      ...unSousCate,
      [name]: value,
    });
  };
  
  unSousCate["user_id"] = connect
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    unSousCate["user_id"] = connect
    unSousCate["image"] = image
    // formValues["categorie_slug"] = validSlug

    updateSousCate(unSousCate)
  };

  return (
    <>
    <Nav>
      <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
        <DeleteIcon fontSize='small' />
      </Button>
    </Nav>
    
    <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Modification du produit
          </Typography>
          <div className='flex justify-center items-center flex-col'>
          <DialogTitle>Sous Categorie</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>
              <TextField variant="outlined" name='libelle' value={unSousCate.libelle} onChange={onChange}></TextField>
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
        {/* <CardActions className='flex justify-center'>
          <Button size="small" className='rounded-full shadow-md shadow-indigo-500/50' onClick={handleGoBack}>
            <ReturnIcon fontSize='small' />
          </Button>
          <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={() => deleteSousCate(unSousCate)}>
            <DeleteIcon fontSize='small' />
          </Button>
          <Button size="small">Learn More</Button>
        </CardActions> */}
      </Card>
    </>
  )
}
