import { Stack, TableCell, TableRow } from '@mui/material'

import { Link } from 'react-router-dom';
import { DepenseType } from '../../../typescript/DataType';
import { format } from 'date-fns';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';

type EntreProps = {
  row: DepenseType
}

export default function CardDepense({ row }: EntreProps) {
  

  return (
    <TableRow>
            
        
        <TableCell>
          {format(new Date(row.date), 'dd/MM/yyyy')}
        </TableCell>
       
        <TableCell>
          {row.libelle}        
         </TableCell>
        
        <TableCell >{formatNumberWithSpaces(row.somme)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>

        <TableCell>
          <Link to={`/entreprise/depense/${row.uuid}`}>
            <Stack direction="row" spacing={2}>
              <VisibilityIcon color="info" fontSize="medium" />
            </Stack>
          </Link>
        </TableCell>  
    </TableRow>
  )

}
