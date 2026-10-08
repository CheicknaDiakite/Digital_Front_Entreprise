import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tooltip,
  Button,
  Typography,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton,
  Stack
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useQueryClient } from '@tanstack/react-query';

import { useFetchUser, useGetEntrepriseUsers, useRemoveUserEntreprise } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';
import { useState, useMemo } from 'react';
import { RecupType } from '../../../../../typescript/DataType';

export default function InfoUsers() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { entrepriseUsers = [], isLoading, isError } = useGetEntrepriseUsers(uuid!);
  const { removeEntreprise } = useRemoveUserEntreprise();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<RecupType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');

  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';

  const handleDelete = (user: RecupType) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (userToDelete && userToDelete.uuid) {
      removeEntreprise({
        entreprise_id: uuid!,
        user_id: userToDelete.uuid,
        admin_id: user_id,
      });
      // Invalidate queries to ensure real-time update
      queryClient.invalidateQueries({ queryKey: ["entrepriseUsers", uuid] });
      queryClient.invalidateQueries({ queryKey: ["EntreModif"] });
    }
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  // Filtered members by search & role
  const filteredUsers = useMemo(() => {
    return (entrepriseUsers || []).filter((user) => {
      const isAdmin = user.uuid === user_id;

      if (roleFilter === 'admin' && !isAdmin) return false;
      if (roleFilter === 'member' && isAdmin) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const matchUsername = user.username?.toLowerCase().includes(q) || false;
      const matchFirst = user.first_name?.toLowerCase().includes(q) || false;
      const matchLast = user.last_name?.toLowerCase().includes(q) || false;
      const matchEmail = user.email?.toLowerCase().includes(q) || false;

      return matchUsername || matchFirst || matchLast || matchEmail;
    });
  }, [entrepriseUsers, user_id, searchTerm, roleFilter]);

  const totalCount = entrepriseUsers?.length || 0;
  const adminCount = (entrepriseUsers || []).filter((u) => u.uuid === user_id).length || 1;
  const memberCount = Math.max(0, totalCount - adminCount);

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width="200px" height={32} />
            <Skeleton variant="rounded" width="100px" height={32} sx={{ borderRadius: '8px' }} />
          </Box>
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="180px" height={24} />
                  <Skeleton variant="text" width="120px" height={18} />
                </Box>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '16px' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
              startIcon={<RefreshRoundedIcon />}
              sx={{ fontWeight: 600 }}
            >
              Réessayer
            </Button>
          }
        >
          Problème lors du chargement des membres de l'entreprise.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDelete}
        onClose={cancelDelete}
        aria-labelledby="confirm-delete-dialog"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 440,
            p: 1
          }
        }}
      >
        <DialogTitle id="confirm-delete-dialog" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 2, px: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '12px',
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              display: 'flex'
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Révoquer l'accès
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Action de sécurité administrateur
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir retirer <strong>{userToDelete?.username || 'cet utilisateur'}</strong> de cette entreprise ? Il perdra immédiatement l'accès à tous les modules et données de stock.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: theme.palette.divider
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              bgcolor: theme.palette.error.main,
              '&:hover': { bgcolor: theme.palette.error.dark }
            }}
          >
            Confirmer la révocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header with Title and KPI counters */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: 1.25,
              borderRadius: '14px',
              color: theme.palette.primary.main,
              display: 'flex'
            }}
          >
            <GroupRoundedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
              Équipe & Droits d'Accès
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Gérez les collaborateurs et les administrateurs rattachés à votre établissement
            </Typography>
          </Box>
        </Box>

        {/* Counter chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<BadgeRoundedIcon sx={{ fontSize: '16px !important' }} />}
            label={`${totalCount} membre${totalCount > 1 ? 's' : ''}`}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          />
        </Stack>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '18px',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.9),
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between'
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher par identifiant, nom, prénom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
        />

        {/* Role Segmented Filter */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
          <Chip
            label={`Tous (${totalCount})`}
            size="small"
            onClick={() => setRoleFilter('all')}
            variant={roleFilter === 'all' ? 'filled' : 'outlined'}
            color={roleFilter === 'all' ? 'primary' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
          <Chip
            label={`Admins (${adminCount})`}
            size="small"
            onClick={() => setRoleFilter('admin')}
            variant={roleFilter === 'admin' ? 'filled' : 'outlined'}
            color={roleFilter === 'admin' ? 'success' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
          <Chip
            label={`Collaborateurs (${memberCount})`}
            size="small"
            onClick={() => setRoleFilter('member')}
            variant={roleFilter === 'member' ? 'filled' : 'outlined'}
            color={roleFilter === 'member' ? 'primary' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
        </Stack>
      </Paper>

      {/* User Directory List */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.2)'
            : '0 8px 24px rgba(0,0,0,0.03)'
        }}
      >
        {filteredUsers && filteredUsers.length > 0 ? (
          <List disablePadding>
            {filteredUsers.map((user, index) => {
              const isAdmin = user.uuid === user_id;
              const isCurrentUser = user.uuid === user_id;
              const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');

              return (
                <Box key={user.uuid || index}>
                  <ListItem
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 2.2,
                      borderLeft: isAdmin
                        ? `4px solid ${theme.palette.success.main}`
                        : `4px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                    secondaryAction={
                      isAdmin ? (
                        <Tooltip title="Administrateur principal du compte" arrow TransitionComponent={Fade}>
                          <Chip
                            icon={<SecurityRoundedIcon sx={{ fontSize: '15px !important' }} />}
                            label="Protégé"
                            size="small"
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Retirer l'accès à cette entreprise" arrow TransitionComponent={Fade}>
                          <IconButton
                            onClick={() => handleDelete(user)}
                            size="small"
                            sx={{
                              color: theme.palette.error.main,
                              bgcolor: alpha(theme.palette.error.main, 0.06),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.15),
                                transform: 'scale(1.05)'
                              },
                              borderRadius: '10px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          bgcolor: isAdmin
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.12),
                          color: isAdmin ? theme.palette.success.main : theme.palette.primary.main,
                          border: `1.5px solid ${isAdmin ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.primary.main, 0.3)}`,
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        {user.username?.charAt(0)?.toUpperCase() || (isAdmin ? <AdminPanelSettingsRoundedIcon /> : <PersonOutlineRoundedIcon />)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {user.username}
                          </Typography>

                          {isCurrentUser && (
                            <Chip
                              label="Vous"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderRadius: '6px'
                              }}
                            />
                          )}

                          {isAdmin ? (
                            <Chip
                              icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: '13px !important' }} />}
                              label="Administrateur"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                borderRadius: '6px'
                              }}
                            />
                          ) : (
                            <Chip
                              label="Collaborateur"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.text.primary, 0.05),
                                color: 'text.secondary',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '6px'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.3, flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {fullName || 'Nom complet non spécifié'}
                          </Typography>
                          {user.email && (
                            <>
                              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {user.email}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredUsers.length - 1 && (
                    <Divider sx={{ borderColor: theme.palette.divider }} />
                  )}
                </Box>
              );
            })}
          </List>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, px: 2, gap: 1.5 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main
              }}
            >
              <GroupRoundedIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
              {searchTerm ? 'Aucun membre trouvé' : 'Aucun utilisateur enregistré'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}>
              {searchTerm
                ? `Aucun collaborateur ne correspond à votre filtre "${searchTerm}".`
                : "Aucun membre n'est encore associé à cette entreprise."}
            </Typography>
            {searchTerm && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSearchTerm('')}
                sx={{ borderRadius: '10px', textTransform: 'none', mt: 1 }}
              >
                Réinitialiser la recherche
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}