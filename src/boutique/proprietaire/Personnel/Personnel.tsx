import {
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Box,
  Skeleton,
  Avatar,
  Chip,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { FormValueType } from "../../../typescript/FormType";
import { useCreateAdminUser, useFetchAllUsers, useFetchEntreprise } from "../../../usePerso/fonction.user";
import MyTextField from "../../../_components/Input/MyTextField";
import { useStoreUuid } from "../../../usePerso/store";
import M_Abonnement from "../../../_components/Card/M_Abonnement";
import { isLicenceExpired, stringAvatar } from "../../../usePerso/fonctionPerso";
import { useForm } from "react-hook-form";
import Chart_3 from "../../../_components/Chart/Chart_3";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ────────────────────────────────────────────────────────────────

const roleConfig: Record<number, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  1: {
    label: "Admin",
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.1)",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 13 }} />,
  },
  2: {
    label: "Superviseur",
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.1)",
    icon: <SupervisorAccountIcon sx={{ fontSize: 13 }} />,
  },
  3: {
    label: "Caissier(e)",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
    icon: <PointOfSaleIcon sx={{ fontSize: 13 }} />,
  },
};

// ─── Personnel Card ──────────────────────────────────────────────────────────

function PersonnelCard({ post, to }: { post: any; to: string }) {
  const role = roleConfig[post.role] ?? { label: "Aucun rôle", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: null };

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Box
        className={`relative p-4 rounded-lg transition-all duration-200 hover:shadow-md border-x-2 animate-border-rotate mobile-shadow-card mobile-hover-effect mobile-glass`}
        sx={{
          // bgcolor: "#ffffff",
          // border: "1px solid #e2e8f0",
          borderRadius: "20px",
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          cursor: "pointer",
          transition: "all 0.25s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
            borderColor: "#c7d2fe",
          },
        }}
      >
        {/* Top: Avatar + Role Badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Avatar
            {...stringAvatar(`${post.last_name} ${post.first_name}`)}
            sx={{
              width: 56,
              height: 56,
              fontSize: "1.1rem",
              fontWeight: 700,
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}
          />
          <Chip
            icon={role.icon as React.ReactElement}
            label={role.label}
            size="small"
            sx={{
              bgcolor: role.bg,
              // color: role.color,
              fontWeight: 700,
              fontSize: "0.7rem",
              border: `1px solid ${role.color}30`,
              borderRadius: "8px",
              "& .MuiChip-icon": { color: role.color },
            }}
          />
        </Box>

        {/* Name */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}
          >
            {post.username}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 500 }}>
            {post.last_name} {post.first_name}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#f1f5f9" }} />

        {/* Contact Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ p: 0.6, bgcolor: "#f1f5f9", borderRadius: "8px", display: "flex" }}>
              <PhoneIcon sx={{ fontSize: 14, color: "#475569" }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {post.numero || "—"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ p: 0.6, bgcolor: "#f1f5f9", borderRadius: "8px", display: "flex" }}>
              <EmailIcon sx={{ fontSize: 14, color: "#475569" }} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 180,
              }}
            >
              {post.email_user || "—"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Box sx={{ border: "1px solid #e2e8f0", borderRadius: "20px", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "8px" }} />
      </Box>
      <Skeleton variant="text" width="70%" height={22} />
      <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1.5 }} />
      <Skeleton variant="text" width="90%" height={16} />
      <Skeleton variant="text" width="80%" height={16} />
    </Box>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Personnel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValueType>();
  const [open, setOpen] = useState(false);

  const functionopen = () => setOpen(true);
  const closeopen = () => { reset(); setOpen(false); };

  const top = {
    entreprise_id: uuid,
  };

  const { getUser, isLoading, isError } = useFetchAllUsers(top);
  const { createAdmin } = useCreateAdminUser();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 4 : 6;
  const totalPages = Math.ceil(getUser.length / itemsPerPage);

  const getUs = getUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => setCurrentPage(page);

  const onSubmit = (data: FormValueType) => {
    data.entreprise_id = uuid!;
    createAdmin(data);
    closeopen();
  };

  // ── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: "20px", mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </Box>
      </Box>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Box sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="h6" sx={{ color: "#ef4444", fontWeight: 700 }}>
            Erreur de chargement
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
            Impossible de charger les données du personnel.
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ mb: 4 }}>
            <Chart_3 />
          </Box>
        </motion.div>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
              pb: 3,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "rgba(99, 102, 241, 0.1)",
                  borderRadius: "14px",
                  display: "flex",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <PeopleAltIcon sx={{ color: "#6366f1", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    // color: "#0f172a",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Gestion du Personnel
                </Typography>
                <Typography variant="body2" sx={{mt: 0.25, fontWeight: 500 }}>
                  {getUser.length} membre{getUser.length !== 1 ? "s" : ""} dans votre équipe
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Ajouter un nouveau membre" arrow>
              <Button
                onClick={functionopen}
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  fontSize: "0.875rem",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                  alignSelf: { xs: "flex-start", sm: "center" },
                }}
              >
                Ajouter un membre
              </Button>
            </Tooltip>
          </Box>
        </motion.div>

        {/* ── Cards Grid ─────────────────────────────────────────────────── */}
        {getUs.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: "#ffffff",
              borderRadius: "20px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#475569", fontWeight: 700 }}>
              Aucun membre trouvé
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
              Commencez par ajouter un membre à votre équipe.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            <AnimatePresence>
              {getUs.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PersonnelCard
                    post={post}
                    to={
                      unEntreprise.licence_type !== "Stock Simple"
                        ? `/entreprise/personnel/info/${post.uuid}`
                        : `/entreprise/personnel/modif/${post.uuid}`
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              size={isMobile ? "medium" : "large"}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    boxShadow: "0 4px 10px rgba(99,102,241,0.3)",
                  },
                },
              }}
            />
          </Box>
        )}

        {/* ── Add Member Dialog ───────────────────────────────────────────── */}
        <Dialog
          open={open}
          onClose={closeopen}
          fullWidth
          maxWidth="xs"
          TransitionProps={{ timeout: 250 }}
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(15,23,42,0.18)",
            },
          }}
        >
          {/* Dialog Header */}
          <DialogTitle
            sx={{
              p: 0,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    display: "flex",
                  }}
                >
                  <BadgeIcon sx={{ color: "#ffffff", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: "#ffffff", fontWeight: 700, lineHeight: 1.2 }}>
                    Nouveau membre
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    Remplissez les informations ci-dessous
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Fermer" arrow>
                <IconButton
                  onClick={closeopen}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)", color: "#ffffff" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          {/* Dialog Body */}
          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
            <M_Abonnement />
          ) : (
            <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                  <MyTextField
                    label="Prénom"
                    {...register("last_name", { required: "Ce champ est obligatoire" })}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#ffffff",
                        "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                      },
                    }}
                  />
                  <MyTextField
                    label="Nom"
                    {...register("first_name", { required: "Ce champ est obligatoire" })}
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#ffffff",
                        "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                      },
                    }}
                  />
                  <MyTextField
                    label="Téléphone"
                    {...register("numero", { required: "Ce champ est obligatoire" })}
                    error={!!errors.numero}
                    helperText={errors.numero?.message}
                    inputProps={{ pattern: "^[+]?\\d*$", maxLength: 15 }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#ffffff",
                        "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                      },
                    }}
                  />
                  <MyTextField
                    label="Email"
                    type="email"
                    {...register("email_user", { required: "Ce champ est obligatoire" })}
                    error={!!errors.email_user}
                    helperText={errors.email_user?.message}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#ffffff",
                        "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                      },
                    }}
                  />
                  <MyTextField
                    label="Mot de passe"
                    type="password"
                    {...register("password", { required: "Ce champ est obligatoire" })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#ffffff",
                        "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                      },
                    }}
                  />

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1.5, pt: 1 }}>
                    <Button
                      onClick={closeopen}
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1.25,
                        borderColor: "#e2e8f0",
                        color: "#475569",
                        bgcolor: "#ffffff",
                        "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1.25,
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                          boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Box>
              </form>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}
