import { Stack, TableCell, TableRow, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

export default function CardFacSortie({row}: any) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const validDate = row.date ?? new Date();
  return (
    <TableRow
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
        },
        '& .MuiTableCell-root': {
          color: isDark ? '#f1f5f9' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
        },
      }}
    >            
      
      <TableCell>
        {format(new Date(validDate), 'dd/MM/yyyy')}
      </TableCell>
      
      <TableCell>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {row.libelle}
          </span>           
      </TableCell>
      <TableCell>{row.ref}</TableCell>

      <TableCell>
        <Link to={`/entreprise/produit/sortie/modif/${row.uuid}`}>
          <Stack direction="row" spacing={2}>
            <VisibilityIcon color="info" fontSize="medium" />
          </Stack>
        </Link>
      </TableCell>       
    </TableRow>
  )
}
