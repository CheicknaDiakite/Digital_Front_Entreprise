import { Box, Typography } from '@mui/material';
import { ChartSectionProps } from '../types';

export const ChartSection: React.FC<ChartSectionProps> = ({ title, children, className }) => {
  return (
    <Box 
      className={className}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.18)',
        borderRadius: '20px',
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: '0 12px 36px rgba(99, 102, 241, 0.12)',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          mb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#e0e7ff',
            fontSize: { xs: '1.05rem', sm: '1.2rem' },
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            '&::before': {
              content: '""',
              width: 4,
              height: 18,
              bgcolor: '#6366f1',
              borderRadius: 4,
              display: 'inline-block',
            }
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  );
}; 