import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Pagination, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close"
import { ChangeEvent, FormEvent, useState } from 'react';
import { connect } from '../../../../_services/account.service';
import { useCreateFacEntre, useGetAllFacEntre } from '../../../../usePerso/fonction.facture';
import CardFacEntre from './CardFacEntre';
import MyTextField from '../../../../_components/Input/MyTextField';
import { FacSorType } from '../../../../typescript/fac';
import Nav from '../../../../_components/Button/Nav';
import { useStoreUuid } from '../../../../usePerso/store';
import { RecupType } from '../../../../typescript/DataType';
import M_Abonnement from '../../../../_components/Card/M_Abonnement';
import { useFetchEntreprise } from '../../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../../usePerso/fonctionPerso';

export default function FacEntre() {
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)

  const {ajoutFacEntre} = useCreateFacEntre()
  const {facEntresUtilisateur, isLoading, isError}= useGetAllFacEntre(connect, uuid!)

  const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 25; // Nombre d'éléments par page

   // États pour les dates de recherche
     const [selectedStartDate, setSelectedStartDate] = useState<string>('');
     const [selectedEndDate, setSelectedEndDate] = useState<string>('');
   
     // Filtrage entre les deux dates sélectionnées
     const filteredBoutiques = facEntresUtilisateur?.filter((item) => {
       if (!item.date) {
         return false; // Ignore les éléments sans date valide
       }
     
       const itemDate = new Date(item.date).getTime();
       const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
       const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
     
       return (
         (startDate === null || itemDate >= startDate) &&
         (endDate === null || itemDate <= endDate)
       );
     });
   

   const reversedFacEntrer = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });
 
   // Calcul du nombre total de pages
   const totalPages = Math.ceil(filteredBoutiques.length / itemsPerPage);
 
   // Récupération des éléments à afficher sur la page courante
   const facEntrerBoutic = reversedFacEntrer.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
   );
   
   // Gestion du changement de page
   const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
     setCurrentPage(page);
   };

    // Gestion du changement des dates
     const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setSelectedStartDate(event.target.value);
       setCurrentPage(1);
     };
   
     const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setSelectedEndDate(event.target.value);
       setCurrentPage(1);
     };
  
  const [open, openchange]= useState(false);
  const functionopen = () => {
    openchange(true)
  }
  const closeopen = () => {
    openchange(false)
  }

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const [formValues, setFormValues] = useState<FacSorType>({
    user_id: '',
    libelle: '',
    ref: '',
    date: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    formValues["user_id"] = connect
    formValues["facture"] = image
    formValues["entreprise_id"] = uuid!
    // formValues["categorie_slug"] = validSlug

    ajoutFacEntre(formValues)

    setFormValues({
      user_id: '',
      libelle: '',
      date: '',
      ref: '',
    })
    closeopen();
  };

  if (isLoading) {
    return <Box sx={{ width: 300 }}>
    <Skeleton />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
  </Box>;
  }

  if (isError){
    window.location.reload();
    return <div>Erroeur ...</div>
  }

  if (facEntresUtilisateur){
    return (
      <> 
        <Nav />   
        
        <Grid className='py-2'>
          <Typography variant="h5">
            <Button variant="outlined" onClick={functionopen}>Ajout des Factures d'entrer</Button>
          </Typography>
        </Grid>
        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
                    <Grid item className='mx-2'>
                      <TextField
                        className='bg-sky-300'
                        label="Date de début"
                        type="date"
                        value={selectedStartDate}
                        onChange={handleStartDateChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        className='bg-sky-300'
                        label="Date de fin"
                        type="date"
                        value={selectedEndDate}
                        onChange={handleEndDateChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
        </div>
        {/* Modal */}
        <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>Ajout des Factures d'entrer<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
          
          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <M_Abonnement />  
          )
            :        
            <DialogContent>
              
              <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
                <Stack spacing={2} margin={2}>

                  <MyTextField 
                    label={"libelle"}
                    name={"libelle"}
                    onChange={onChange}
                  />
                  <MyTextField 
                    label={"Reference"}
                    name={"ref"}
                    onChange={onChange}
                  />
                  <MyTextField 
                    label={"Date"}
                    name={"date"}
                    type="date"
                    onChange={onChange}
                    InputLabelProps={{
                      shrink: true, // Force le label à rester au-dessus du champ
                    }}
                  />
                  <MyTextField 
                    label={"facture"}
                    name={"facture"}
                    type='file'
                    onChange={handleImageChange}
                    InputLabelProps={{
                      shrink: true, // Force le label à rester au-dessus du champ
                    }}
                  />
                  
                  <Button type="submit" color="success" variant="outlined">Envoyer</Button>
                </Stack>
              </form>
            </DialogContent>        
          }
        </Dialog>
    
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="spanning table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={3}>
                  Details
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Libelle</TableCell>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facEntrerBoutic?.length > 0 ? 
              
              facEntrerBoutic?.map((row, index) => {            
                  return <CardFacEntre key={index} row={row} />
                
                })
                : "Pas de Produit"
              }
              
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  }
}
