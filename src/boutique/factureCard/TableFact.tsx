import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
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
  const resteAPayer = (total - ((total - discountedTotal) + (total - payerTotal)));

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        marginBottom: '2rem',
      }}
    >
      <Table>
        {/* Table Header */}
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell 
              sx={{ 
                fontWeight: 600,
                color: '#475569',
                borderBottom: '2px solid #e2e8f0',
                padding: '16px',
              }}
            >
              Désignation
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                fontWeight: 600,
                color: '#475569',
                borderBottom: '2px solid #e2e8f0',
                padding: '16px',
              }}
            >
              Quantité
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                fontWeight: 600,
                color: '#475569',
                borderBottom: '2px solid #e2e8f0',
                padding: '16px',
              }}
            >
              Prix unitaire
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                fontWeight: 600,
                color: '#475569',
                borderBottom: '2px solid #e2e8f0',
                padding: '16px',
              }}
            >
              Total
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {list.map((post, index) => (
            <TableRow 
              key={index}
              sx={{
                '&:hover': { backgroundColor: '#f8fafc' },
                transition: 'background-color 0.2s',
              }}
            >
              <TableCell sx={{ padding: '16px' }}>
                <div className="space-y-1">
                  <Typography variant="body2" className="font-medium text-gray-900">
                    {post.ref}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    {post.categorie_libelle}
                  </Typography>
                </div>
              </TableCell>
              <TableCell align="right" sx={{ padding: '16px' }}>
                {post.qte}
              </TableCell>
              <TableCell align="right" sx={{ padding: '16px' }}>
                {formatNumberWithSpaces(post.pu)} F
              </TableCell>
              <TableCell align="right" sx={{ padding: '16px', fontWeight: 500 }}>
                {formatNumberWithSpaces(post.prix_total)} F
              </TableCell>
            </TableRow>
          ))}

          {/* Summary Rows */}
          <TableRow>
            <TableCell rowSpan={4} />
            <TableCell 
              colSpan={2} 
              align="right"
              sx={{ 
                padding: '16px',
                color: '#64748b',
                fontWeight: 600,
                border: 'none',
              }}
            >
              Sous-total
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                padding: '16px',
                fontWeight: 600,
                color: '#0f172a',
                border: 'none',
              }}
            >
              {formatNumberWithSpaces(total)} F
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell 
              colSpan={2} 
              align="right"
              sx={{ 
                padding: '16px',
                color: '#64748b',
                fontWeight: 600,
                border: 'none',
              }}
            >
              Remise
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                padding: '16px',
                fontWeight: 600,
                color: '#dc2626',
                border: 'none',
              }}
            >
              - {formatNumberWithSpaces(total - discountedTotal)} F
            </TableCell>
          </TableRow>

          {(total - payerTotal) > 0 && (
            <TableRow>
              <TableCell 
                colSpan={2} 
                align="right"
                sx={{ 
                  padding: '16px',
                  color: '#64748b',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                Montant Payé
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  padding: '16px',
                  fontWeight: 600,
                  color: '#059669',
                  border: 'none',
                }}
              >
                {formatNumberWithSpaces(total - payerTotal)} F
              </TableCell>
            </TableRow>
          )}

          <TableRow>
            <TableCell 
              colSpan={2} 
              align="right"
              sx={{ 
                padding: '16px',
                color: '#64748b',
                fontWeight: 600,
                borderTop: '2px solid #e2e8f0',
              }}
            >
              {(total - payerTotal) > 0 ? "Reste à Payer" : "Total à Payer"}
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                padding: '16px',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#0f172a',
                borderTop: '2px solid #e2e8f0',
              }}
            >
              {formatNumberWithSpaces(resteAPayer)} F
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableFact;
