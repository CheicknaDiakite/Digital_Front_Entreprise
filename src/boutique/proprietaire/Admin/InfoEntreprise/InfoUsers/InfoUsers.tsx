import { 
  Alert, 
  Avatar, 
  Box, 
  Chip, 
  CircularProgress, 
  Container,
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useFetchUser, useGetEntrepriseUsers, useRemoveUserEntreprise } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';
import { useState } from 'react';
import '../../mobile-admin.css';

export default function InfoUsers() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { entrepriseUsers, isLoading, isError } = useGetEntrepriseUsers(uuid!);
  const { removeEntreprise } = useRemoveUserEntreprise();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';
  
  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      removeEntreprise({
        entreprise_id: uuid!,
        user_id: userToDelete,
        admin_id: user_id,
      });
    }
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: 2 }}>
        <CircularProgress size={44} thickness={4} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chargement des utilisateurs...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        >
          Problème de connexion ! Veuillez réessayer.
        </Alert>
      </Box>
    );
  }

  const totalUsers = entrepriseUsers?.length || 0;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDelete}
        onClose={cancelDelete}
        aria-labelledby="confirm-delete-dialog"
        PaperProps={{
          elevation: 0,
          sx: { borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: 400 }
        }}
      >
        <DialogTitle id="confirm-delete-dialog" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 3, px: 3 }}>
          <WarningAmberIcon sx={{ color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Confirmer la suppression</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Êtes-vous sûr de vouloir retirer cet utilisateur de l'entreprise ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={cancelDelete} 
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1.25, borderRadius: '12px', color: '#3b82f6', display: 'flex' }}>
            <GroupIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Utilisateurs de l'entreprise
            </Typography>
            <Typography variant="caption" className="text-gray-300">
              Gérez les accès et les membres de votre équipe
            </Typography>
          </Box>
        </Box>
        <Chip 
          icon={<GroupIcon sx={{ fontSize: '16px !important' }} />}
          label={`${totalUsers} membre${totalUsers !== 1 ? 's' : ''}`}
          variant="outlined"
          sx={{ borderRadius: '8px', fontWeight: 600, borderColor: '#cbd5e1' }}
        />
      </Box>

      {/* User List */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          // bgcolor: '#ffffff'
        }}
      >
        {entrepriseUsers && entrepriseUsers.length > 0 ? (
          <List disablePadding>
            {entrepriseUsers.map((user, index) => {
              const isAdmin = user.uuid === user_id;
              return (
                <Box key={user.uuid || index}>
                  <ListItem
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                        transition: 'background-color 0.2s ease',
                      }
                    }}
                    secondaryAction={
                      isAdmin ? (
                        <Tooltip title="Administrateur de l'entreprise" arrow TransitionComponent={Fade}>
                          <Box sx={{ 
                            bgcolor: 'rgba(22, 163, 74, 0.1)', 
                            p: 1, 
                            borderRadius: '10px', 
                            color: '#16a34a',
                            display: 'flex'
                          }}>
                            <AdminPanelSettingsIcon fontSize="small" />
                          </Box>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Retirer l'utilisateur" arrow TransitionComponent={Fade}>
                          <IconButton 
                            onClick={() => handleDelete(user.uuid!)}
                            size="small"
                            sx={{ 
                              color: '#ef4444', 
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
                              borderRadius: '10px'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: isAdmin ? 'rgba(22, 163, 74, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: isAdmin ? '#16a34a' : '#3b82f6',
                          border: `2px solid ${isAdmin ? 'rgba(22, 163, 74, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                          fontWeight: 700,
                          fontSize: '0.875rem'
                        }}
                      >
                        {user.username?.charAt(0)?.toUpperCase() || (isAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.username}
                          </Typography>
                          {isAdmin && (
                            <Chip
                              label="Admin"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(22, 163, 74, 0.1)',
                                color: '#16a34a',
                                border: '1px solid rgba(22, 163, 74, 0.2)'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption">
                          {[user.last_name, user.first_name].filter(Boolean).join(' ') || 'Nom non renseigné'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < entrepriseUsers.length - 1 && (
                    <Divider sx={{ mx: 3, borderColor: '#f1f5f9' }} />
                  )}
                </Box>
              );
            })}
          </List>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
            <GroupIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
            <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600 }}>
              Aucun utilisateur enregistré
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 320, textAlign: 'center' }}>
              Aucun membre n'est encore associé à cette entreprise.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}