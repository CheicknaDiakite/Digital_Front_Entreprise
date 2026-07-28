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

  return <Fragment>
    <TableRow
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.06)',
        },
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Avatar */}
      <TableCell align="center" sx={{ px: 1, py: 1.5 }}>
        <Avatar
          alt={row.categorie_libelle || 'article'}
          src={url}
          sx={{
            width: 44,
            height: 44,
            border: `2px solid ${row.is_remise ? '#f87171' : '#34d399'}`,
            boxShadow: `0 0 0 3px ${row.is_remise ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'}`,
          }}
        />
      </TableCell>

      {/* Date + Checkbox */}
      <TableCell sx={{ py: 1.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            checked={isChecked}
            onChange={handleChange}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              '&.Mui-checked': { color: '#6366f1' },
              p: 0.5,
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
            {format(new Date(row.date), 'dd/MM/yyyy')}
          </span>
        </div>
      </TableCell>

      {/* Ref badge */}
      <TableCell sx={{ py: 1.5 }}>
        {row.is_remise ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.03em',
          }}>
            {row.ref}
          </span>
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.3)',
            color: '#34d399',
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.03em',
          }}>
            {row.ref}
          </span>
        )}
      </TableCell>

      {/* Client */}
      <TableCell sx={{ py: 1.5 }}>
        {row.client && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {row.client}
          </span>
        )}
      </TableCell>

      {/* Désignation */}
      <TableCell sx={{ py: 1.5, color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 500 }}>
        {row.categorie_libelle}
      </TableCell>

      {/* Quantité */}
      <TableCell sx={{ py: 1.5, color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
        {row.qte} {row.unite === 'kilos' ? '' : row.unite}
      </TableCell>

      {/* Prix unitaire */}
      <TableCell sx={{ py: 1.5, color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
        {formatNumberWithSpaces(row.pu)}
      </TableCell>

      {/* Somme */}
      <TableCell sx={{ py: 1.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#a5b4fc',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatNumberWithSpaces(row.prix_total)}
          </span>
          <LocalAtmIcon sx={{ fontSize: 14, color: '#6366f1' }} />
        </div>
      </TableCell>

      {/* Action */}
      {(unUser.role === 1 || unUser.role === 2) && (
        <TableCell sx={{ py: 1.5 }}>
          <Link to={`/sortie/modif/${row.uuid}`}>
            <Stack direction="row" spacing={1}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(56,189,248,0.12)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}
              >
                <VisibilityIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
              </span>
            </Stack>
          </Link>
        </TableCell>
      )}
    </TableRow>
  </Fragment>
}
