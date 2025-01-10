import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { Fragment } from 'react'
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso'

export default function TableFact({list, total}: any) {
  
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell>Designation</TableCell>
              <TableCell>Quantite</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Somme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            
            {list.map((post: any, index: number) => (
              <Fragment key={index} >
              <TableRow>
                  <TableCell>{post.categorie_libelle}</TableCell>                  
                  <TableCell>{post.qte}</TableCell>
                  <TableCell >{formatNumberWithSpaces(post.pu)}</TableCell>
                  <TableCell >{formatNumberWithSpaces(post.prix_total)}</TableCell>        
              </TableRow>
            </Fragment>
            )
            
            )} 
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <h2 className="flex items-end justify-end text-gray-800 text-4xl font-bold">
          Total hors taxe: {formatNumberWithSpaces(total)}
        </h2>
      </div>
    </>
  )
}
