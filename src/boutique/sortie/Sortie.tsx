import { Box, Button, Pagination, Paper, Skeleton, TextField, Typography, Dialog, DialogContent, IconButton, Divider } from "@mui/material";
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useGetAllEntre, useGetAllSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
import { useStoreUuid } from "../../usePerso/store";
import { formatNumberWithSpaces } from "../../usePerso/fonctionPerso";
import { SingleValue } from 'react-select';
import { format } from "date-fns";
import './mobile-sortie.css';


export type TypeText = {
  clientName: string,
  clientAddress: string,
  numeroFac: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber?: number,
}

export default function Sortie() {

  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const { unUser } = useFetchUser()
  const [isMobile, setIsMobile] = useState(false);

  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture

  // État pour le modal de proposition de génération de facture après enregistrement
  const [openPostSaleModal, setOpenPostSaleModal] = useState(false);
  const [lastSaleDetails, setLastSaleDetails] = useState<{
    clientName: string;
    clientNumero: number | string;
    clientId: string;
    totalAmount: number;
    totalQte: number;
    itemCount: number;
    modePaiement: string;
    newIds: number[];
    invoiceCode: string;
    date: string;
  } | null>(null);
  const [invoicePaymentMode, setInvoicePaymentMode] = useState<string>('Caisse');
  const [generatedInvoiceNum, setGeneratedInvoiceNum] = useState<string>('');

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOnClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleOpenClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const { unEntreprise: entreprise } = useFetchEntreprise(entreprise_uuid)

  const { sortiesEntreprise, isLoading, isError, refetch } = useGetAllSortie(entreprise_uuid!)

  const { ajoutSortie } = useCreateSortie()
  const setSorties = useStoreCart(state => state.setSorties)
  const selectAllIds = useStoreCart(state => state.selectAllIds)

  const [basket, setBasket] = useState<SortieType[]>([]);
  const [modePaiement, setModePaiement] = useState<string>('Caisse');

  const itemsPerPage = isMobile ? 10 : 25; // Nombre d'éléments par page

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Filtrage entre les deux dates sélectionnées
  const filteredBoutiques = sortiesEntreprise?.filter((item) => {
    if (!item.date) {
      return false; // Ignore les éléments sans date valide
    }

    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;

    return (
      (startDate === null || itemDate >= startDate) &&
      (endDate === null || itemDate <= endDate)
    );
  });

  const reversedSorties = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(reversedSorties.length / itemsPerPage);

  const reversedSort = reversedSorties.filter((info: any) => info.is_remise === false);

  const totalPrice = reversedSort?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedSorties?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte : 0;
    return acc + price;
  }, 0);

  // Calculs pour le panier (basket)
  const basketTotalAmount = basket.reduce((acc, item) => {
    return acc + (Number(item.pu || 0) * Number(item.qte || 0));
  }, 0);

  const basketTotalQte = basket.reduce((acc, item) => {
    return acc + Number(item.qte || 0);
  }, 0);

  // Récupération des éléments à afficher sur la page courante
  const sortiesBoutic = reversedSorties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gestion du changement des dates
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };

  // Gestion du changement de page
  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSaveSorties = () => {
    setSorties(sortiesEntreprise);
  };

  const [formValues, setFormValues] = useState<SortieType>({
    user_id: '',
    entre_id: '',
    client_id: '',
    unite: 'kilos',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const calculateAmount = () => {
      setAmount(formValues.pu && formValues.qte ? Number(formValues.pu) * Number(formValues.qte) : 0);
    };

    calculateAmount();
  }, [amount, formValues.pu, formValues.qte, setAmount]);

  const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>,
    value: string | RecupType | null,
    // reason: AutocompleteChangeReason
  ) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        entre_id: value.uuid ?? '',
        unite: value.unite || 'kilos',
      });
    } else {
      setFormValues({
        ...formValues,
        entre_id: '',
        unite: 'kilos',
      });
    }
  };

  const itemDate = format(new Date(), 'yyyy-dd-MM');

  const handleAutoClientChange = (_: SyntheticEvent<Element, Event>,
    value: string | RecupType | null,
    // reason: AutocompleteChangeReason
  ) => {
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

  const [selectedOption, setSelectedOption] = useState<RecupType | null>(null);
  const [selectedClient, setSelectedClient] = useState<RecupType | null>(null);

  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientAddress: '',
    clientCoordonne: '',
    clientId: '',
    clientNumero: 0,
  });

  const handleChange = (selected: SingleValue<RecupType>) => {
    // Assurez-vous que "selected" contient la clé du prix unitaire, par exemple "pu"
    if (selected) {
      setFormValues(prev => ({
        ...prev,
        entre_id: selected.uuid || "",
        pu: selected.pu || 0,
        is_prix: selected.is_prix || false,
        unite: selected.unite || 'kilos',
        categorie_libelle: selected.categorie_libelle || "", // pour l'affichage dans le panier
        libelle: selected.libelle || "", // pour l'affichage dans le panier
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        entre_id: "",
        pu: 0,
        unite: '',
        categorie_libelle: '',
        libelle: '',
      }));
    }
    setSelectedOption(selected); // Met à jour l'état de l'option sélectionnée
  };

  const handleClient = (selected: SingleValue<RecupType>) => {
    setFormValues(prev => ({
      ...prev,
      client_id: selected?.uuid
    }));
    setSelectedClient(selected);

    if (selected) {
      setClientInfo({
        clientName: selected.nom || '', // Remplacez par la clé appropriée pour le nom
        clientAddress: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
        clientCoordonne: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
        clientId: selected?.uuid || '', // Remplacez par la clé appropriée pour l'adresse
        clientNumero: selected.numero || 0, // Remplacez par la clé appropriée pour l'adresse
      });
    } else {
      setClientInfo({ clientName: '', clientAddress: '', clientCoordonne: '', clientId: '', clientNumero: 0 });
    }
  };

  const { entresEntreprise: entres, refetch: refetchEntres } = useGetAllEntre(entreprise_uuid!)

  const ent = entres.filter(info => info.qte !== 0 && info.is_sortie);

  const [scannedCode, setScannedCode] = useState<string>('');
  const [open, openchange] = useState(false);

  const functionopen = () => {
    openchange(true);
  };
  const closeopen = () => {
    openchange(false);
  };

  const handleScanResult = (code: string) => {
    setScannedCode(code);
    // Optionnel : fermer le dialog après scan
    openchange(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formValues.entre_id || !formValues.qte) {
      return;
    }

    // Ajouter au panier au lieu d'envoyer directement
    const newItem: SortieType = {
      ...formValues,
      user_id: unUser.uuid,
    }

    setBasket([...basket, newItem]);

    setFormValues({
      ...formValues,
      qte: '',
      pu: '',
      entre_id: '',
      categorie_libelle: '',
      libelle: '',
    })

    setSelectedOption(null);
    setScannedCode("")
  };

  const handleFinalSubmit = async () => {
    if (basket.length === 0) return;

    // Snapshot des IDs existants avant enregistrement
    const idsBefore = new Set(
      sortiesEntreprise.map((s: any) => s.id).filter(Boolean)
    );

    // Sauvegarder les données de la transaction actuelle
    const currentBasket = [...basket];
    const currentTotal = basketTotalAmount;
    const currentQte = basketTotalQte;
    const currentPaymentMode = modePaiement;
    const currentClientName = clientInfo.clientName || (selectedClient?.nom ? String(selectedClient.nom) : '');
    const currentClientNumero = clientInfo.clientNumero || (selectedClient?.numero ? selectedClient.numero : 0);
    const currentClientId = clientInfo.clientId || (selectedClient?.uuid ? String(selectedClient.uuid) : '');
    const todayStr = format(new Date(), 'dd/MM/yyyy HH:mm');
    const autoInvoiceCode = `FAC-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsWithPayment = basket.map(item => ({ ...item, mode_paiement: modePaiement }));
    await ajoutSortie(itemsWithPayment as any);

    // Refetch pour obtenir les nouvelles sorties
    const result = await refetch();
    const freshSorties: any[] = result.data ?? [];

    // Sélectionner automatiquement les nouveaux IDs (ceux absents avant)
    const newIds = freshSorties
      .map((s: any) => s.id)
      .filter((id: number) => id !== undefined && !idsBefore.has(id));

    // Mettre à jour les sorties disponibles dans le store
    setSorties(freshSorties);

    // Préparer les données pour le modal et la facture
    const saleInfo = {
      clientName: currentClientName,
      clientNumero: currentClientNumero,
      clientId: currentClientId,
      totalAmount: currentTotal,
      totalQte: currentQte,
      itemCount: currentBasket.length,
      modePaiement: currentPaymentMode,
      newIds: newIds.length > 0 ? newIds : [],
      invoiceCode: autoInvoiceCode,
      date: todayStr,
    };

    setLastSaleDetails(saleInfo);
    setInvoicePaymentMode(currentPaymentMode);
    setGeneratedInvoiceNum(autoInvoiceCode);

    // Réinitialiser le formulaire de saisie et le panier
    setBasket([]);
    setModePaiement('Caisse');
    setSelectedOption(null);
    setScannedCode('');

    // Ouvrir le modal de proposition de facture
    setOpenPostSaleModal(true);
  };

  const handleGenerateInvoiceFromModal = () => {
    if (lastSaleDetails) {
      if (lastSaleDetails.newIds && lastSaleDetails.newIds.length > 0) {
        selectAllIds(lastSaleDetails.newIds);
      }
      setClientInfo({
        clientName: lastSaleDetails.clientName,
        clientAddress: '',
        clientCoordonne: '',
        clientId: lastSaleDetails.clientId,
        clientNumero: Number(lastSaleDetails.clientNumero) || 0,
      });
      setInvoicePaymentMode(lastSaleDetails.modePaiement);
      setGeneratedInvoiceNum(lastSaleDetails.invoiceCode);
      setShowInvoice(true);
    }
    setOpenPostSaleModal(false);

    // Défilement fluide vers la section facture
    setTimeout(() => {
      const invoiceElement = document.getElementById('section-facture-preview');
      if (invoiceElement) {
        invoiceElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleClosePostSaleModal = () => {
    setOpenPostSaleModal(false);
    setSelectedClient(null);
    setClientInfo({ clientName: '', clientAddress: '', clientCoordonne: '', clientId: '', clientNumero: 0 });
  };

  const removeItemFromBasket = (index: number) => {
    setBasket(basket.filter((_, i) => i !== index));
  };

  // Pour la remise

  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);

  const total = selectSorties?.reduce((acc, sortie) => {
    // Convertir prix_total en nombre ou utiliser 0 si invalide
    const prixTotal = sortie.prix_total ? parseFloat(String(sortie.prix_total)) : 0;
    return acc + prixTotal;
  }, 0);

  const [discountedTotal] = useState(total); // Total avec remise
  const [payerTotal] = useState(total); // Total avec remise
  // fin
  if (isLoading) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'w-300'}`}>
        <Skeleton className="mobile-loading" />
        <Skeleton animation="wave" className="mobile-loading" />
        <Skeleton animation={false} className="mobile-loading" />
      </Box>
    );
  }

  if (isError) {
    window.location.reload();
    return (
      <div className={`${isMobile ? 'mobile-p-4' : ''}`}>
        <Typography variant="h6" color="error" className="mobile-alert">
          Error ...
        </Typography>
      </div>
    );
  }

  if (sortiesEntreprise) {
    return (
      <div>
        {/* ── Page principale ── */}
        <Paper
          elevation={0}
          sx={{
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            marginTop: '24px',
            bgcolor: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 16,
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}>
                  <LocalAtmIcon style={{ fontSize: 20, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    Gestion des Sorties
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {reversedSorties.length} enregistrement{reversedSorties.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => { handleSaveSorties(); handleOnClick(); }}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    px: 3,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                      boxShadow: '0 6px 20px rgba(99,102,241,0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Créer Facture
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleOpenClick}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    px: 3,
                    py: 1.2,
                    borderColor: 'rgba(239,68,68,0.4)',
                    color: '#f87171',
                    '&:hover': {
                      background: 'rgba(239,68,68,0.08)',
                      borderColor: '#ef4444',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>

            {/* ── Filtres de dates ── */}
            {(unUser.role === 1 || unUser.role === 2) && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <TextField
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* ── Cartes KPI ── */}
            {unUser.role === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {/* CA */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.08) 100%)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
                    flexShrink: 0,
                  }}>
                    <LocalAtmIcon style={{ fontSize: 26, color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Chiffre d'affaires
                    </div>
                    <div style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {formatNumberWithSpaces(totalPrice)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginLeft: 4 }}>F</span>
                    </div>
                  </div>
                </div>

                {/* Quantité */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(16,185,129,0.4)',
                    flexShrink: 0,
                  }}>
                    <QuantityLimitsIcon style={{ fontSize: 26, color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Quantité totale
                    </div>
                    <div style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {formatNumberWithSpaces(totalQte)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Table Section ── */}
            <div>
              <TableSortie
                onSubmit={onSubmit}
                onChange={onChange}
                formValues={formValues}
                amount={amount}
                handleAutoCompleteChange={handleAutoCompleteChange}
                handleAutoClientChange={handleAutoClientChange}
                handleSaveSorties={handleSaveSorties}
                handleChange={handleChange}
                handleClient={handleClient}
                selectedOption={selectedOption}
                selectedClient={selectedClient}
                list={sortiesBoutic}
                ent={ent}
                scannedCode={scannedCode}
                functionopen={functionopen}
                open={open}
                handleScanResult={handleScanResult}
                closeopen={closeopen}
                basket={basket}
                handleFinalSubmit={handleFinalSubmit}
                removeItemFromBasket={removeItemFromBasket}
                basketTotalAmount={basketTotalAmount}
                basketTotalQte={basketTotalQte}
                modePaiement={modePaiement}
                setModePaiement={setModePaiement}
              />
            </div>

            {/* ── Pagination ── */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5) !important',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                  },
                }}
              />
            </div>

          </div>
        </Paper>

        {/* ── Modal Post-Enregistrement Vente / Proposition Facture ── */}
        <Dialog
          open={openPostSaleModal}
          onClose={handleClosePostSaleModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.15)',
              overflow: 'hidden',
              color: '#fff',
            }
          }}
        >
          {/* Header du Dialog */}
          <div style={{
            padding: '24px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(16,185,129,0.4)',
              }}>
                <CheckCircleIcon sx={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Achat enregistré avec succès !
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5 }}>
                  La transaction a été validée dans le stock.
                </Typography>
              </div>
            </div>
            <IconButton onClick={handleClosePostSaleModal} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' } }}>
              <CloseIcon />
            </IconButton>
          </div>

          <DialogContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Box récapitulatif transaction */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
                Récapitulatif de la transaction
              </div>

              {/* Ligne Client */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.85rem' }}>
                  <PersonIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                  <span>Client :</span>
                </div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>
                  {lastSaleDetails?.clientName || 'Client Comptoir'}
                  {lastSaleDetails?.clientNumero ? ` (${lastSaleDetails.clientNumero})` : ''}
                </div>
              </div>

              {/* Ligne Articles & Qté */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.85rem' }}>
                  <ShoppingBagIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                  <span>Articles vendus :</span>
                </div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.88rem' }}>
                  {lastSaleDetails?.itemCount || 0} référence(s) ({lastSaleDetails?.totalQte || 0} unités)
                </div>
              </div>

              {/* Ligne Mode de Paiement */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.85rem' }}>
                  <PaymentIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                  <span>Mode de règlement :</span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  {lastSaleDetails?.modePaiement || 'Caisse'}
                </div>
              </div>

              {/* Ligne Réf Facture suggérée */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.85rem' }}>
                  <ReceiptIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                  <span>Réf. Facture :</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
                  {lastSaleDetails?.invoiceCode}
                </div>
              </div>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 0.5 }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1' }}>Montant Total :</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumberWithSpaces(lastSaleDetails?.totalAmount || 0)} FCFA
                </span>
              </div>
            </div>

            {/* Question d'invitation */}
            <div style={{
              textAlign: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              <Typography sx={{ color: '#e0e7ff', fontWeight: 600, fontSize: '0.92rem' }}>
                📄 Souhaitez-vous générer et imprimer la facture maintenant ?
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', mt: 0.5 }}>
                Toutes les informations et le mode de règlement seront pré-remplis automatiquement.
              </Typography>
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexDirection: isMobile ? 'column' : 'row' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateInvoiceFromModal}
                startIcon={<ReceiptIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    boxShadow: '0 8px 25px rgba(99,102,241,0.5)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Générer la Facture
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleClosePostSaleModal}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#cbd5e1',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Non, terminer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Aperçu Facture ── */}
        {showInvoice && entreprise && (
          <div id="section-facture-preview" style={{ marginTop: 16 }}>
            <Fact
              invoiceDate={itemDate}
              post={entreprise}
              discountedTotal={discountedTotal}
              payerTotal={payerTotal}
              clientName={clientInfo.clientName}
              invoiceNumber={clientInfo.clientNumero}
              clientId={clientInfo.clientId}
              modePaiement={invoicePaymentMode || lastSaleDetails?.modePaiement || modePaiement}
              numeroFac={generatedInvoiceNum || lastSaleDetails?.invoiceCode}
            />
          </div>
        )}
      </div>
    );
  }
}
