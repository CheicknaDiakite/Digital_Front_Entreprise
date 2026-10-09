import { FormEvent, SyntheticEvent, useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CardInvent from './CardInvent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Skeleton,
  Typography,
  Grid,
  Stack,
} from '@mui/material';
import { connect } from '../../_services/account.service';
import { RecupType } from '../../typescript/DataType';
import CloseIcon from "@mui/icons-material/Close";
import { useCreateEntre, useGetAllEntre } from '../../usePerso/fonction.entre';
import { EntreFormType } from '../../typescript/FormType';
import { AjoutEntreForm, useFormValues } from '../../usePerso/useEntreprise';
import { formatNumberWithSpaces, isInDateRange, isLicenceExpired } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise, useFetchUser } from '../../usePerso/fonction.user';
import M_Abonnement from '../../_components/Card/M_Abonnement';
import AddIcon from '@mui/icons-material/Add';
import PostAddIcon from '@mui/icons-material/PostAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PageHeader from '../../_components/common/PageHeader';
import KpiCard from '../../_components/common/KpiCard';
import FilterBar from '../../_components/common/FilterBar';
import ApprovisionnementModal from './ApprovisionnementModal';
import './mobile-entre.css';
import { useTheme } from "@mui/material/styles";
import { useAppSettings } from "../../themes/AppSettingsContext";

export default function Entre() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unUser } = useFetchUser();
  const { unEntreprise } = useFetchEntreprise(uuid);
  const isDecouverteOwner = !unUser.role || unUser.role === 0 || unEntreprise?.proprietaire_id === unUser.id;
  const isOwner = unUser.role === 1 || isDecouverteOwner;
  const { ajoutEntre } = useCreateEntre();
  const [ajout_terminer, setTerminer] = useState(false);
  const [is_sortie, setSortie] = useState(true);
  const [is_prix, setPrix] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openMulti, setOpenMulti] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const Ajout_Terminer = () => setTerminer(!ajout_terminer);
  const Is_Sortie = () => setSortie(!is_sortie);
  const Is_Prix = () => setPrix(!is_prix);

  const { entresEntreprise, isLoading, isError } = useGetAllEntre(uuid!);
  const itemsPerPage = isMobile ? 25 : 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtre date (fin incluse) + recherche, appliqués AVANT la pagination
  const filteredBoutiques = entresEntreprise?.filter((item) => {
    if (!isInDateRange(item.date, selectedStartDate, selectedEndDate)) return false;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.categorie_libelle?.toLowerCase().includes(q) ||
      item.libelle?.toLowerCase().includes(q)
    );
  });

  const reversedBoutiques = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil(reversedBoutiques?.length / itemsPerPage);
  const totalPrice = reversedBoutiques?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu_achat !== undefined) ? row.qte * row.pu_achat : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedBoutiques?.reduce((acc, row: RecupType) => {
    return acc + (row.qte || 0);
  }, 0);

  const displayedBoutiques = reversedBoutiques?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const [open, setOpen] = useState(false);
  const functionopen = () => setOpen(true);
  const closeopen = () => setOpen(false);

  const [formValues, handleInputChange, setFormValues] = useFormValues<EntreFormType>({
    libelle: '',
    cumuler_quantite: false,
    user_id: '',
    date: '',
    unite: 'kilos',
    barcode_value: '',
  });

  const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>, value: string | RecupType | null) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        categorie_slug: value.uuid ?? '',
      });
    } else {
      setFormValues({
        ...formValues,
        categorie_slug: '',
      });
    }
  };

  const handleAutoFourChange = (_: SyntheticEvent<Element, Event>, value: string | RecupType | null) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        client_id: value.uuid ?? '',
      });
    } else {
      setFormValues({
        ...formValues,
        client_id: '',
      });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["cumuler_quantite"] = ajout_terminer;
    formValues["is_sortie"] = is_sortie;
    formValues["is_prix"] = is_prix;
    formValues["user_id"] = connect;

    ajoutEntre(formValues, {
      onSuccess: () => {
        setTerminer(false);
        setSortie(true);
        setPrix(true);
        setFormValues({
          libelle: '',
          cumuler_quantite: false,
          is_sortie: true,
          is_prix: true,
          user_id: '',
          date: '',
          pu: 0,
          pu_achat: 0,
          qte: 0,
          unite: 'pièce',
          barcode_value: '',
        });
        closeopen();
      },
    });
  };

  if (isLoading) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-4'}`}>
        <Skeleton variant="rectangular" height={isMobile ? 150 : 200} className="mb-4 mobile-loading" />
        <Skeleton variant="rectangular" height={isMobile ? 80 : 100} className="mb-2 mobile-loading" />
        <Skeleton variant="rectangular" height={isMobile ? 80 : 100} className="mobile-loading" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-4'}`}>
        <Typography variant={isMobile ? "h6" : "h6"} color="error" className="mobile-alert">
          Une erreur est survenue lors du chargement des données
        </Typography>
      </Box>
    );
  }

  if (entresEntreprise) {
    const filteredBoutiques = displayedBoutiques;

    const tableColumns: Array<{ label: string; align: 'left' | 'right' }> = [
      { label: 'Image', align: 'left' },
      
      { label: 'Date', align: 'left' },
      { label: 'Fournisseurs', align: 'left' },
      { label: 'Désignations', align: 'left' },
      { label: 'Quantité', align: 'right' },
      { label: 'Prix Unitaire (vente)', align: 'right' },
      ...(isOwner ? [
        { label: 'Prix Unitaire (achat)', align: 'right' as const },
        { label: 'Total', align: 'right' as const },
      ] : []),
    ];

    return (
      <Box sx={{ pb: 6 }}>
        {/* En-tête standardisé */}
        <PageHeader
          title="Approvisionnement & Stock"
          subtitle="Gestion des entrées de marchandises, achats fournisseurs et lots de stock"
          icon={<InventoryIcon />}
          breadcrumbs={[
            { label: 'Accueil', to: '/entreprise' },
            { label: 'Approvisionnement' },
          ]}
          actions={
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                onClick={functionopen}
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Entrée rapide
              </Button>
              <Button
                onClick={() => setOpenMulti(true)}
                variant="contained"
                startIcon={<PostAddIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #047857)',
                  },
                }}
              >
                + Approvisionnement Multi-Lignes
              </Button>
            </Stack>
          }
        />

        {/* Indicateurs clés (KPI) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <KpiCard
              title="Lots réceptionnés"
              value={reversedBoutiques?.length ?? 0}
              subtitle="Total des entrées sur la période"
              accentColor="#6366f1"
              icon={<InventoryIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              title="Quantité totale reçue"
              value={`${formatNumberWithSpaces(totalQte || 0)}`}
              subtitle="Unités de marchandises réceptionnées"
              accentColor="#10b981"
              icon={<ShoppingBagIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              title="Coût d'achat total"
              value={`${formatNumberWithSpaces(totalPrice || 0)} F`}
              subtitle="Montant d'achat investi"
              accentColor="#f59e0b"
              icon={<LocalAtmIcon />}
            />
          </Grid>
        </Grid>

        {/* Barre de recherche et filtres de dates avec préréglages */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Rechercher par produit ou catégorie..."
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          onDateRangeChange={(start, end) => {
            setSelectedStartDate(start);
            setSelectedEndDate(end);
            setCurrentPage(1);
          }}
        />

        {/* Modal d'approvisionnement multi-lignes */}
        <ApprovisionnementModal
          open={openMulti}
          onClose={() => setOpenMulti(false)}
        />

        <Paper
          elevation={0}
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            bgcolor: isDarkText ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(14px)',
            p: { xs: 2, sm: 3 },
          }}
        >

          <TableContainer 
            component={Paper}
            sx={{
              maxHeight: 560,
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15,23,42,0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              overflowY: 'auto',
              overflowX: 'auto',
            }}
          >
            <Table aria-label="sticky table" stickyHeader>
              <TableHead>
                <TableRow>
                  {tableColumns.map((col) => (
                    <TableCell
                      key={col.label}
                      align={col.align as 'left' | 'right'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        py: 1.5,
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <TableCell
                    sx={{
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBoutiques?.length > 0 ? (
                  filteredBoutiques?.map((row, index) => (
                    <CardInvent key={index} row={row} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center" className={`${isMobile ? 'mobile-empty-card py-8' : 'py-8'}`}>
                      <Typography variant="body1" className="text-gray-500">
                        Aucune entrée enregistrée
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {isOwner && filteredBoutiques?.length > 0 && (
                  <>
                    <TableRow className={isMobile ? 'mobile-total-row' : ''}>
                      <TableCell colSpan={5} />
                      <TableCell align="right" className="font-medium text-gray-100">Total Quantité:</TableCell>
                      <TableCell align="right" className="font-medium text-gray-100">{totalQte}</TableCell>
                      <TableCell />
                      <TableCell align="right" className="font-medium text-gray-100">
                        {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize="small" />
                      </TableCell>
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box className={`flex justify-center mt-6`}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
            />
          </Box>
        </Paper>

        {/* Add Entry Dialog */}
        <Dialog
          open={open}
          onClose={closeopen}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '24px',
              bgcolor: isDarkText ? '#152238' : '#ffffff',
              backgroundImage: 'none',
              border: isDarkText ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isDarkText
                ? '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(59, 130, 246, 0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              colorScheme: isDarkText ? 'dark' : 'light',
            },
          }}
        >
          <DialogTitle 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              color: '#ffffff',
              px: { xs: 2.5, sm: 3 },
              py: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              Nouvelle Entrée en Stock
            </Typography>
            <IconButton onClick={closeopen} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
            <M_Abonnement />
          ) : (
            <DialogContent className={`${isMobile ? 'mobile-p-4' : 'mt-4'}`}>
              <AjoutEntreForm
                onSubmit={onSubmit}
                formValues={formValues}
                onChange={handleInputChange}
                handleAutoCompleteChange={handleAutoCompleteChange}
                handleAutoFourChange={handleAutoFourChange}
                Ajout_Terminer={Ajout_Terminer}
                Is_Sortie={Is_Sortie}
                Is_Prix={Is_Prix}
              />
            </DialogContent>
          )}
        </Dialog>

      </Box>
    );
  }

  return null;
}
