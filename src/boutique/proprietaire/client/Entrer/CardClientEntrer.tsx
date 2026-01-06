import { Stack, TableCell, TableRow } from '@mui/material'

import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { RecupType } from '../../../../typescript/DataType';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatNumberWithSpaces, priceRow } from '../../../../usePerso/fonctionPerso';
import { useFetchUser } from '../../../../usePerso/fonction.user';

type EntreProps = {
  row: RecupType
}

export default function CardClientEntrer({ row }: EntreProps) {
  const validDate = row.date ?? new Date();
  const { unUser } = useFetchUser();
  if (row.qte !== undefined && row.pu_achat !== undefined) {
    const price = priceRow(row.qte, row.pu_achat);

  return (
    <TableRow>
            
        <Link to={`/entre/modif/${row.uuid}`}>
          <TableCell>
            {/* {row.date} */}
            {format(new Date(validDate), 'dd/MM/yyyy')}
          </TableCell>
        </Link>
        <TableCell>
        {row.categorie_libelle}{" "}
        {row.libelle &&
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {row.libelle}
          </span>
        }         
         </TableCell>
        <TableCell align="right">{row.qte}</TableCell>
        <TableCell align="right">{row.pu_achat}</TableCell>
        <TableCell align="right">{formatNumberWithSpaces(price)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
        {(unUser.role === 1 || unUser.role === 2) && (
          <TableCell className={row.is_sortie ? 'bg-white' : 'bg-white'}>
            <Link to={`/entre/modif/${row.uuid}`}>
              <Stack direction="row" spacing={2}>
                <VisibilityIcon color={row.is_sortie ? 'info' : 'error'} fontSize="medium" />
              </Stack>
            </Link>
          </TableCell>
        )}
    </TableRow>
  )
} else {
  console.log("erreur de typage PU | QTE")
}
}
