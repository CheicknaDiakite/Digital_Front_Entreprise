import { ChangeEvent, FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CardContent, DialogContent, DialogTitle, Stack, TextField, Typography, Alert, FormControlLabel, Switch } from '@mui/material'
import { connect } from '../../_services/account.service'
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDeleteSortie, useFetchSortie, useUpdateSortie } from '../../usePerso/fonction.entre'
import { useFetchUser } from '../../usePerso/fonction.user'
import { useStoreUuid } from '../../usePerso/store';

export default function ModifSortie() {
  const {uuid} = useParams()
  const entreprise_id = useStoreUuid((state) => state.selectedId)

  const {unUser} = useFetchUser()
  const {unSortie, setUnSortie} = useFetchSortie(uuid!)
 
  unSortie["user_id"] = connect
  unSortie["entreprise_id"] = entreprise_id!
  const {updateSortie} = useUpdateSortie()
  const {deleteSortie} = useDeleteSortie()

  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAncien, setShowAncien] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };
  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmDelete = () => {
    const payload = { ...unSortie, action: 'delete' };
    setUnSortie(payload);
    deleteSortie(payload);
    
    setShowConfirm(false);
  };
  
  const confirmCancel = () => {
    const payload = { ...unSortie, action: 'cancel' };
    setUnSortie(payload);
    // on utilise updateSortie pour marquer la sortie comme annulée
    deleteSortie(payload);
    
    setShowCancelConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnSortie({
      ...unSortie,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    unSortie["user_id"]= connect
    // formValues["user_id"]= connect
    // formValues["user_id"]= connect

    updateSortie(unSortie)
  };
  
  return (<>
    
    {showConfirm && (
      <Alert 
        severity="warning" 
        className="mt-4"
        sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1400,
              width: 'calc(100% - 32px)',
              maxWidth: 600,
            }}
        action={
          <div className="space-x-2">
            <Button color="inherit" size="small" onClick={() => setShowConfirm(false)}>
              Annuler
            </Button>
            <Button color="error" size="small" onClick={confirmDelete}>
              Confirmer
            </Button>
          </div>
        }
      >
        Êtes-vous sûr de vouloir supprimer cette vente ?
      </Alert>
    )}
    
    {showCancelConfirm && (
      <Alert 
        severity="warning" 
        className="mt-4"
        action={
          <div className="space-x-2">
            <Button color="inherit" size="small" onClick={() => setShowCancelConfirm(false)}>
              Annuler
            </Button>
            <Button color="error" size="small" onClick={confirmCancel}>
              Confirmer
            </Button>
          </div>
        }
      >
        Êtes-vous sûr d'annuler cette vente ?
      </Alert>
    )}
    <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Modification du produit sortie
          </Typography>
          <div className='flex justify-center items-center flex-col'>
          <DialogTitle>Modification Sortie</DialogTitle>

          <FormControlLabel
            control={
              <Switch
                checked={showAncien}
                onChange={(e) => setShowAncien(e.target.checked)}
                color="primary"
                size="small"
                inputProps={{ 'aria-label': 'Une motif de la mis en jour' }}
              />
            }
            label="Une motif de la mis a jour"
          />
          <DialogContent>
            {/* <DialogContentText>Categorie</DialogContentText> */}
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>

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

               {showAncien && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Ajoutez des notes ou des informations supplémentaires..."
                    value={unSortie.description}
                    onChange={onChange}
                    variant="outlined"
                    className="bg-slate-100 text-red-300"
                  />
                )}

               {(unUser.role === 1) &&     
                  <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
                    <DeleteIcon fontSize='small' />
                  </Button>
                }
                {(unUser.role === 1 || unUser.role === 2) &&     
                   <Button size="small" className='ml-2 rounded-full shadow-md shadow-gray-800/30' onClick={handleCancel}>
                     <CancelIcon fontSize='small' />
                   </Button>
                 }
              
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
