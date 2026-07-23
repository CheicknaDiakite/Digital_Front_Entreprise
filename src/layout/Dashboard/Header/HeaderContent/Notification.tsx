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
    <Box sx={{ flexShrink: 0 }}>
      <IconButton
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{
          p: 1,
          borderRadius: '12px',
          color: open ? '#818cf8' : '#e2e8f0',
          bgcolor: open ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid',
          borderColor: open ? 'rgba(99, 102, 241, 0.45)' : 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: open ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none',
          '&:hover': {
            bgcolor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 0.45)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Badge
          badgeContent={displayCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#ef4444',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            },
          }}
        >
          <BellOutlined style={{ fontSize: '1.15rem' }} />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 10] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                minWidth: { xs: 300, sm: 360 },
                maxWidth: { xs: 320, md: 420 },
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.15)',
                overflow: 'hidden',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      px: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                        Notifications des Stocks
                      </Typography>
                      {displayCount > 0 && (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: '12px',
                            bgcolor: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          {displayCount}
                        </Box>
                      )}
                    </Box>
                    {displayCount > 0 && (
                      <Tooltip title="Tout marquer comme lu">
                        <IconButton
                          size="small"
                          onClick={handleMarkAllRead}
                          sx={{
                            color: '#4ade80',
                            bgcolor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            '&:hover': {
                              bgcolor: 'rgba(34, 197, 94, 0.25)',
                            },
                          }}
                        >
                          <CheckCircleOutlined style={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <List component="nav" sx={{ p: 1, maxHeight: 380, overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 6).map((item, index) => {
                        const qte = item.qte || 0;
                        const isCritical = qte <= 5;
                        const url = item.image ? BASE(item.image) : img;

                        return (
                          <ListItemButton
                            key={index}
                            component={Link}
                            to="/entre"
                            onClick={() => setOpen(false)}
                            sx={{
                              borderRadius: '14px',
                              mb: 0.75,
                              p: 1.25,
                              transition: 'all 0.2s ease',
                              bgcolor: isCritical ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                              border: '1px solid',
                              borderColor: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              '&:hover': {
                                bgcolor: isCritical ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                transform: 'translateX(3px)',
                              },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 48, mr: 1.5 }}>
                              <Avatar
                                alt="img"
                                src={url}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '10px',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.875rem' }}>
                                  Stock faible : {item.categorie_libelle}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.775rem' }}>
                                  Quantité restante : <strong style={{ color: isCritical ? '#f87171' : '#fbbf24' }}>{qte}</strong>{' '}
                                  {item.unite === 'kilos' ? '' : item.unite}
                                </Typography>
                              }
                            />
                            <Box
                              sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: isCritical ? '#f87171' : '#fbbf24',
                                border: '1px solid',
                                borderColor: isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                                ml: 1,
                              }}
                            >
                              {isCritical ? 'Critique' : 'Attention'}
                            </Box>
                          </ListItemButton>
                        );
                      })
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          Aucune alerte de stock.
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
