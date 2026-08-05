import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { userService } from '../../../_services/account.service';
import { useFetchUser } from '../../../usePerso/fonction.user';
import { useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';

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
};

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Date inconnue';

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

  const replyMutation = useMutation({
    mutationFn: (payload: { avis_uuid: string; reponse: string }) => userService.avisReply(payload),
    onSuccess: (response) => {
      if (!response.data.etat) {
        toast.error(response.data.message);
        return;
      }
      toast.success('Réponse enregistrée.');
      setReplyingTo(null);
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['avis'] });
    },
    onError: () => toast.error('La réponse n’a pas pu être enregistrée.'),
  });

  const createMutation = useMutation({
    mutationFn: () => userService.avisCreate({ libelle: title.trim(), description: description.trim(), entreprise_id: entrepriseId }),
    onSuccess: (response) => {
      if (!response.data.etat) return toast.error(response.data.message);
      toast.success('Avis envoyé.');
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['avis'] });
    },
    onError: () => toast.error('L’avis n’a pas pu être envoyé.'),
  });

  const submitReply = (avisUuid: string) => {
    if (!reply.trim()) return;
    replyMutation.mutate({ avis_uuid: avisUuid, reponse: reply.trim() });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 3, px: { xs: 1, md: 2 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <RateReviewOutlinedIcon color="primary" />
            <Typography variant="h5" fontWeight={800}>Avis</Typography>
          </Stack>
          <Typography color="text.secondary" variant="body2">
            {isSuperuser ? 'Tous les avis de la plateforme. Vous pouvez y répondre.' : 'Avis liés à vos entreprises.'}
          </Typography>
        </Box>
        <Chip label={`${avis.length} avis`} color="primary" variant="outlined" />
      </Stack>

      {isLoading && <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>}
      {isError && <Alert severity="error">Impossible de charger les avis.</Alert>}
      {!isLoading && !isError && avis.length === 0 && (
        <Alert severity="info">Aucun avis ne correspond à vos entreprises pour le moment.</Alert>
      )}

      {!isSuperuser && (
        <Card variant="outlined" sx={{ borderRadius: 3, my: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Ajouter un avis</Typography>
            {userEntreprises.length === 0 ? <Alert severity="info">Associez-vous d’abord à une entreprise pour pouvoir envoyer un avis.</Alert> : (
              <Stack spacing={2}>
                <TextField select label="Entreprise" value={entrepriseId} onChange={(event) => setEntrepriseId(event.target.value)}>
                  {userEntreprises.map((entreprise) => <MenuItem key={entreprise.uuid} value={entreprise.uuid}>{entreprise.nom}</MenuItem>)}
                </TextField>
                <TextField label="Titre" value={title} onChange={(event) => setTitle(event.target.value)} />
                <TextField label="Votre avis" multiline minRows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
                <Box><Button variant="contained" disabled={!entrepriseId || !title.trim() || !description.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>Envoyer mon avis</Button></Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <Stack spacing={2}>
        {avis.map((item) => (
          <Card key={item.uuid} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{item.libelle}</Typography>
                  <Typography variant="caption" color="text.secondary">Par {item.auteur} · {formatDate(item.date)}</Typography>
                </Box>
                {item.entreprise && <Chip icon={<BusinessOutlinedIcon />} label={item.entreprise.nom} size="small" />}
              </Stack>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{item.description}</Typography>

              {item.reponse && <Box sx={{ mt: 2, pl: 2, borderLeft: 3, borderColor: 'primary.main' }}>
                <Typography variant="subtitle2" color="primary">Réponse de {item.repondu_par || 'l’administrateur'}</Typography>
                <Typography variant="body2" sx={{ mt: .5, whiteSpace: 'pre-wrap' }}>{item.reponse}</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(item.repondu_at)}</Typography>
              </Box>}

              {isSuperuser && <>
                <Divider sx={{ my: 2 }} />
                {replyingTo === item.uuid ? <Stack spacing={1.25}>
                  <TextField autoFocus multiline minRows={3} label="Votre réponse" value={reply} onChange={(event) => setReply(event.target.value)} />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button onClick={() => { setReplyingTo(null); setReply(''); }}>Annuler</Button>
                    <Button variant="contained" startIcon={<ReplyRoundedIcon />} disabled={!reply.trim() || replyMutation.isPending} onClick={() => submitReply(item.uuid)}>Répondre</Button>
                  </Stack>
                </Stack> : <Button size="small" startIcon={<ReplyRoundedIcon />} onClick={() => { setReplyingTo(item.uuid); setReply(item.reponse || ''); }}>
                  {item.reponse ? 'Modifier la réponse' : 'Répondre'}
                </Button>}
              </>}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
