import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// project import
import Transitions from '../../../../components/@extended/Transitions';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import InboxOutlined from '@ant-design/icons/InboxOutlined';

// functional imports
import { useStoreUuid } from '../../../../usePerso/store';
import { notificationService, AppNotification } from '../../../../_services/notification.service';

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const uuid = useStoreUuid((state) => state.selectedId);
  const queryClient = useQueryClient();

  const { data: notificationData } = useQuery({
    queryKey: ['notifications', uuid],
    queryFn: () => notificationService.getNotifications(uuid!).then((response) => response.data),
    enabled: Boolean(uuid),
    refetchInterval: 60_000,
  });

  const rawNotifications = notificationData?.donnee || [];
  const displayCount = notificationData?.non_lues || 0;

  // Tri professionnel : Non lues d'abord, puis alertes critiques/stock, puis les plus récentes
  const sortedNotifications = useMemo(() => {
    return [...rawNotifications].sort((first, second) => {
      // 1. Les non lues d'abord
      if (first.lu !== second.lu) {
        return first.lu ? 1 : -1;
      }
      // 2. Priorité aux alertes de stock
      const firstIsStock = first.type === 'stock_faible' ? 0 : 1;
      const secondIsStock = second.type === 'stock_faible' ? 0 : 1;
      if (firstIsStock !== secondIsStock) {
        return firstIsStock - secondIsStock;
      }
      // 3. Du plus récent au plus ancien
      return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
    });
  }, [rawNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return sortedNotifications.filter((item) => !item.lu);
    }
    return sortedNotifications;
  }, [sortedNotifications, filter]);

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAsRead(uuid!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', uuid] }),
  });

  const markOneRead = useMutation({
    mutationFn: (notificationUuid: string) => notificationService.markAsRead(uuid!, [notificationUuid]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', uuid] }),
  });

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = () => {
    if (uuid) markAllRead.mutate();
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
    } catch {
      return '';
    }
  };

  return (
    <Box sx={{ flexShrink: 0 }}>
      {/* Bouton Cloche */}
      <IconButton
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{
          p: 1,
          borderRadius: '12px',
          color: open ? 'primary.main' : 'text.primary',
          bgcolor: open ? 'rgba(99, 102, 241, 0.2)' : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.78)',
          border: '1px solid',
          borderColor: open ? 'rgba(99, 102, 241, 0.45)' : theme.palette.divider,
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

      {/* Menu Déroulant Popper */}
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
                minWidth: { xs: 320, sm: 380 },
                maxWidth: { xs: 340, md: 440 },
                borderRadius: '20px',
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)'
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 249, 253, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.15)'
                    : '0 20px 40px rgba(15,23,42,0.16)',
                overflow: 'hidden',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* En-tête */}
                  <Box
                    sx={{
                      p: 2,
                      px: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700 }}>
                        Notifications
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
                          {displayCount} non lue{displayCount > 1 ? 's' : ''}
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

                  {/* Onglets Filtres (Toutes / Non lues) */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.015)',
                    }}
                  >
                    <Chip
                      size="small"
                      label={`Toutes (${rawNotifications.length})`}
                      clickable
                      color={filter === 'all' ? 'primary' : 'default'}
                      variant={filter === 'all' ? 'filled' : 'outlined'}
                      onClick={() => setFilter('all')}
                      sx={{ fontSize: '0.75rem', fontWeight: 600, height: 26 }}
                    />
                    <Chip
                      size="small"
                      label={`Non lues (${displayCount})`}
                      clickable
                      color={filter === 'unread' ? 'primary' : 'default'}
                      variant={filter === 'unread' ? 'filled' : 'outlined'}
                      onClick={() => setFilter('unread')}
                      sx={{ fontSize: '0.75rem', fontWeight: 600, height: 26 }}
                    />
                  </Box>

                  {/* Liste des notifications */}
                  <List component="nav" sx={{ p: 1, maxHeight: 380, overflowY: 'auto' }}>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.slice(0, 10).map((item: AppNotification) => {
                        const isCritical = item.niveau === 'error';
                        const isStockAlert = item.type === 'stock_faible';
                        const isUnread = !item.lu;

                        const statusLabel = isStockAlert
                          ? isCritical
                            ? 'Rupture'
                            : 'Stock faible'
                          : isCritical
                          ? 'Urgent'
                          : 'Info';

                        return (
                          <ListItemButton
                            key={item.uuid}
                            component={Link}
                            to={item.lien || '/'}
                            onClick={() => {
                              if (isUnread) {
                                markOneRead.mutate(item.uuid);
                              }
                              setOpen(false);
                            }}
                            sx={{
                              borderRadius: '14px',
                              mb: 0.75,
                              p: 1.25,
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              // Distinction visuelle : Non lue = contrastée et bordée, Lue = neutre et discrète
                              bgcolor: isUnread
                                ? isCritical
                                  ? 'rgba(239, 68, 68, 0.08)'
                                  : 'rgba(99, 102, 241, 0.08)'
                                : theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.02)'
                                : 'rgba(0, 0, 0, 0.01)',
                              border: '1px solid',
                              borderColor: isUnread
                                ? isCritical
                                  ? 'rgba(239, 68, 68, 0.25)'
                                  : 'rgba(99, 102, 241, 0.25)'
                                : theme.palette.divider,
                              opacity: isUnread ? 1 : 0.78,
                              '&:hover': {
                                opacity: 1,
                                bgcolor: isUnread
                                  ? isCritical
                                    ? 'rgba(239, 68, 68, 0.14)'
                                    : 'rgba(99, 102, 241, 0.14)'
                                  : 'rgba(99, 102, 241, 0.06)',
                                transform: 'translateX(3px)',
                              },
                            }}
                          >
                            {/* Point lumineux indicateur de statut Non Lu */}
                            {isUnread && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 6,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: isCritical ? '#ef4444' : '#6366f1',
                                  boxShadow: `0 0 6px ${isCritical ? '#ef4444' : '#6366f1'}`,
                                }}
                              />
                            )}

                            <ListItemAvatar sx={{ minWidth: 44, ml: isUnread ? 0.8 : 0, mr: 1.2 }}>
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: isCritical
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : item.niveau === 'warning'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(99, 102, 241, 0.15)',
                                  color: isCritical
                                    ? '#ef4444'
                                    : item.niveau === 'warning'
                                    ? '#f59e0b'
                                    : '#6366f1',
                                }}
                              >
                                {isStockAlert ? (
                                  <InboxOutlined style={{ fontSize: '1.05rem' }} />
                                ) : isCritical ? (
                                  <WarningOutlined style={{ fontSize: '1.05rem' }} />
                                ) : (
                                  <InfoCircleOutlined style={{ fontSize: '1.05rem' }} />
                                )}
                              </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      color: 'text.primary',
                                      fontWeight: isUnread ? 700 : 500,
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    {item.titre}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.7rem',
                                      flexShrink: 0,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {getTimeAgo(item.created_at)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.3 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isUnread ? 'text.secondary' : 'text.disabled',
                                      fontSize: '0.75rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {item.message}
                                  </Typography>
                                  <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box
                                      sx={{
                                        px: 0.8,
                                        py: 0.15,
                                        borderRadius: '6px',
                                        fontSize: '0.675rem',
                                        fontWeight: 700,
                                        bgcolor: isCritical
                                          ? 'rgba(239, 68, 68, 0.15)'
                                          : item.niveau === 'warning'
                                          ? 'rgba(245, 158, 11, 0.15)'
                                          : 'rgba(99, 102, 241, 0.15)',
                                        color: isCritical
                                          ? '#f87171'
                                          : item.niveau === 'warning'
                                          ? '#fbbf24'
                                          : '#818cf8',
                                        border: '1px solid',
                                        borderColor: isCritical
                                          ? 'rgba(239, 68, 68, 0.25)'
                                          : item.niveau === 'warning'
                                          ? 'rgba(245, 158, 11, 0.25)'
                                          : 'rgba(99, 102, 241, 0.25)',
                                      }}
                                    >
                                      {statusLabel}
                                    </Box>
                                    {!isUnread && (
                                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.675rem' }}>
                                        Déjà lu
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />

                            {/* Bouton unitaire au survol pour marquer comme lu sans naviguer */}
                            {isUnread && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    markOneRead.mutate(item.uuid);
                                  }}
                                  sx={{
                                    ml: 0.5,
                                    p: 0.6,
                                    color: 'text.secondary',
                                    borderRadius: '8px',
                                    '&:hover': {
                                      color: '#22c55e',
                                      bgcolor: 'rgba(34, 197, 94, 0.15)',
                                    },
                                  }}
                                >
                                  <CheckOutlined style={{ fontSize: '0.8rem' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </ListItemButton>
                        );
                      })
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: '2.2rem', color: '#10b981', marginBottom: 10 }} />
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                          Vous êtes à jour !
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          {filter === 'unread' ? 'Aucune alerte non lue.' : 'Aucune notification enregistrée.'}
                        </Typography>
                      </Box>
                    )}
                  </List>

                  {/* Pied de page avec lien rapide */}
                  {filteredNotifications.length > 0 && (
                    <Box
                      sx={{
                        p: 1.25,
                        textAlign: 'center',
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                      }}
                    >
                      <Typography
                        component={Link}
                        to="/entre"
                        onClick={() => setOpen(false)}
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Consulter les entrées et alertes de stock →
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
