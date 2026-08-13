import { TableCell, TableRow, Avatar, Box, Typography, Chip, useTheme } from '@mui/material';
import { formatNumberWithSpaces, priceRow } from '../../../../usePerso/fonctionPerso';
import { format } from 'date-fns';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

export default function CardInfo({ row }: any) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const validDate = row?.date ? new Date(row.date) : new Date();
  const price = priceRow(row?.qte || 0, row?.pu || 0);

  // Générer des initiales ou une couleur par défaut pour le client
  const clientName = row?.client || 'Client anonyme';
  const firstLetter = clientName.charAt(0).toUpperCase();

  return (
    <TableRow 
      sx={{
        transition: 'background-color 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(59, 130, 246, 0.04)',
        },
        '& td': {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
          py: 1.75
        }
      }}
    >
      {/* Date */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#f1f5f9' : 'text.primary', fontSize: '0.85rem' }}>
            {isNaN(validDate.getTime()) ? '-' : format(validDate, 'dd/MM/yyyy')}
          </Typography>
        </Box>
      </TableCell>

      {/* Client */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar 
            sx={{ 
              width: 28, 
              height: 28, 
              fontSize: '0.75rem', 
              fontWeight: 600,
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'primary.light', 
              color: isDark ? '#93c5fd' : 'primary.main',
              border: '1px solid',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'primary.200'
            }}
          >
            {firstLetter || <PersonOutlineIcon sx={{ fontSize: 16 }} />}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#f1f5f9' : 'gray.800', fontSize: '0.875rem' }}>
            {clientName}
          </Typography>
        </Box>
      </TableCell>

      {/* Produit */}
      <TableCell>
        {row?.libelle ? (
          <Chip 
            label={row.libelle} 
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: 'rgba(59, 130, 246, 0.08)',
              color: '#1d4ed8',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '6px'
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled', italic: true }}>
            Non spécifié
          </Typography>
        )}
      </TableCell>

      {/* Quantité */}
      <TableCell align="right">
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            fontFamily: 'monospace',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(241, 245, 249, 0.8)',
            color: isDark ? '#f1f5f9' : 'text.primary',
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          {row?.qte ?? 0}
        </Typography>
      </TableCell>

      {/* Prix Unitaire */}
      <TableCell align="right">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary', fontWeight: 500 }}>
          {formatNumberWithSpaces(row?.pu ?? 0)} F
        </Typography>
      </TableCell>

      {/* Total */}
      <TableCell align="right">
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bg: 'blue.50', px: 1, py: 0.5, borderRadius: '6px' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f766e' }}>
            {formatNumberWithSpaces(price)} F
          </Typography>
          <LocalAtmIcon sx={{ fontSize: 16, color: '#0f766e' }} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

