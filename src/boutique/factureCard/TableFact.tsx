import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso'

interface TableFactProps {
  list: { 
    categorie_libelle: string;
     qte: number;
     pu: number;
     prix_total: number;
     date: string;
     ref: string;
    }[];
  total: number;
  discountedTotal: number;
  payerTotal: number;
}

const TableFact: React.FC<TableFactProps> = ({ list, total, discountedTotal, payerTotal }) => {
  // Exemple de fonction pour formater les nombres avec des espaces
  // const formatNumberWithSpaces = (num: number): string =>
  //   num.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  const resteAPayer = (total - ((total - discountedTotal) + (total - payerTotal)))

  return (
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
          {list.map((post, index) => (
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
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
              Prix
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {formatNumberWithSpaces(total)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
              Remise
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {formatNumberWithSpaces(total - discountedTotal)}
            </TableCell>
          </TableRow>
          {(total - payerTotal) ? 
            <TableRow>
              <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                Montant Payer 
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {formatNumberWithSpaces(total - payerTotal)}
              </TableCell>
            </TableRow>
          : 
          ""}
          
          <TableRow>
            <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
              Total {(total - payerTotal) ? "(Restant) :" : ":"}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {formatNumberWithSpaces(resteAPayer)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableFact;
