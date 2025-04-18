import PropTypes from 'prop-types';

// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import MainCard from '../../../components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

type AnalyticEcommerceProps = {
  color?: string;
  pied?: string;
  pied_qte?: string;
  qte?: number | string;
  user?: number ;
  title?: string;
  client?: string;
  count?: number | string;
  percentage?: number | string;
  isLoss?: boolean;
  extra?: number | string;
  className?: string; // utiliser 'className' au lieu de 'class'
};

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra, pied, className, pied_qte, qte, client, user }:AnalyticEcommerceProps) {
  
  return (
    <MainCard contentSX={{ p: 2.25 }} className={className}>
      <Stack spacing={0.5}>
        
        {client && 
        <Typography variant="h6" color="text.primary">
          Fournisseur = {client}
        </Typography>
        }
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                // variant="combined"
                // color={color}
                icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                label={`${percentage}`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.25 }}>
      {(user === 1 || user === 2) &&  
        <Typography variant="caption" color="text.secondary">
          {pied} {' '}
          <Typography variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
            {extra} {' '}
          </Typography>          
        </Typography>
      }

        <Typography variant="caption" color="text.secondary">
          {pied_qte} {' '}
          <Typography variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
            {qte} {}
          </Typography>          
        </Typography>
      </Box>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string
};
