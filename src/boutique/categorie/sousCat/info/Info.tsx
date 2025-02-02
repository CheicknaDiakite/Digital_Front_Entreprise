import { useParams } from "react-router-dom";
import { RecupType, RouteParams } from "../../../../typescript/DataType";
import { Box, CircularProgress, Grid, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AnalyticEcommerce from "../../../../components/cards/statistics/AnalyticEcommerce";
import CardInfo from "./CardInfo";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import Nav from "../../../../_components/Button/Nav";
import { useCateSousCate, useInfoSousCate } from "../../../../usePerso/fonction.categorie";
import { connect } from "../../../../_services/account.service";
import { formatNumberWithSpaces } from "../../../../usePerso/fonctionPerso";
import { useState } from "react";

export default function Info() {

    const {uuid} = useParams<RouteParams>()
    const top = {
        slug: uuid
    }
    const trop = {
        slug: uuid,
        user_id: connect
    }

    const {sousCate} = useCateSousCate(trop)
    
    // const {infos} = useSousCategorie(top)
    const {infos, isLoading} = useInfoSousCate(top)

    const itemsPerPage = 25; // Nombre d'éléments par page

    // État pour la page courante et les éléments par page
    const [currentPage, setCurrentPage] = useState(1);

    // États pour les dates de recherche
    const [selectedStartDate, setSelectedStartDate] = useState<string>('');
    const [selectedEndDate, setSelectedEndDate] = useState<string>('');

    // Filtrage entre les deux dates sélectionnées
  const filteredInfoss = infos?.filter((item) => {
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

  // Inverser les boutiques pour que les plus récentes apparaissent en premier
  const reversedInfos = filteredInfoss?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil(reversedInfos?.length / itemsPerPage);

  // Calculer la somme des "price" pour la date sélectionnée
  const totalPrice = reversedInfos?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedInfos?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined ) ? row.qte : 0;
    return acc + price;
  }, 0);

  // Récupération des éléments à afficher sur la page courante
  const displayedInfos = reversedInfos?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gestion du changement de page
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // setUserInteracted(true); // Indiquer que l'utilisateur a interagi avec la pagination
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
    
    // const ent = infos.filter(info => info.stock !== undefined && info.stock !== null).map(info => ({stock:info.stock}));
    const ent = infos
    .filter(info => info.sortie !== undefined && info.sortie !== null)
    .flatMap(info => info.sortie);
    
    const filteredInfos = infos
    .filter(info => info.libelle !== undefined) // Filtrer les objets qui ont un name
    .map(info => ({ pu: info.pu, qte: info.qte, libelle: info.libelle, prix_total: info.prix_total, client: info.client, date: info.date })); // Extraire uniquement les id et name

    // const totalPrix = filteredInfos.reduce((sum, sor) => sum + sor.prix_total, 0);

    const sumQteStock = filteredInfos.reduce((sum, sor) => sum + sor.qte, 0);
    // const sumQteEntre = stocksOnly.reduce((sum, sor) => sum + sor.qte, 0);
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (infos) {

    return (<>
    <Nav />

    {sousCate?.map((post, index) => (

    <Grid key={index} item xs={12} sx={{ mb: -2.25 }} className='pb-3'>
      <Typography variant="h5">Les informations concernant la sortie ou le stock de :</Typography>
      <Typography variant="h2" color="blue">{post.libelle}</Typography>
    </Grid>
    ))}

    <Grid className='py-2'>
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AnalyticEcommerce title="Total des sommes de quantites et le chiffre d'affaire de ce produit" count={sumQteStock} percentage={formatNumberWithSpaces(totalPrice)} className="bg-green-100" />
        </Grid>

        {ent.map((p, index) => {
          if (p.qte != 0) {
            return <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce title={`${p.libelle}: quantite restant`} client={p.client} count={p.qte} extra={p.pu_achat} pied={"Prix Achat"} />
            </Grid>
          }
        })}
      </Grid>
    </Grid>

    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
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
            <TableCell align="right">Nombre de vente: 
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                {infos.length}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>libelles</TableCell>
            <TableCell align="right">Quantite</TableCell>
            <TableCell align="right">Prix Unitaire</TableCell>
            <TableCell align="right">Somme</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedInfos?.length > 0 ? 
          
            displayedInfos?.map((row, index) => {            
              return <CardInfo key={index} row={row} />
            })
            : "Pas d'infos"
          }
          <TableRow>
            <TableCell rowSpan={4} />
            <TableCell colSpan={3}>Total :</TableCell>
            <TableCell colSpan={0}>{totalQte}</TableCell>
            <TableCell align="right">{formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
          </TableRow>
          
        </TableBody>
      </Table>
    </TableContainer>

    </>
    )
    }

}
