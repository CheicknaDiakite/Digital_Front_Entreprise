import {
  Typography,
  Button,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Paper,
  Box,
  Divider,
  Dialog,
  Switch,
  Grid,
  Stack,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../../_services/account.service';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useDeleteUser, useFetchUnUser, useFetchUser, useUpdateUser } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { useTheme } from '@mui/material/styles';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { PageHeader } from '../../../_components/common';
import toast from 'react-hot-toast';

const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const ROLES: Record<number, { label: string; description: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'default' }> = {
  1: { label: 'Administrateur', description: 'Accès total à tous les modules', color: 'secondary' },
  2: { label: 'Superviseur', description: 'Gestion des stocks, entrées/sorties et rapports', color: 'primary' },
  3: { label: 'Caissier(e)', description: 'Accès à la caisse (POS) et ventes comptoir', color: 'success' },
  4: { label: 'Sans attribution', description: 'Compte restreint en attente d’affectation', color: 'default' },
};

export function PersonnelModif() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { unUser, setUnUser } = useFetchUnUser(uuid!);
  const { unUser: loggedInUser } = useFetchUser();

  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [restriction, setRestriction] = useState({
    active: false,
    day_start: 0,
    day_end: 4,
    hour_start: '08:00',
    hour_end: '18:00',
  });

  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  useEffect(() => {
    if (uuid) {
      userService.userRestrictionDetail(uuid).then((res) => {
        if (res.data) {
          setRestriction((prev) => ({ ...prev, ...res.data }));
        }
      });
    }
  }, [uuid]);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteUser(unUser);
    setShowConfirm(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUnUser({
      ...unUser,
      [name]: value,
    });
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setUnUser({
      ...unUser,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (unUser.password && unUser.password !== unUser.repassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      unUser['user_id'] = loggedInUser?.uuid || '';
      unUser['entreprise_id'] = entreprise_id!;
      updateUser(unUser);
      await userService.userRestrictionDetail(uuid!, restriction);
      toast.success('Profil et restrictions mis à jour avec succès.');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setTimeout(() => setIsSubmitting(false), 1200);
    }
  };

  const currentRole = ROLES[unUser?.role as number] || ROLES[4];
  const userInitials = `${(unUser?.first_name?.[0] || '').toUpperCase()}${(unUser?.last_name?.[0] || '').toUpperCase()}` || 'U';

  const cardStyle = {
    p: { xs: 2.5, sm: 3 },
    borderRadius: '18px',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.8)',
    background: isDark
      ? 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.6) 100%)'
      : '#ffffff',
    backdropFilter: 'blur(16px)',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
      transition: 'all 0.2s ease',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6366f1',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
      },
      '&.Mui-disabled': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9',
      },
    },
  };

  if (!unUser || !unUser.username) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '18px' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '18px' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '18px' }} />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* En-tête de page moderne */}
        <PageHeader
          title="Modifier le compte membre"
          subtitle={`Employé : ${unUser.first_name || ''} ${unUser.last_name || unUser.username || ''} (@${unUser.username})`}
          breadcrumbs={[
            { label: 'Accueil', to: '/' },
            { label: 'Administration', to: '/admin/personnel' },
            { label: 'Personnel', to: '/entreprise/utilisateur' },
            { label: 'Modification profil' },
          ]}
          actions={
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                  color: isDark ? '#f1f5f9' : '#334155',
                  '&:hover': {
                    borderColor: '#6366f1',
                    background: 'rgba(99,102,241,0.06)',
                  },
                }}
              >
                Retour
              </Button>

              {loggedInUser?.uuid !== unUser?.uuid && (loggedInUser?.role === 1 || loggedInUser?.role === 2) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDelete}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'rgba(239,68,68,0.3)',
                    '&:hover': {
                      borderColor: '#ef4444',
                      background: 'rgba(239,68,68,0.08)',
                    },
                  }}
                >
                  Supprimer
                </Button>
              )}
            </Stack>
          }
        />

        {/* ── Bandeau Récapitulatif du Profil ── */}
        <Paper
          elevation={0}
          sx={{
            ...cardStyle,
            mt: 3,
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 58,
                height: 58,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontSize: '1.25rem',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
              }}
            >
              {userInitials}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {unUser.first_name || ''} {unUser.last_name || unUser.username || ''}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Identifiant : <strong>@{unUser.username}</strong>
                {unUser.email_user && ` • ${unUser.email_user}`}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<BadgeIcon sx={{ fontSize: 16 }} />}
              label={currentRole.label}
              color={currentRole.color}
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />

            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label={restriction.active ? 'Plage horaire restreinte' : 'Accès illimité'}
              color={restriction.active ? 'warning' : 'success'}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px' }}
            />
          </Stack>
        </Paper>

        {/* ── Formulaire de Modification ── */}
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* ── 1. Informations Personnelles & Identité ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <PersonIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Identité & Coordonnées
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      variant="outlined"
                      name="first_name"
                      onChange={onChange}
                      value={unUser.first_name || ''}
                      sx={inputStyle}
                    />

                    <TextField
                      fullWidth
                      label="Nom de famille"
                      variant="outlined"
                      name="last_name"
                      onChange={onChange}
                      value={unUser.last_name || ''}
                      sx={inputStyle}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    disabled
                    label="Nom d'utilisateur (Identifiant)"
                    variant="outlined"
                    name="username"
                    value={unUser.username || ''}
                    sx={inputStyle}
                    helperText="L'identifiant de connexion est fixe."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1' }}>@</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Adresse Email"
                    type="email"
                    variant="outlined"
                    name="email_user"
                    onChange={onChange}
                    value={unUser.email_user || ''}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Numéro de téléphone"
                    variant="outlined"
                    name="numero"
                    onChange={onChange}
                    value={unUser.numero || ''}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* ── 2. Habilitation & Rôle ── */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <BadgeIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Rôle & Privilèges d'accès
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <FormControl fullWidth variant="outlined" sx={inputStyle}>
                    <InputLabel id="role-label">Type de compte / Rôle</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={Number(unUser.role) || 4}
                      onChange={onSelectChange}
                      label="Type de compte / Rôle"
                    >
                      <MenuItem value={1}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Administrateur</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Accès total à l'application et à la configuration</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={2}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Superviseur / Gestionnaire</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Gestion des stocks, entrées, fournisseurs et dépenses</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={3}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Caissier(e)</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Accès au point de vente (Caisse POS) et encaissements</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={4}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Sans attribution</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Compte restreint en attente d'affectation</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sécurité / Mot de passe */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      background: isDark ? 'rgba(15,23,42,0.4)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <SecurityIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Réinitialisation du mot de passe
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                      Laissez ces champs vides si vous ne souhaitez pas modifier le mot de passe actuel.
                    </Typography>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nouveau mot de passe"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={unUser.password || ''}
                        onChange={onChange}
                        sx={inputStyle}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="Confirmer le nouveau mot de passe"
                        name="repassword"
                        type={showPassword ? 'text' : 'password'}
                        value={unUser.repassword || ''}
                        onChange={onChange}
                        sx={inputStyle}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* ── 3. Restrictions d'Horaires & Jours de Travail ── */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Plages horaires & Restrictions de connexion
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Verrouille automatiquement l'accès de l'employé en dehors de ses horaires de travail autorisés.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: restriction.active ? '#f59e0b' : 'text.secondary' }}>
                      {restriction.active ? 'Restrictions activées' : 'Accès libre'}
                    </Typography>
                    <Switch
                      checked={restriction.active}
                      onChange={(e) => setRestriction({ ...restriction, active: e.target.checked })}
                      color="warning"
                    />
                  </Box>
                </Box>

                {restriction.active && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2.5,
                      borderRadius: '14px',
                      background: isDark ? 'rgba(15,23,42,0.5)' : '#fffbeb',
                      border: isDark ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(245,158,11,0.3)',
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" sx={inputStyle}>
                          <InputLabel>Jour de début</InputLabel>
                          <Select
                            value={restriction.day_start}
                            label="Jour de début"
                            onChange={(e) => setRestriction({ ...restriction, day_start: Number(e.target.value) })}
                          >
                            {DAYS.map((day, index) => (
                              <MenuItem key={index} value={index}>{day}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" sx={inputStyle}>
                          <InputLabel>Jour de fin</InputLabel>
                          <Select
                            value={restriction.day_end}
                            label="Jour de fin"
                            onChange={(e) => setRestriction({ ...restriction, day_end: Number(e.target.value) })}
                          >
                            {DAYS.map((day, index) => (
                              <MenuItem key={index} value={index}>{day}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          label="Heure de début"
                          type="time"
                          value={restriction.hour_start}
                          onChange={(e) => setRestriction({ ...restriction, hour_start: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          size="small"
                          sx={inputStyle}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          label="Heure de fin"
                          type="time"
                          value={restriction.hour_end}
                          onChange={(e) => setRestriction({ ...restriction, hour_end: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          size="small"
                          sx={inputStyle}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#fbbf24' : '#b45309' }}>
                        Plage autorisée : du {DAYS[restriction.day_start]} au {DAYS[restriction.day_end]}, de {restriction.hour_start} à {restriction.hour_end}.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── Barre d'actions inférieure ── */}
          <Paper
            elevation={0}
            sx={{
              ...cardStyle,
              mt: 3,
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              }}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                px: 4,
                py: 1.2,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                },
              }}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Paper>
        </form>
      </Box>

      {/* ── Dialog Suppression ── */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e293b' : '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Supprimer ce membre ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer définitivement le compte de{' '}
            <strong>"{unUser.first_name || ''} {unUser.last_name || unUser.username}"</strong> (@{unUser.username}) ? Cette action révoquera immédiatement tous ses accès.
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => setShowConfirm(false)}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              fullWidth
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Supprimer
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

export default PersonnelModif;
