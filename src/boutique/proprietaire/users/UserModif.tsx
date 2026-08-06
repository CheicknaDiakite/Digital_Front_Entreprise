import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  Box,
  Stack,
  alpha,
  useTheme,
  Avatar,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { useParams } from "react-router-dom";
import {
  useDeleteUser,
  useFetchUnUser,
  useFetchUser,
  useUpdateUser,
} from "../../../usePerso/fonction.user";
import MyTextField from "../../../_components/Input/MyTextField";

/* ── Helpers ─────────────────────────────────────────────── */
const roleLabel: Record<number, { label: string; color: "success" | "warning" | "default" }> = {
  1: { label: "Activé", color: "success" },
};

const subscriptionLabel: Record<number, { label: string; color: "default" | "primary" | "secondary" }> = {
  1: { label: "Simple", color: "default" },
  2: { label: "Basic", color: "primary" },
  3: { label: "Premium", color: "secondary" },
};

/* ── Section wrapper ─────────────────────────────────────── */
const Section: FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => {
  const theme = useTheme();
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export const UserModif: FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { uuid } = useParams();
  const { unUser, setUnUser } = useFetchUnUser(uuid!);

  const { unUser: un } = useFetchUser();
  const user_id = un?.uuid || '';

  unUser["user_id"] = user_id;
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  const [is_cab, setCab] = useState(false);

  useEffect(() => {
    if (unUser.is_cabinet !== undefined) {
      setCab(unUser.is_cabinet);
    }
  }, [unUser.is_cabinet]);

  const Is_Cab = () => {
    setCab(!is_cab);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUnUser({ ...unUser, [name]: value });
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setUnUser({ ...unUser, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unUser["is_cabinet"] = is_cab;
    updateUser(unUser);
  };

  /* Avatar gradient from initials */
  const initials =
    `${unUser.first_name?.[0] ?? ""}${unUser.last_name?.[0] ?? ""}`.toUpperCase() || "U";
  const gradientFrom = theme.palette.primary.main;
  const gradientTo = theme.palette.secondary?.main ?? theme.palette.primary.light;

  const currentSub = subscriptionLabel[unUser.typeRole as number] ?? subscriptionLabel[1];
  const currentRole = roleLabel[unUser.role as number] ?? { label: "—", color: "default" as const };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "grey.950" : "grey.50",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >

      <Box sx={{ maxWidth: 680, mx: "auto" }}>
        {/* ── Hero Header Card ── */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            background: `linear-gradient(135deg, ${alpha(gradientFrom, 0.08)} 0%, ${alpha(gradientTo, 0.04)} 100%)`,
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                fontSize: 24,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 8px 24px ${alpha(gradientFrom, 0.4)}`,
                flexShrink: 0,
                border: `3px solid ${alpha(theme.palette.background.paper, 0.9)}`,
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800} noWrap>
                {unUser.first_name} {unUser.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                @{unUser.username}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={currentRole.label}
                  color={currentRole.color}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px" }}
                />
                <Chip
                  icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 14 }} />}
                  label={currentSub.label}
                  color={currentSub.color}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px" }}
                />
                {is_cab && (
                  <Chip
                    icon={<BusinessCenterOutlinedIcon sx={{ fontSize: 14 }} />}
                    label="Intermédiaire"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px" }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Card>

        {/* ── Form Card ── */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              bgcolor: isDark ? alpha("#fff", 0.02) : alpha("#000", 0.01),
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Modifier le profil
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Les champs désactivés sont en lecture seule
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <form onSubmit={onSubmit}>
              <Stack spacing={4}>
                {/* ── Identité ── */}
                <Section
                  title="Identité"
                  icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
                >
                  <Stack spacing={2.5}>
                    <MyTextField
                      fullWidth
                      disabled
                      variant="outlined"
                      label="Nom d'utilisateur"
                      name="username"
                      onChange={onChange}
                      value={unUser.username}
                    />
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <MyTextField
                        fullWidth
                        disabled
                        variant="outlined"
                        label="Nom"
                        name="last_name"
                        onChange={onChange}
                        value={unUser.last_name}
                      />
                      <MyTextField
                        fullWidth
                        disabled
                        variant="outlined"
                        label="Prénom"
                        name="first_name"
                        onChange={onChange}
                        value={unUser.first_name}
                      />
                    </Box>
                  </Stack>
                </Section>

                <Divider />

                {/* ── Compte & Abonnement ── */}
                <Section
                  title="Compte & Abonnement"
                  icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
                >
                  <Stack spacing={2.5}>
                    <FormControl fullWidth>
                      <InputLabel id="role-label">Statut du compte</InputLabel>
                      <Select
                        labelId="role-label"
                        id="role-select"
                        name="role"
                        value={unUser.role || ""}
                        onChange={onSelectChange}
                        label="Statut du compte"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={1}>Activé</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel id="typeRole-label">Type d'abonnement</InputLabel>
                      <Select
                        labelId="typeRole-label"
                        id="typeRole-select"
                        name="typeRole"
                        value={unUser.typeRole || 1}
                        onChange={onSelectChange}
                        label="Type d'abonnement"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={1}>Simple</MenuItem>
                        <MenuItem value={2}>Basic</MenuItem>
                        <MenuItem value={3}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <WorkspacePremiumOutlinedIcon
                              sx={{ fontSize: 16, color: "secondary.main" }}
                            />
                            Premium
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: isDark ? alpha("#fff", 0.02) : alpha("#000", 0.01),
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Compte intermédiaire
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Accès cabinet / intermédiaire activé
                        </Typography>
                      </Box>
                      <Checkbox
                        checked={is_cab}
                        onChange={Is_Cab}
                        color="primary"
                        sx={{ p: 0.5 }}
                      />
                    </Box>
                  </Stack>
                </Section>

                <Divider />

                {/* ── Actions ── */}
                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      py: 1.5,
                      boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                      "&:hover": {
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.55)}`,
                      },
                    }}
                  >
                    Enregistrer les modifications
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Card>

        {/* ── Danger Zone ── */}
        <Card
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="error.main">
              Zone dangereuse
            </Typography>
          </Box>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Supprimer cet utilisateur
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cette action est irréversible et supprime toutes les données associées.
              </Typography>
            </Box>
            <Tooltip title="Supprimer définitivement cet utilisateur" arrow>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => deleteUser(unUser)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                Supprimer
              </Button>
            </Tooltip>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};
