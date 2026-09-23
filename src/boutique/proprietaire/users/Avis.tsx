import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Divider,
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { userService } from '../../../_services/account.service';
import { useFetchUser, useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';

type FeedbackStatus = 'nouveau' | 'en_cours' | 'repondu' | 'ferme';
type Avis = {
  uuid: string;
  libelle: string;
  description: string;
  date: string | null;
  auteur: string;
  entreprise: { uuid: string; nom: string } | null;
  reponse: string | null;
  repondu_par: string | null;
  repondu_at: string | null;
  statut: FeedbackStatus;
};

const statuses: Record<FeedbackStatus, { label: string; color: 'warning' | 'info' | 'primary' | 'success' }> = {
  nouveau: { label: 'Nouveau', color: 'warning' },
  en_cours: { label: 'En cours', color: 'info' },
  repondu: { label: 'Répondu', color: 'primary' },
  ferme: { label: 'Fermé', color: 'success' },
};

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Date inconnue';

const initials = (value: string) => value.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?';

export default function Avis() {
  const queryClient = useQueryClient();
  const { unUser } = useFetchUser();
  const { userEntreprises = [] } = useGetUserEntreprises();
  const selectedEntrepriseId = useStoreUuid((state) => state.selectedId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [entrepriseId, setEntrepriseId] = useState(selectedEntrepriseId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<'tous' | FeedbackStatus>('tous');
  const isSuperuser = Boolean(unUser.is_superuser);

  useEffect(() => {
    if (!entrepriseId && userEntreprises.length) setEntrepriseId(selectedEntrepriseId || userEntreprises[0].uuid || '');
  }, [entrepriseId, selectedEntrepriseId, userEntreprises]);

  const { data: avis = [], isLoading, isError } = useQuery({
    queryKey: ['avis'],
    queryFn: async () => {
      const response = await userService.avisGet('');
      if (!response.data.etat) throw new Error(response.data.message || 'Impossible de charger les avis.');
      return response.data.donnee as Avis[];
    },
  });

  const displayedAvis = useMemo(
    () => statusFilter === 'tous' ? avis : avis.filter((item) => item.statut === statusFilter),
    [avis, statusFilter],
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['avis'] });
  const replyMutation = useMutation({
    mutationFn: (payload: { avis_uuid: string; reponse: string }) => userService.avisReply(payload),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Réponse enregistrée.');
      setReplyingTo(null);
      setReply('');
      refresh();
    },
    onError: () => toast.error('La réponse n’a pas pu être enregistrée.'),
  });
  const statusMutation = useMutation({
    mutationFn: (payload: { avis_uuid: string; statut: FeedbackStatus }) => userService.avisUpdateStatus(payload),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Statut mis à jour.');
      refresh();
    },
    onError: () => toast.error('Le statut n’a pas pu être mis à jour.'),
  });
  const createMutation = useMutation({
    mutationFn: () => userService.avisCreate({ libelle: title.trim(), description: description.trim(), entreprise_id: entrepriseId }),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Merci, votre avis a été envoyé.');
      setTitle('');
      setDescription('');
      refresh();
    },
    onError: () => toast.error('L’avis n’a pas pu être envoyé.'),
  });

  const startReply = (item: Avis) => {
    setReplyingTo(item.uuid);
    setReply(item.reponse || '');
  };

  return (
    <Box sx={{ maxWidth: 980, mx: 'auto', py: { xs: 2, md: 4 }, px: { xs: 1, md: 2 } }}>
      <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', color: 'common.white', background: 'linear-gradient(120deg, #312e81, #4f46e5 58%, #7c3aed)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 52, height: 52, bgcolor: 'rgba(255,255,255,.16)' }}><ForumOutlinedIcon /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight={800}>Vos avis</Typography>
                <Typography sx={{ opacity: .85 }}>{isSuperuser ? 'Traitez et répondez aux retours de la plateforme.' : 'Partagez vos idées et suivez les réponses reçues.'}</Typography>
              </Box>
            </Stack>
            <Chip icon={<RateReviewOutlinedIcon />} label={`${avis.length} avis`} sx={{ color: 'common.white', bgcolor: 'rgba(255,255,255,.15)', '& .MuiChip-icon': { color: 'common.white' } }} />
          </Stack>
        </CardContent>
      </Card>

      {!isSuperuser && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 3, borderColor: 'rgba(79,70,229,.25)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SendRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>Envoyer un avis</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Décrivez votre besoin, problème ou suggestion. Notre équipe vous répondra directement ici.</Typography>
            {userEntreprises.length === 0 ? <Alert severity="info">Associez-vous d’abord à une entreprise pour pouvoir envoyer un avis.</Alert> : (
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="avis-entreprise-label">Entreprise concernée</InputLabel>
                  <Select labelId="avis-entreprise-label" label="Entreprise concernée" value={entrepriseId} onChange={(event) => setEntrepriseId(event.target.value)}>
                    {userEntreprises.map((entreprise) => <MenuItem key={entreprise.uuid} value={entreprise.uuid}>{entreprise.nom}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Objet de votre avis" placeholder="Ex. Ajouter une fonctionnalité de rapport" value={title} onChange={(event) => setTitle(event.target.value)} inputProps={{ maxLength: 200 }} />
                <TextField label="Votre message" placeholder="Expliquez le contexte et ce que vous attendez…" multiline minRows={4} value={description} onChange={(event) => setDescription(event.target.value)} inputProps={{ maxLength: 2000 }} helperText={`${description.length}/2000`} />
                <Box display="flex" justifyContent="flex-end">
                  <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={!entrepriseId || !title.trim() || !description.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
                    Envoyer mon avis
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Historique des échanges</Typography>
          <Typography variant="body2" color="text.secondary">{displayedAvis.length} élément(s) affiché(s)</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="avis-filter-label">Filtrer</InputLabel>
          <Select labelId="avis-filter-label" label="Filtrer" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'tous' | FeedbackStatus)}>
            <MenuItem value="tous">Tous les statuts</MenuItem>
            {Object.entries(statuses).map(([value, status]) => <MenuItem key={value} value={value}>{status.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>}
      {isError && <Alert severity="error">Impossible de charger les avis.</Alert>}
      {!isLoading && !isError && displayedAvis.length === 0 && <Alert severity="info">Aucun avis ne correspond à ce filtre.</Alert>}

      <Stack spacing={2}>
        {displayedAvis.map((item) => {
          const currentStatus = statuses[item.statut] || statuses.nouveau;
          const isReplying = replyingTo === item.uuid;
          return (
            <Card key={item.uuid} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: item.reponse ? 'rgba(79,70,229,.28)' : 'divider' }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 800 }}>{initials(item.auteur)}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{item.libelle}</Typography>
                      <Typography variant="caption" color="text.secondary">Par {item.auteur} · {formatDate(item.date)}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {item.entreprise && <Chip icon={<BusinessOutlinedIcon />} label={item.entreprise.nom} size="small" variant="outlined" />}
                    <Chip label={currentStatus.label} size="small" color={currentStatus.color} />
                  </Stack>
                </Stack>

                <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap', color: 'text.primary', lineHeight: 1.7 }}>{item.description}</Typography>

                {item.reponse && (
                  <Box sx={{ mt: 2.5, p: 2, borderRadius: 2.5, bgcolor: 'rgba(79,70,229,.06)', border: '1px solid rgba(79,70,229,.16)' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MarkEmailReadOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="primary.main" fontWeight={800}>Réponse de {item.repondu_par || 'l’administration'}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{item.reponse}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>{formatDate(item.repondu_at)}</Typography>
                  </Box>
                )}

                {isSuperuser && <>
                  <Divider sx={{ my: 2.25 }} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id={`status-${item.uuid}`}>Statut</InputLabel>
                      <Select labelId={`status-${item.uuid}`} label="Statut" value={item.statut || 'nouveau'} onChange={(event) => statusMutation.mutate({ avis_uuid: item.uuid, statut: event.target.value as FeedbackStatus })} disabled={statusMutation.isPending}>
                        {Object.entries(statuses).map(([value, status]) => <MenuItem key={value} value={value}>{status.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {!isReplying && <Button size="small" variant="outlined" startIcon={<ReplyRoundedIcon />} onClick={() => startReply(item)}>{item.reponse ? 'Modifier la réponse' : 'Répondre'}</Button>}
                  </Stack>
                  {isReplying && <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25 }}>Répondre à cet avis</Typography>
                    <TextField autoFocus fullWidth multiline minRows={3} label="Votre réponse" value={reply} onChange={(event) => setReply(event.target.value)} inputProps={{ maxLength: 2000 }} helperText={`${reply.length}/2000`} />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                      <Button onClick={() => { setReplyingTo(null); setReply(''); }}>Annuler</Button>
                      <Button variant="contained" startIcon={<ReplyRoundedIcon />} disabled={!reply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate({ avis_uuid: item.uuid, reponse: reply.trim() })}>Envoyer la réponse</Button>
                    </Stack>
                  </Box>}
                </>}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
