import { 
  Box, 
  Button, 
  Grid, 
  Modal, 
  Pagination, 
  Paper, 
  Skeleton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { ChangeEvent, Fragment, useState } from 'react';
import CardTableSortie from './CardTableSortie';
// import { ABType } from '../../typescript/Account';
import { RecupType } from '../../typescript/DataType';
import { useFetchAllSortie, useGetAllSortie, useUpdateRemiseSortie } from '../../usePerso/fonction.entre';
import { useStoreUuid } from '../../usePerso/store';
import Nav from '../../_components/Button/Nav';
import { useStoreCart } from '../../usePerso/cart_store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { connect } from '../../_services/account.service';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
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
        <Box sx={{ ...modalStyle, width: 200 }}>
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

// Components
const LoadingState = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
  </Box>
);

const ErrorState = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" color="error">
      Une erreur est survenue. Veuillez rafraîchir la page.
    </Typography>
  </Box>
);

// const ConfirmationModal = ({ open, onClose, onConfirm, selectedItems }: { 
//   open: boolean; 
//   onClose: () => void; 
//   onConfirm: () => void; 
//   selectedItems: number;
// }) => (
//   <Modal
//     open={open}
//     onClose={onClose}
//     aria-labelledby="confirmation-modal-title"
//   >
//     <Box sx={modalStyle}>
//       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//         <Typography variant="h6" id="confirmation-modal-title">
//           Confirmation de remise
//         </Typography>
//         <IconButton onClick={onClose} size="small">
//           <CloseIcon />
//         </IconButton>
//       </Stack>
      
//       <Typography variant="body1" sx={{ mb: 3 }}>
//         Voulez-vous vraiment annuler la remise sur {selectedItems} facture(s) ?
//       </Typography>

//       <Stack direction="row" spacing={2} justifyContent="flex-end">
//         <Button onClick={onClose} variant="outlined">
//           Annuler
//         </Button>
//         <Button onClick={onConfirm} variant="contained" color="primary">
//           Confirmer
//         </Button>
//       </Stack>
//     </Box>
//   </Modal>
// );

export default function RemiseFacture() {
    const entreprise_uuid = useStoreUuid((state) => state.selectedId);
    // const { updateRemiseSortie } = useUpdateRemiseSortie();
    const { selectedIds, sorties, setSorties } = useStoreCart();
    const selectSorties = sorties.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));

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
    // const [openF, setOpenF] = useState(false);
    // const handleOpen = () => {
    //     setOpenF(true);
    // };
    // const handleClose = () => {
    //     setOpenF(false);
    // };

    const top = {
        all: "all",
        user_id: connect
    }
    
    // const { sorties: allSorties } = useFetchAllSortie(top)

    const handleSaveSorties = () => {
        setSorties(sortiesEntreprise);
    };

    const [searchTerm, setSearchTerm] = useState<string>('');
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    };
    // Filtrage de la liste triée en fonction du terme de recherche
    const sortedList = sortedLi.filter((post: any) =>
        post?.ref?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // States
    const [isModalOpen, setIsModalOpen] = useState(false);

    // const handleConfirmRemise = () => {
    //     const selectedSorties = sorties.filter((sor) => sor.id && selectedIds.has(sor.id));
    //     const idsToUpdate = selectedSorties.map(sor => sor.id);
    //     updateRemiseSortie(idsToUpdate);
    //     reset();
    //     setIsModalOpen(false);
    // };

    if (isLoading) {
    return <LoadingState />
    }

    if (isError) {
    return <ErrorState />
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
    
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)} className="bg-sky-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-sky-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-sky-400" disabled={selectedIds.size === 0}>
            R_Facture
            </Button>
    
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...modalStyle, width: 400 }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 id="parent-modal-title">Vous voulez annuler la remise sur cette facture ?</h2>
                        <IconButton onClick={() => setIsModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </div>
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
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Tooltip title="Nombre de remise sur facture">
                        <LocalOfferIcon color="primary" />
                    </Tooltip>
                    <Typography variant="body1">
                        {sortedList.length}
                    </Typography>
                </Stack>
            </Grid>
            </div>  
        
              <TableContainer component={Paper} className='mt-3'>
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
