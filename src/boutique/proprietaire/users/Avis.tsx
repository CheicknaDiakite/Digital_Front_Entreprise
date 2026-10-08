import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton,
  Fade,
  Paper,
  Tooltip
} from '@mui/material';

import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';

import { userService } from '../../../_services/account.service';
import { useFetchUser, useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';

type FeedbackStatus = 'nouveau' | 'en_cours' | 'repondu' | 'ferme';

export type TicketMessage = {
  uuid: string;
  auteur: string;
  auteur_uuid?: string;
  message: string;
  is_admin: boolean;
  date: string | null;
};

export type Ticket = {
  uuid: string;
  libelle: string;
  description: string;
  date: string | null;
  auteur: string;
  auteur_uuid?: string;
  entreprise: { uuid: string; nom: string } | null;
  reponse: string | null;
  repondu_par: string | null;
  repondu_at: string | null;
  statut: FeedbackStatus;
  messages?: TicketMessage[];
};

const statuses: Record<FeedbackStatus, {
  label: string;
  color: 'warning' | 'info' | 'primary' | 'success';
  icon: typeof HourglassEmptyRoundedIcon;
}> = {
  nouveau: { label: 'Nouveau', color: 'warning', icon: HourglassEmptyRoundedIcon },
  en_cours: { label: 'En cours', color: 'info', icon: PendingActionsRoundedIcon },
  repondu: { label: 'Répondu', color: 'primary', icon: CheckCircleRoundedIcon },
  ferme: { label: 'Résolu & Fermé', color: 'success', icon: TaskAltRoundedIcon },
};

const formatDate = (value: string | null) => {
  if (!value) return 'Date inconnue';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const initials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?';

const getTicketMessages = (item: Ticket): TicketMessage[] => {
  if (item.messages && item.messages.length > 0) {
    return item.messages;
  }
  const fallback: TicketMessage[] = [];
  if (item.description) {
    fallback.push({
      uuid: `init-${item.uuid}`,
      auteur: item.auteur,
      auteur_uuid: item.auteur_uuid,
      message: item.description,
      is_admin: false,
      date: item.date,
    });
  }
  if (item.reponse) {
    fallback.push({
      uuid: `reply-${item.uuid}`,
      auteur: item.repondu_par || 'Support Gest-Stocks',
      message: item.reponse,
      is_admin: true,
      date: item.repondu_at,
    });
  }
  return fallback;
};

export default function Avis() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { unUser } = useFetchUser();
  const { userEntreprises = [] } = useGetUserEntreprises();
  const selectedEntrepriseId = useStoreUuid((state) => state.selectedId);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'tous' | FeedbackStatus>('tous');

  const isSuperuser = Boolean(unUser.is_superuser);

  // Établissement actuellement actif
  const selectedEntreprise = userEntreprises.find((e) => e.uuid === selectedEntrepriseId);

  const { data: tickets = [], isLoading, isError } = useQuery({
    queryKey: ['avis'],
    queryFn: async () => {
      const response = await userService.avisGet('');
      if (!response.data.etat) throw new Error(response.data.message || 'Impossible de charger les tickets.');
      return response.data.donnee as Ticket[];
    },
  });

  const displayedTickets = useMemo(() => {
    return tickets.filter((item) => {
      if (statusFilter !== 'tous' && item.statut !== statusFilter) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const matchTitle = item.libelle?.toLowerCase().includes(q) || false;
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      const matchAuthor = item.auteur?.toLowerCase().includes(q) || false;
      const matchCompany = item.entreprise?.nom?.toLowerCase().includes(q) || false;

      return matchTitle || matchDesc || matchAuthor || matchCompany;
    });
  }, [tickets, statusFilter, searchTerm]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['avis'] });

  const replyMutation = useMutation({
    mutationFn: (payload: { avis_uuid: string; reponse: string }) => userService.avisReply(payload),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success(
        response.data.message || (isSuperuser ? 'Réponse officielle transmise au client.' : 'Votre message a été transmis à l’équipe support.')
      );
      setReplyingTo(null);
      setReply('');
      refresh();
    },
    onError: () => toast.error('Le message n’a pas pu être enregistré.'),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { avis_uuid: string; statut: FeedbackStatus }) => userService.avisUpdateStatus(payload),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Statut du ticket mis à jour.');
      refresh();
    },
    onError: () => toast.error('Le statut n’a pas pu être mis à jour.'),
  });

  const createMutation = useMutation({
    mutationFn: () => userService.avisCreate({
      libelle: title.trim(),
      description: description.trim(),
      entreprise_id: selectedEntrepriseId ?? ''
    }),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Votre demande a été transmise à notre équipe support.');
      setTitle('');
      setDescription('');
      refresh();
    },
    onError: () => toast.error('La demande n’a pas pu être envoyée.'),
  });

  const startReply = (item: Ticket) => {
    setReplyingTo(item.uuid);
    setReply('');
  };

  // Compteurs d'état
  const totalCount = tickets.length;
  const newCount = tickets.filter((t) => t.statut === 'nouveau').length;
  const inProgressCount = tickets.filter((t) => t.statut === 'en_cours').length;
  const resolvedCount = tickets.filter((t) => t.statut === 'ferme' || t.statut === 'repondu').length;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 2.5 } }}>
      {/* Executive Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '24px',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, #ffffff 100%)`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 24px rgba(0,0,0,0.03)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 58,
                height: 58,
                borderRadius: '18px',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            >
              <HeadsetMicRoundedIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                {isSuperuser ? "Centre d'Assistance & Tickets Clients" : "Support & Assistance Technique"}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                {isSuperuser
                  ? "Consultez, traitez et apportez des réponses officielles aux demandes des établissements."
                  : "Besoin d'aide, signalement d'un incident ou suggestion ? Notre équipe technique vous répond ici."}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<ConfirmationNumberRoundedIcon sx={{ fontSize: '15px !important' }} />}
              label={`${totalCount} ticket${totalCount > 1 ? 's' : ''}`}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            />
            {newCount > 0 && (
              <Chip
                label={`${newCount} en attente`}
                color="warning"
                size="small"
                sx={{ borderRadius: '10px', fontWeight: 700 }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Ticket Creation Card (Only for non-superusers or business users) */}
      {!isSuperuser && (
        <Card
          elevation={0}
          sx={{
            mb: 3.5,
            borderRadius: '20px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.5)
              : theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }}
          >
            <AddCommentRoundedIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Soumettre une nouvelle demande
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            {!selectedEntrepriseId ? (
              <Alert severity="info" sx={{ borderRadius: '14px' }}>
                Veuillez sélectionner une entreprise active dans le menu latéral pour pouvoir lui rattacher un ticket de support.
              </Alert>
            ) : (
              <Stack spacing={2.5}>
                {selectedEntreprise && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      width: 'fit-content'
                    }}
                  >
                    <BusinessRoundedIcon sx={{ fontSize: 17, color: theme.palette.primary.main }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      Établissement : {selectedEntreprise.nom}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="Objet de la demande"
                  placeholder="Ex: Problème d'impression facture, demande de fonctionnalité, anomalie de stock..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  inputProps={{ maxLength: 200 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Description détaillée"
                  placeholder="Décrivez précisément votre problème, contexte ou suggestion pour une prise en charge rapide…"
                  multiline
                  minRows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${description.length}/2000 caractères`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px'
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<SendRoundedIcon />}
                    disabled={!selectedEntrepriseId || !title.trim() || !description.trim() || createMutation.isPending}
                    onClick={() => createMutation.mutate()}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3.5,
                      height: 42,
                      bgcolor: theme.palette.primary.main,
                      boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                      '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                  >
                    {createMutation.isPending ? "Transmission..." : "Transmettre ma demande"}
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

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
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between'
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher par objet, auteur, établissement..."
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

        {/* Status Chips Selector */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
          <Chip
            label={`Tous (${totalCount})`}
            size="small"
            onClick={() => setStatusFilter('tous')}
            variant={statusFilter === 'tous' ? 'filled' : 'outlined'}
            color={statusFilter === 'tous' ? 'primary' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
          <Chip
            label={`Nouveaux (${newCount})`}
            size="small"
            onClick={() => setStatusFilter('nouveau')}
            variant={statusFilter === 'nouveau' ? 'filled' : 'outlined'}
            color={statusFilter === 'nouveau' ? 'warning' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
          <Chip
            label={`En cours (${inProgressCount})`}
            size="small"
            onClick={() => setStatusFilter('en_cours')}
            variant={statusFilter === 'en_cours' ? 'filled' : 'outlined'}
            color={statusFilter === 'en_cours' ? 'info' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
          <Chip
            label={`Traités (${resolvedCount})`}
            size="small"
            onClick={() => setStatusFilter('ferme')}
            variant={statusFilter === 'ferme' ? 'filled' : 'outlined'}
            color={statusFilter === 'ferme' ? 'success' : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
          />
        </Stack>
      </Paper>

      {/* Loading Skeletons */}
      {isLoading && (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: '18px', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="250px" height={28} />
                <Skeleton variant="rounded" width="90px" height={26} sx={{ borderRadius: '8px' }} />
              </Box>
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
            </Paper>
          ))}
        </Stack>
      )}

      {/* Error state */}
      {isError && (
        <Alert
          severity="error"
          sx={{ borderRadius: '16px' }}
          action={
            <Button color="inherit" size="small" onClick={refresh} startIcon={<RefreshRoundedIcon />}>
              Réessayer
            </Button>
          }
        >
          Impossible de charger l'historique des tickets.
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && displayedTickets.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.5)
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <ConfirmationNumberRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Aucun ticket ne correspond à vos critères
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
            {searchTerm
              ? `Aucune demande ne correspond à "${searchTerm}".`
              : "Vous n'avez aucune demande de support en cours sur ce filtre."}
          </Typography>
        </Paper>
      )}

      {/* Ticket List */}
      <Stack spacing={2.5}>
        {displayedTickets.map((item) => {
          const currentStatus = statuses[item.statut] || statuses.nouveau;
          const isReplying = replyingTo === item.uuid;
          const StatusIcon = currentStatus.icon;

          return (
            <Card
              key={item.uuid}
              variant="outlined"
              sx={{
                borderRadius: '20px',
                border: `1px solid ${item.reponse ? alpha(theme.palette.primary.main, 0.3) : theme.palette.divider}`,
                borderLeft: `5px solid ${theme.palette[currentStatus.color].main}`,
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.6)
                  : theme.palette.background.paper,
                boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
                {/* Header: Title, author, enterprise & status badge */}
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {initials(item.auteur)}
                    </Avatar>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
                        {item.libelle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Émis par <strong>{item.auteur}</strong> · {formatDate(item.date)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {item.entreprise && (
                      <Chip
                        icon={<BusinessRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        label={item.entreprise.nom}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                    )}

                    <Chip
                      icon={<StatusIcon sx={{ fontSize: '14px !important' }} />}
                      label={currentStatus.label}
                      size="small"
                      color={currentStatus.color}
                      sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </Stack>
                </Stack>

                {/* Discussion Thread Messages */}
                {(() => {
                  const threadMessages = getTicketMessages(item);
                  return (
                    <Stack spacing={1.75} sx={{ mt: 2.5 }}>
                      {threadMessages.map((msg, index) => {
                        const isSupport = msg.is_admin;
                        const isCurrentUser = msg.auteur_uuid === unUser.uuid || msg.auteur === unUser.username;

                        return (
                          <Box
                            key={msg.uuid || index}
                            sx={{
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: '16px',
                              bgcolor: isSupport
                                ? alpha(theme.palette.primary.main, 0.05)
                                : (theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.8)
                                    : 'rgba(248, 250, 252, 0.9)'),
                              border: `1px solid ${
                                isSupport
                                  ? alpha(theme.palette.primary.main, 0.25)
                                  : theme.palette.divider
                              }`,
                              borderLeft: isSupport
                                ? `4px solid ${theme.palette.primary.main}`
                                : `4px solid ${alpha(theme.palette.text.secondary, 0.4)}`,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ mb: 1.25 }}>
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    bgcolor: isSupport
                                      ? theme.palette.primary.main
                                      : alpha(theme.palette.text.primary, 0.08),
                                    color: isSupport
                                      ? '#ffffff'
                                      : theme.palette.text.primary,
                                  }}
                                >
                                  {isSupport ? <HeadsetMicRoundedIcon sx={{ fontSize: 18 }} /> : initials(msg.auteur)}
                                </Avatar>
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                                      {isSupport ? "Support Gest-Stocks" : msg.auteur}
                                    </Typography>
                                    {isSupport && (
                                      <Chip
                                        label="Support Officiel"
                                        size="small"
                                        color="primary"
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, borderRadius: '6px' }}
                                      />
                                    )}
                                    {!isSupport && isCurrentUser && (
                                      <Chip
                                        label="Vous"
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px' }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>

                              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                {formatDate(msg.date)}
                              </Typography>
                            </Stack>

                            <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', lineHeight: 1.65, fontSize: '0.915rem', pl: { sm: 0.5 } }}>
                              {msg.message}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  );
                })()}

                {/* Operations Toolbar & Reply Trigger */}
                <Divider sx={{ my: 2.2, borderColor: theme.palette.divider }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                  {/* Status Dropdown (Admin only) or Status Notice */}
                  {isSuperuser ? (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id={`status-${item.uuid}`}>Modifier le statut</InputLabel>
                      <Select
                        labelId={`status-${item.uuid}`}
                        label="Modifier le statut"
                        value={item.statut || 'nouveau'}
                        onChange={(e) => statusMutation.mutate({ avis_uuid: item.uuid, statut: e.target.value as FeedbackStatus })}
                        disabled={statusMutation.isPending}
                        sx={{ borderRadius: '10px' }}
                      >
                        {Object.entries(statuses).map(([val, st]) => (
                          <MenuItem key={val} value={val}>
                            {st.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.statut === 'ferme'
                          ? 'Ticket résolu. Vous pouvez renvoyer un message pour le rouvrir si besoin.'
                          : 'Vous pouvez répondre pour apporter des précisions ou poser d’autres questions.'}
                      </Typography>
                    </Box>
                  )}

                  {!isReplying && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReplyRoundedIcon />}
                      onClick={() => startReply(item)}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: alpha(theme.palette.primary.main, 0.4),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                    >
                      {isSuperuser ? 'Répondre au ticket' : 'Poursuivre la discussion'}
                    </Button>
                  )}
                </Stack>

                {/* Multi-turn Reply Box (Used by both admin and client) */}
                {isReplying && (
                  <Fade in timeout={200}>
                    <Box
                      sx={{
                        mt: 2.5,
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: '16px',
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.25, color: 'text.primary' }}>
                        {isSuperuser
                          ? "Rédiger une réponse officielle du Support :"
                          : "Votre nouveau message par rapport à cette demande :"}
                      </Typography>
                      <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={3}
                        label={isSuperuser ? "Réponse officielle" : "Votre message de suivi"}
                        placeholder={
                          isSuperuser
                            ? "Expliquez la démarche au client, fournissez la solution technique…"
                            : "Apportez des précisions, réagissez à la réponse du support ou posez une autre question…"
                        }
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        inputProps={{ maxLength: 2000 }}
                        helperText={`${reply.length}/2000 caractères`}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px'
                          }
                        }}
                      />
                      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                        <Button
                          onClick={() => {
                            setReplyingTo(null);
                            setReply('');
                          }}
                          sx={{ borderRadius: '10px', textTransform: 'none', color: 'text.secondary' }}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SendRoundedIcon />}
                          disabled={!reply.trim() || replyMutation.isPending}
                          onClick={() => replyMutation.mutate({ avis_uuid: item.uuid, reponse: reply.trim() })}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                            '&:hover': { bgcolor: theme.palette.primary.dark }
                          }}
                        >
                          {replyMutation.isPending ? "Transmission..." : "Envoyer le message"}
                        </Button>
                      </Stack>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

