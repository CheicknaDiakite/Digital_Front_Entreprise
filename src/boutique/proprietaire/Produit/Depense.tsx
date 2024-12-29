import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Pagination, Stack, TextField, Typography } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close"
import { connect } from '../../../_services/account.service';
import { DepenseType } from '../../../typescript/DataType';
import { useCreateDepense, useGetAllDepense } from '../../../usePerso/fonction.entre';
import MyTextField from '../../../_components/Input/MyTextField';
import CardDepense from './CardDepense';
import Nav from '../../../_components/Button/Nav';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../usePerso/fonctionPerso';
import M_Abonnement from '../../../_components/Card/M_Abonnement';
import { useFetchEntreprise } from '../../../usePerso/fonction.user';

export default function Depense() {

  const {ajoutDepense} = useCreateDepense()
  // const {souscategories} = useFetchAllSousCate(top)
  const uuid = useStoreUuid((state) => state.selectedId)
  
  const {unEntreprise} = useFetchEntreprise(uuid!)

  // const {produitsEntreprise, isLoading, isError} = useGetAllProduit(connect)
  const {depensesEntreprise, isLoading, isError} = useGetAllDepense(connect, uuid!)

  const componentRef = useRef<HTMLDivElement>(null);
  
   // État pour la page courante et les éléments par page
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 25; // Nombre d'éléments par page

   // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Filtrage entre les deux dates sélectionnées
  const filteredDepenses = depensesEntreprise?.filter((item) => {
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

   const reversedDepenses = filteredDepenses?.slice().sort((a: DepenseType, b: DepenseType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return b.id - a.id;
  });
 
   // Calcul du nombre total de pages
   const totalPages = Math.ceil(reversedDepenses.length / itemsPerPage);     
 
   // Récupération des éléments à afficher sur la page courante
   const depensesBoutic = reversedDepenses.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
   );

  //  const totalMontant = depensesBoutic?.reduce((acc, depense) => {
  //   return acc + (depense.somme || 0); // Utiliser 0 si montant est undefined
  //   }, 0);
  const totalMontant = depensesBoutic?.reduce((acc, depense) => {
    // Convertir la somme en nombre ou utiliser 0 si elle est invalide
    const somme = depense.somme ? parseFloat(String(depense.somme)) : 0;
    return acc + somme;
  }, 0);
  

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

  const [formValues, setFormValues] = useState<DepenseType>({
    libelle: '',
    date: '',
    somme: 0,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const validSlug = slug || '';

    formValues["user_id"] = connect
    formValues["facture"] = image
    formValues["entreprise_id"] = uuid!
    
    // formValues["categorie_slug"] = validSlug
    
    ajoutDepense(formValues)

    setFormValues({
      libelle: '',
      date: '',
      somme: 0,
    })
    closeopen();
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching data</div>
  }

  if (depensesEntreprise) {

    return (
      <>  
      <Nav /> 
      {/* <ReactToPrint
        trigger={() => (
          
          <Grid container>
            <Grid >
              <button className="bg-green-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                Print / Download
              </button>
            </Grid>
                                
          </Grid> 
        ) 
        }
        content={() => componentRef.current}
      />  */}
      <Grid className='py-2'>
        <Typography variant="h5">
          <Button variant="outlined" onClick={functionopen}>Ajout des Depenses</Button>
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
             
        <Typography variant="h4" className='mx-2'>
          Somme total = {formatNumberWithSpaces(totalMontant)} <LocalAtmIcon color="primary" fontSize='medium' />
        </Typography>
      </div>
      {/* Modal */}
      <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
        <DialogTitle>Ajout des depenses<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
        
        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
        <M_Abonnement />  
        )
          :        
        <DialogContent>
          
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
            <Stack spacing={2} margin={2}>
  
              <MyTextField required
                variant="outlined" 
                label="libelle" 
                name='libelle' 
                onChange={onChange}
                sx={{
                  "& .MuiFormLabel-asterisk": {
                    color: "red", // Personnalise la couleur de l'étoile en rouge
                  },
                }}
              />

              <MyTextField required
                variant="outlined" 
                type='date' 
                label="date" 
                name='date' 
                onChange={onChange}
                InputLabelProps={{
                  shrink: true, // Force le label à rester au-dessus du champ
                }}
                sx={{
                  "& .MuiFormLabel-asterisk": {
                    color: "red", // Personnalise la couleur de l'étoile en rouge
                  },
                }}
              />

              <MyTextField
                required
                variant="outlined"
                type="number"
                inputProps={{
                  step: "0.01", // Décimales à deux chiffres
                  min: "0", // Pas de valeurs négatives
                  max: "9999999999.99", // Correspond à max_digits=10 dans Django
                }}
                label="Somme"
                name="somme"
                onChange={onChange}
                sx={{
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
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
              
              <Button type="submit" color="success" variant="outlined">Ajouter</Button>
            </Stack>
          </form>
        </DialogContent>
        }
        
      </Dialog>
  
      <TableContainer ref={componentRef} component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={3}>
                Depense
              </TableCell>
              {/* <TableCell align="right">Prix</TableCell> */}
            </TableRow>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Libelles</TableCell>
              <TableCell>Somme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {depensesBoutic?.length > 0 ? 
            
              depensesBoutic?.map((row, index) => {  
                         
                return <CardDepense key={index} row={row} />
              
              })
              : "Pas de Depense"
            }
           
          </TableBody>
        </Table>
      </TableContainer>
      </>
    );
  }
}
