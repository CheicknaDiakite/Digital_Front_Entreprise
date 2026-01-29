import { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import MainCard from '../../../../components/MainCard';
import Transitions from '../../../../components/@extended/Transitions';
import img from '../../../../../public/icon-192x192.png'
// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// functional imports
import { useGetAllEntre } from '../../../../usePerso/fonction.entre';
import { useStoreUuid } from '../../../../usePerso/store';
import { BASE } from '../../../../_services/caller.service';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const uuid = useStoreUuid((state) => state.selectedId);
  const { entresEntreprise } = useGetAllEntre(uuid!);

  // Filter and sort notifications based on stock levels
  const notifications = useMemo(() => {
    if (!entresEntreprise) return [];

    return entresEntreprise
      .filter((item) => (item.qte || 0) <= 20) // Threshold for notification
      .sort((a, b) => (a.qte || 0) - (b.qte || 0)); // Sort by quantity ascending (lowest first)
  }, [entresEntreprise]);

  const [readCount, setReadCount] = useState<number | null>(null);

  // Update read count based on current notifications if not manually cleared
  const displayCount = readCount !== null ? readCount : notifications.length;
  
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    if (!open) {
      // Optional: Reset read count when opening?
      // setReadCount(0); 
    }
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = () => {
    setReadCount(0);
  };

  const iconBackColorOpen = 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }} className="mx-2">
      <IconButton
        className='bg-green-50'
        color="primary"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={displayCount} color="error">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications des Stocks"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {displayCount > 0 && (
                        <Tooltip title="Tout marquer comme lu">
                          <IconButton color="success" size="small" onClick={handleMarkAllRead}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"

                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((item, index) => {
                        const qte = item.qte || 0;
                        const isCritical = qte <= 5;
                        const url = item.image ? BASE(item.image) : img;

                        return (
                          <div key={index}>
                            <ListItemButton component={Link} to="/entre" onClick={() => setOpen(false)}>
                              <ListItemAvatar>

                                <Avatar
                                  alt="img"
                                  src={url}
                                  sx={{ width: 56, height: 56 }}
                                />
                              </ListItemAvatar>
                              <ListItemText className='text-red-400'
                                primary={
                                  <Typography variant="h6">
                                    Stock faible :{' '}
                                    <Typography component="span" variant="subtitle1" fontWeight="bold">
                                      {item.categorie_libelle}
                                    </Typography>
                                  </Typography>
                                }
                                secondary={`Quantité restante : ${qte} ${item.unite === 'kilos' ? '' : item.unite}`}
                              />
                              <ListItemSecondaryAction>
                                <Typography variant="caption" noWrap color={isCritical ? 'error' : 'textSecondary'} className='text-red-600'>
                                  {isCritical ? 'Critique' : 'Attention'}
                                </Typography>
                              </ListItemSecondaryAction>
                            </ListItemButton>
                            <Divider />
                          </div>
                        );
                      })
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          Aucune alerte de stock.
                        </Typography>
                      </Box>
                    )}

                    {/* {notifications.length > 3 && (
                      <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }} component={Link} to="/entre/index" onClick={() => setOpen(false)}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="primary">
                              voir le reste
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )} */}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
