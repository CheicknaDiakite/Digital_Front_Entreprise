import { Box, Button, Grid, Modal, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { ChangeEvent, Fragment, useState } from 'react'
import CardTableSortie from './CardTableSortie';
// import { ABType } from '../../typescript/Account';
import { RecupType } from '../../typescript/DataType';
import { useFetchAllSortie, useGetAllSortie, useUpdateRemiseSortie } from '../../usePerso/fonction.entre';
import { useStoreUuid } from '../../usePerso/store';
import Nav from '../../_components/Button/Nav';
import { useStoreCart } from '../../usePerso/cart_store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { connect } from '../../_services/account.service';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function ChildModal() {
  const reset = useStoreCart(state => state.reset)
  const {updateRemiseSortie} = useUpdateRemiseSortie()
  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    const idsToUpdate = selectSorties.map(sor => sor.id);
    updateRemiseSortie(idsToUpdate)
    reset()
    setOpen(false);
  };

  return (
    <Fragment>
      <Button onClick={handleOpen}>Confirmer</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }}>
          <h1 id="child-modal-title">Annuler la remise</h1>
          {/* <p id="child-modal-description">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          </p> */}
          <Button onClick={handleClose}>Oui</Button>
        </Box>
      </Modal>
    </Fragment>
  );
}

export default function RemiseFacture() {
    const entreprise_uuid = useStoreUuid((state) => state.selectedId)

    const selectedIds = useStoreCart(state => state.selectedIds)
    const sortiess = useStoreCart(state => state.sorties);
    const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));

    const itemsPerPage = 25;

    const [currentPage, setCurrentPage] = useState(1);

    // États pour les dates de recherche
    const [selectedStartDate, setSelectedStartDate] = useState<string>('');
    const [selectedEndDate, setSelectedEndDate] = useState<string>('');

    const {sortiesEntreprise, isLoading, isError} = useGetAllSortie(entreprise_uuid!)

    // Filtrage entre les deux dates sélectionnées
    const filteredBoutiques = sortiesEntreprise?.filter((item) => {
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

    // Gestion du changement des dates
    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
    };

    const reversedSort = filteredBoutiques.filter((info: any) => info.is_remise === true);

    const reversedSorties = reversedSort?.slice().sort((a: RecupType, b: RecupType) => {
        if (a.id === undefined) return 1;
        if (b.id === undefined) return -1;
        return Number(b.id) - Number(a.id);
    });

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(reversedSorties.length / itemsPerPage);

    // Gestion du changement de page
    const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };
    
    const sortiesBoutic = reversedSorties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const sortedLi = sortiesBoutic?.sort((a: any, b: any) => {
        if (a.id === undefined) return 1;
        if (b.id === undefined) return -1;
        return b.id - a.id;
    });

    // Pour la remise des facture
    const [openF, setOpenF] = useState(false);
    const handleOpen = () => {
        setOpenF(true);
    };
    const handleClose = () => {
        setOpenF(false);
    };

    const setSorties = useStoreCart(state => state.setSorties)

    const top = {
        all: "all",
        user_id: connect
    }
    
    const {sorties} = useFetchAllSortie(top)

    const handleSaveSorties = () => {
        setSorties(sorties);
      };

    const [searchTerm, setSearchTerm] = useState<string>('');
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    };
    // Filtrage de la liste triée en fonction du terme de recherche
    const sortedList = sortedLi.filter((post: any) =>
        post?.ref?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
    return <Box sx={{ width: 300 }}>
    <Skeleton />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
    </Box>
    }

    if (isError) {
    window.location.reload();
    return <div>Error ...</div>
    }

    if (sortiesEntreprise) {

        return (
            <>
    
            <div className='py-2'>
                <Nav />
            </div>
    
            <Button 
                variant="outlined" 
                onClick={() => {
                handleSaveSorties();
                }}
                className="bg-green-500 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                Selectioner
            </Button>
    
            <Button variant="contained" color="primary" onClick={handleOpen} className="bg-sky-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-sky-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-sky-400">
            R_Facture
            </Button>
    
            <Modal
            open={openF}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            >
            <Box sx={{ ...style, width: 400 }}>
                <h2 id="parent-modal-title">Vous voulez annuler la remise sur ce facture ?</h2>
                <p id="parent-modal-description">
                Verifier avant de Confirmer
                </p>
                <TableContainer
                component={Paper}
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    margin: '0 auto',
                    padding: '1rem',
                    boxSizing: 'border-box',
                }}
                >
                <Table
                    sx={{
                    minWidth: 700,
                    '@media (max-width: 768px)': {
                        minWidth: '100%', // S'ajuste pour les petits écrans
                        fontSize: '0.8rem',
                    },
                    }}
                    aria-label="spanning table"
                >
                    <TableHead>
                    <TableRow>
                        {/* <TableCell>Date</TableCell> */}
                        <TableCell>Designation</TableCell>
                        <TableCell align="right">Quantite</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="right">Somme</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
    
                        {selectSorties.map((post, index) => (
                            <TableRow key={index}>
                            {/* <TableCell>
                                {format(new Date(post.date), 'dd/MM/yyyy')}
                            </TableCell> */}
                            <TableCell>
                                {post.ref} {" - "}
                                {post.categorie_libelle}
                            </TableCell>
                            <TableCell align="right">{post.qte}</TableCell>
                            <TableCell align="right">{formatNumberWithSpaces(post.pu)}</TableCell>
                            <TableCell align="right">{formatNumberWithSpaces(post.prix_total)}</TableCell>
                            </TableRow>
                        ))}
    
                    </TableBody>                
                </Table>
                </TableContainer>
                <ChildModal />
            </Box>
            </Modal>   
    
            <Grid item xs={12} sm={6} className="py-2">
                <TextField
                    label="Rechercher par ref"
                    variant="outlined"
                    className="bg-blue-200 mt-3"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </Grid>
    
            <div className="flex justify-center mt-4">
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
    
            <Grid item xs={12} sm={6} className="py-2 mx-2">
                <Typography variant="h5">
                Nombre de remise sur facture : 
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                    {sortedList.length}
                </span>
                </Typography>
            </Grid>
            </div>  
        
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Ref</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Designation</TableCell>
                      <TableCell>Quantite</TableCell>
                      <TableCell>Prix unitaire</TableCell>
                      <TableCell>Somme</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedList.map((row: any) => {
                      return <CardTableSortie key={row.id} row={row} />;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
        
             
                <div className="flex justify-center mt-4">
                    <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    />
                </div>
              
            </>
      )
    }

    
}
