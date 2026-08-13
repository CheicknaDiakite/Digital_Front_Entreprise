import { Stack, TableCell, TableRow, useTheme } from '@mui/material';

import { Link } from 'react-router-dom';
import { DepenseType } from '../../../typescript/DataType';
import { format } from 'date-fns';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

type EntreProps = {
  row: DepenseType;
};

export default function CardDepense({ row }: EntreProps) {
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
        {row.libelle}        
      </TableCell>
      
      <TableCell>{formatNumberWithSpaces(row.somme)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>

      <TableCell>
        <Link to={`/entreprise/depense/${row.uuid}`}>
          <Stack direction="row" spacing={2}>
            <VisibilityIcon color="info" fontSize="medium" />
          </Stack>
        </Link>
      </TableCell>  
    </TableRow>
  );
}
