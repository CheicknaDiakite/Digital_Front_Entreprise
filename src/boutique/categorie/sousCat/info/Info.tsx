import { useParams } from "react-router-dom";
import { RouteParams } from "../../../../typescript/DataType";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AnalyticEcommerce from "../../../../components/cards/statistics/AnalyticEcommerce";
import CardInfo from "./CardInfo";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import Nav from "../../../../_components/Button/Nav";
import { useCateSousCate, useInfoSousCate } from "../../../../usePerso/fonction.categorie";
import { connect } from "../../../../_services/account.service";
import { formatNumberWithSpaces } from "../../../../usePerso/fonctionPerso";

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
    const {infos} = useInfoSousCate(top)
    
    // const ent = infos.filter(info => info.stock !== undefined && info.stock !== null).map(info => ({stock:info.stock}));
    const ent = infos
    .filter(info => info.sortie !== undefined && info.sortie !== null)
    .flatMap(info => info.sortie);
    
    const filteredInfos = infos
    .filter(info => info.libelle !== undefined) // Filtrer les objets qui ont un name
    .map(info => ({ pu: info.pu, qte: info.qte, libelle: info.libelle, prix_total: info.prix_total, client: info.client })); // Extraire uniquement les id et name

    const totalPrix = filteredInfos.reduce((sum, sor) => sum + sor.prix_total, 0);

    const sumQteStock = filteredInfos.reduce((sum, sor) => sum + sor.qte, 0);
    // const sumQteEntre = stocksOnly.reduce((sum, sor) => sum + sor.qte, 0);
 
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
          <AnalyticEcommerce title="Total des sommes de ces produits" count={sumQteStock} percentage={formatNumberWithSpaces(totalPrix)} className="bg-green-100" />
        </Grid>

        {ent.map((p, index) => {
          if (p.qte != 0) {
            return <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce title={`${p.libelle}: quantite restant`} client={p.client} count={p.qte} extra={p.pu} pied={"Prix Achat"} />
            </Grid>
          }
        })}
      </Grid>
    </Grid>

    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={3}>
              Details
            </TableCell>
            {/* <TableCell align="right">Prix</TableCell> */}
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
          {filteredInfos?.length > 0 ? 
          
            filteredInfos?.map((row, index) => {            
              return <CardInfo key={index} row={row} />
            })
            : "Pas d'infos"
          }
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={2}>Total :</TableCell>
            <TableCell align="right">{formatNumberWithSpaces(totalPrix)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
          </TableRow>
          
        </TableBody>
      </Table>
    </TableContainer>

    </>)
}
