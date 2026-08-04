import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Chip,
  Rating,
  TextField,
  Button,
  Divider,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

/* ── Types ─────────────────────────────────────────────────── */
interface AvisData {
  id: number;
  author: string;
  initials: string;
  rating: number;
  date: string;
  comment: string;
  liked: boolean;
  likes: number;
  tag?: string;
}

/* ── Mock data ──────────────────────────────────────────────── */
const initialAvis: AvisData[] = [
  {
    id: 1,
    author: 'Marie Dupont',
    initials: 'MD',
    rating: 5,
    date: '15 juil. 2025',
    comment: 'Service exceptionnel ! La gestion des stocks est devenue bien plus simple depuis que nous utilisons cette plateforme. Interface intuitive et support réactif.',
    liked: false,
    likes: 12,
    tag: 'Excellent',
  },
  {
    id: 2,
    author: 'Jean-Pierre Martin',
    initials: 'JM',
    rating: 4,
    date: '8 juil. 2025',
    comment: 'Très bonne application dans l\'ensemble. Quelques améliorations seraient appréciées pour la partie reporting, mais le reste est vraiment bien pensé.',
    liked: false,
    likes: 7,
    tag: 'Bien',
  },
  {
    id: 3,
    author: 'Sophie Leclerc',
    initials: 'SL',
    rating: 5,
    date: '1 juil. 2025',
    comment: 'Je recommande vivement ! Gain de temps considérable pour notre équipe. La synchronisation en temps réel est un vrai plus.',
    liked: false,
    likes: 19,
    tag: 'Recommandé',
  },
  {
    id: 4,
    author: 'Thomas Bernard',
    initials: 'TB',
    rating: 3,
    date: '22 juin 2025',
    comment: 'Fonctionnalités intéressantes mais la courbe d\'apprentissage est un peu longue. L\'équipe support nous a bien aidés cependant.',
    liked: false,
    likes: 3,
  },
];

/* ── Rating bar ─────────────────────────────────────────────── */
const RatingBar: FC<{ stars: number; count: number; total: number }> = ({ stars, count, total }) => {
  const theme = useTheme();
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 8, color: 'text.secondary' }}>
        {stars}
      </Typography>
      <StarRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          flex: 1,
          height: 6,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.divider, 0.5),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20, textAlign: 'right' }}>
        {count}
      </Typography>
    </Box>
  );
};

/* ── Avis Card ──────────────────────────────────────────────── */
const AvisCard: FC<{ avis: AvisData; onLike: (id: number) => void }> = ({ avis, onLike }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const color = colors[avis.id % colors.length];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        p: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.08)}`,
          transform: 'translateY(-2px)',
          borderColor: alpha(color, 0.35),
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            fontWeight: 800,
            fontSize: 15,
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
            boxShadow: `0 4px 12px ${alpha(color, 0.35)}`,
            flexShrink: 0,
          }}
        >
          {avis.initials}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {avis.author}
            </Typography>
            {avis.tag && (
              <Chip
                label={avis.tag}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: alpha(color, 0.12),
                  color: color,
                  borderRadius: '5px',
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
            <Rating
              value={avis.rating}
              readOnly
              size="small"
              icon={<StarRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
              emptyIcon={<StarBorderRoundedIcon sx={{ fontSize: 14 }} />}
            />
            <Typography variant="caption" color="text.secondary">
              · {avis.date}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quote */}
      <Box sx={{ position: 'relative', pl: 2 }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            borderRadius: 4,
            bgcolor: alpha(color, 0.5),
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {avis.comment}
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Tooltip title={avis.liked ? 'Retirer le like' : 'Utile !'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onLike(avis.id)}
              sx={{
                color: avis.liked ? 'primary.main' : 'text.disabled',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {avis.liked ? (
                <ThumbUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {avis.likes}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Card>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
export default function Avis() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [avisList, setAvisList] = useState<AvisData[]>(initialAvis);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalAvis = avisList.length;
  const avgRating = totalAvis > 0
    ? avisList.reduce((acc, a) => acc + a.rating, 0) / totalAvis
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: avisList.filter((a) => a.rating === s).length,
  }));

  const handleLike = (id: number) => {
    setAvisList((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a
      )
    );
  };

  const handleSubmit = () => {
    if (!newRating || !newComment.trim()) return;
    const newAvis: AvisData = {
      id: avisList.length + 1,
      author: 'Vous',
      initials: 'V',
      rating: newRating,
      date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      comment: newComment.trim(),
      liked: false,
      likes: 0,
    };
    setAvisList((prev) => [newAvis, ...prev]);
    setNewRating(null);
    setNewComment('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: isDark ? 'grey.950' : 'grey.50',
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        {/* ── Page Header ── */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
              }}
            >
              <RateReviewOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" fontWeight={800}>
              Avis & Évaluations
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            Ce que pensent les utilisateurs de la plateforme
          </Typography>
        </Box>

        {/* ── Summary Card ── */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.06)} 0%, ${alpha(theme.palette.background.paper, 1)} 60%)`,
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Big score */}
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {avgRating.toFixed(1)}
              </Typography>
              <Rating
                value={avgRating}
                readOnly
                precision={0.1}
                icon={<StarRoundedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />}
                emptyIcon={<StarBorderRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ mt: 0.5 }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {totalAvis} avis
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            {/* Bars */}
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Stack spacing={0.8}>
                {ratingCounts.map(({ stars, count }) => (
                  <RatingBar key={stars} stars={stars} count={count} total={totalAvis} />
                ))}
              </Stack>
            </Box>
          </Box>
        </Card>

        {/* ── Write a review ── */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FormatQuoteIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Laisser un avis
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Votre note
                </Typography>
                <Rating
                  value={newRating}
                  onChange={(_, v) => setNewRating(v)}
                  icon={<StarRoundedIcon sx={{ fontSize: 32, color: '#f59e0b' }} />}
                  emptyIcon={<StarBorderRoundedIcon sx={{ fontSize: 32, color: alpha('#f59e0b', 0.3) }} />}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Partagez votre expérience avec la plateforme..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  disabled={!newRating || !newComment.trim()}
                  onClick={handleSubmit}
                  startIcon={<SendRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: newRating && newComment.trim()
                      ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
                      : 'none',
                  }}
                >
                  {submitted ? '✓ Avis publié !' : 'Publier l\'avis'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* ── Reviews list ── */}
        <Stack spacing={2}>
          {avisList.map((avis) => (
            <AvisCard key={avis.id} avis={avis} onLike={handleLike} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
