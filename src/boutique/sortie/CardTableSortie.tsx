import { Avatar, Checkbox, Stack, TableCell, TableRow } from '@mui/material'
import { Fragment } from 'react'
import { useStoreCart } from '../../usePerso/cart_store';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Link } from 'react-router-dom';
import { useFetchUser } from '../../usePerso/fonction.user';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import img from '../../../public/icon-192x192.png'
export default function CardTableSortie({ row }: any) {
  const url = row.image ? BASE(row.image) : img;
  const { unUser } = useFetchUser()

  const selectedIds = useStoreCart(state => state.selectedIds)
  const toggleId = useStoreCart(state => state.toggleId)

  const id = row.id ?? 0;
  const isChecked = selectedIds.has(id);

  const handleChange = () => {
    toggleId(id);
  };

  return <Fragment >
    <TableRow>
      <TableCell align="right">
        {/* <img src={url} alt="img" className="h-16 w-16" /> */}
        <Avatar
          alt="Remy Sharp"
          src={url}
          sx={{ width: 56, height: 56 }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          checked={isChecked}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        {format(new Date(row.date), 'dd/MM/yyyy')}
      </TableCell>

      <TableCell>
        {row.is_remise ?
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
            {row.ref}
          </span>
          :
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
            {row.ref}
          </span>
        }

      </TableCell>

      <TableCell>
        {row.client &&
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            {row.client}
          </span>
        }
      </TableCell>

      <TableCell>
        {row.categorie_libelle}
      </TableCell>
      <TableCell >{row.qte} {row.unite === 'kilos' ? '' : row.unite}</TableCell>
      <TableCell >{formatNumberWithSpaces(row.pu)}</TableCell>
      <TableCell >{formatNumberWithSpaces(row.prix_total)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
      {/* {ccyFormat(price)} */}
      {(unUser.role === 1 || unUser.role === 2) &&
        <TableCell>
          <Link to={`/sortie/modif/${row.uuid}`}>
            <Stack direction="row" spacing={2}>
              {/* <Item>Modifier</Item> */}
              <VisibilityIcon color="info" fontSize="medium" />
            </Stack>
          </Link>
        </TableCell>
      }
    </TableRow>
  </Fragment>
}
